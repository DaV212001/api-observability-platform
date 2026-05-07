const fs = require('fs');
const path = require('path');
const newman = require('newman');

const collectionPath = path.resolve(__dirname, '../../postman/api-observability.postman_collection.json');
const environmentPath = path.resolve(__dirname, '../../postman/local.postman_environment.json');
const outputDir = path.resolve(__dirname, '../../metrics/newman');
const latestRunPath = path.join(outputDir, 'latest-run.json');
const summaryPath = path.join(outputDir, 'latest-summary.json');

fs.mkdirSync(outputDir, { recursive: true });

newman.run(
  {
    collection: collectionPath,
    environment: environmentPath,
    reporters: ['cli', 'json'],
    reporter: {
      json: {
        export: latestRunPath,
      },
    },
  },
  (error, summary) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }

    const endpointMetrics = summary.run.executions.map((execution) => {
      const responseTime = execution.response.responseTime;
      const statusCode = execution.response.code;
      const slaPass = responseTime < 300 && statusCode < 400;
      const requestUrl = execution.request.url || execution.item.request.url;
      const endpointPath = Array.isArray(requestUrl.path)
        ? `/${requestUrl.path.join('/')}`
        : new URL(requestUrl.toString()).pathname;

      return {
        endpoint: endpointPath,
        method: execution.item.request.method,
        responseTimeMs: responseTime,
        statusCode,
        timestamp: new Date().toISOString(),
        sla: {
          name: 'Response time under 300ms',
          thresholdMs: 300,
          passed: slaPass,
        },
      };
    });

    const result = {
      runId: summary.run.stats.assertions.failed === 0 ? 'synthetic-pass' : 'synthetic-fail',
      generatedAt: new Date().toISOString(),
      collection: 'API Observability Platform - Synthetic SLA Suite',
      totals: {
        requests: summary.run.stats.requests.total,
        failedAssertions: summary.run.stats.assertions.failed,
        averageResponseTimeMs: Math.round(
          endpointMetrics.reduce((total, metric) => total + metric.responseTimeMs, 0) / endpointMetrics.length
        ),
        slaCompliancePercent: Math.round(
          (endpointMetrics.filter((metric) => metric.sla.passed).length / endpointMetrics.length) * 100
        ),
      },
      endpoints: endpointMetrics,
    };

    fs.writeFileSync(summaryPath, `${JSON.stringify(result, null, 2)}\n`);

    if (summary.run.failures.length > 0) {
      process.exit(1);
    }
  }
);
