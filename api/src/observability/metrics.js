const client = require('prom-client');

const serviceStartedAt = new Date();
const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: 'api_observability_',
});

const requestCounter = new client.Counter({
  name: 'api_request_count',
  help: 'Total HTTP requests processed by the API.',
  labelNames: ['method', 'route', 'status_code'],
});

const errorCounter = new client.Counter({
  name: 'api_error_count',
  help: 'Total HTTP responses with status code >= 400.',
  labelNames: ['method', 'route', 'status_code'],
});

const responseTimeHistogram = new client.Histogram({
  name: 'api_response_time_seconds',
  help: 'HTTP response time distribution by route.',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
});

const endpointLatencyGauge = new client.Gauge({
  name: 'api_endpoint_latency_ms',
  help: 'Last observed latency for each endpoint in milliseconds.',
  labelNames: ['method', 'route'],
});

const uptimeGauge = new client.Gauge({
  name: 'api_uptime_seconds',
  help: 'Application uptime in seconds.',
});

register.registerMetric(requestCounter);
register.registerMetric(errorCounter);
register.registerMetric(responseTimeHistogram);
register.registerMetric(endpointLatencyGauge);
register.registerMetric(uptimeGauge);

function metricsMiddleware(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const route = normalizeRoute(req);
    const durationSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    requestCounter.inc(labels);
    responseTimeHistogram.observe(labels, durationSeconds);
    endpointLatencyGauge.set({ method: req.method, route }, durationSeconds * 1000);
    uptimeGauge.set(process.uptime());

    if (res.statusCode >= 400) {
      errorCounter.inc(labels);
    }
  });

  next();
}

async function metricsHandler(req, res) {
  uptimeGauge.set(process.uptime());
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

function normalizeRoute(req) {
  if (req.route && req.route.path) {
    return req.baseUrl + req.route.path;
  }

  return req.path || 'unknown';
}

module.exports = {
  metricsMiddleware,
  metricsHandler,
  serviceStartedAt,
  register,
};
