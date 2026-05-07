const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const {
  metricsMiddleware,
  metricsHandler,
  serviceStartedAt,
} = require('./observability/metrics');
const users = require('./data/users');
const posts = require('./data/posts');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(assignRequestId);
  app.use(responseTimer);
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms req_id=:req[id]'));
  app.use(metricsMiddleware);

  app.get('/health', (req, res) => {
    const uptimeSeconds = Math.round(process.uptime());

    res.json({
      status: 'healthy',
      service: 'api-observability-platform',
      version: '1.0.0',
      uptimeSeconds,
      startedAt: serviceStartedAt.toISOString(),
      timestamp: new Date().toISOString(),
      checks: {
        api: 'pass',
        metrics: 'pass',
        syntheticMonitoring: 'pass',
      },
    });
  });

  app.get('/users', async (req, res) => {
    await simulateLatency(45, 90);
    res.json({
      data: users,
      count: users.length,
      traceId: req.id,
    });
  });

  app.get('/posts', async (req, res) => {
    await simulateLatency(60, 130);
    res.json({
      data: posts,
      count: posts.length,
      traceId: req.id,
    });
  });

  app.post('/posts', async (req, res, next) => {
    try {
      await simulateLatency(80, 160);
      const { title, body, authorId, tags = [] } = req.body;

      if (!title || !body || !authorId) {
        const validationError = new Error('title, body, and authorId are required');
        validationError.status = 422;
        throw validationError;
      }

      const createdPost = {
        id: posts.length + 1,
        title,
        body,
        authorId,
        tags,
        status: 'published',
        createdAt: new Date().toISOString(),
      };

      res.status(201).json({
        data: createdPost,
        message: 'Post accepted by publishing API',
        traceId: req.id,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/metrics', metricsHandler);

  app.use((req, res) => {
    res.status(404).json({
      error: 'Route not found',
      path: req.originalUrl,
      traceId: req.id,
      timestamp: new Date().toISOString(),
    });
  });

  app.use((err, req, res, next) => {
    const status = err.status || 500;

    res.status(status).json({
      error: err.message || 'Internal Server Error',
      status,
      traceId: req.id,
      timestamp: new Date().toISOString(),
    });

    next();
  });

  return app;
}

function assignRequestId(req, res, next) {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-Id', req.id);
  next();
}

function responseTimer(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const writeHead = res.writeHead;

  res.writeHead = function writeHeadWithTiming(...args) {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    res.setHeader('X-Response-Time', `${durationMs.toFixed(2)}ms`);
    return writeHead.apply(this, args);
  };

  next();
}

function simulateLatency(minMs, maxMs) {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

module.exports = { createApp };
