const fs = require('fs');
const path = require('path');

const exampleMetricsPath = path.resolve(__dirname, '../../metrics/newman/example-run.json');

describe('Newman metrics artifact contract', () => {
  test('example metrics include endpoint SLA records', () => {
    const metrics = JSON.parse(fs.readFileSync(exampleMetricsPath, 'utf8'));

    expect(metrics.totals.slaCompliancePercent).toBeGreaterThanOrEqual(95);
    expect(metrics.endpoints).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          endpoint: '/health',
          method: 'GET',
          responseTimeMs: expect.any(Number),
          statusCode: 200,
          sla: expect.objectContaining({
            name: 'Response time under 300ms',
            passed: true,
          }),
        }),
      ])
    );
  });
});
