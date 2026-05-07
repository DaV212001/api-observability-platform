const request = require('supertest');
const { createApp } = require('../../api/src/app');

const app = createApp();

describe('API Observability Platform', () => {
  test('GET /health returns service health and monitoring checks', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('healthy');
    expect(response.body.checks.metrics).toBe('pass');
    expect(response.headers['x-response-time']).toMatch(/ms$/);
  });

  test('GET /users returns realistic user data', async () => {
    const response = await request(app).get('/users');

    expect(response.status).toBe(200);
    expect(response.body.count).toBeGreaterThan(0);
    expect(response.body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        email: expect.stringContaining('@'),
        role: expect.any(String),
      })
    );
  });

  test('GET /posts returns observability-flavored content', async () => {
    const response = await request(app).get('/posts');

    expect(response.status).toBe(200);
    expect(response.body.data.some((post) => post.tags.includes('sla'))).toBe(true);
  });

  test('POST /posts validates and creates a post', async () => {
    const response = await request(app)
      .post('/posts')
      .send({
        title: 'Synthetic uptime tracker update',
        body: 'Jest validates the write path and response contract.',
        authorId: 1,
        tags: ['uptime', 'automation'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('published');
    expect(response.body.message).toContain('accepted');
  });

  test('POST /posts returns validation errors for invalid payloads', async () => {
    const response = await request(app).post('/posts').send({ title: 'Incomplete' });

    expect(response.status).toBe(422);
    expect(response.body.error).toContain('title, body, and authorId');
  });

  test('GET /metrics exposes Prometheus metrics', async () => {
    await request(app).get('/users');
    const response = await request(app).get('/metrics');

    expect(response.status).toBe(200);
    expect(response.text).toContain('api_request_count');
    expect(response.text).toContain('api_response_time_seconds');
    expect(response.text).toContain('api_endpoint_latency_ms');
  });
});
