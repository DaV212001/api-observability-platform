import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 80 },
    { duration: '20s', target: 80 },
    { duration: '20s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.03'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export default function spikeTest() {
  const payload = JSON.stringify({
    title: 'Spike load synthetic post',
    body: 'k6 spike traffic validates the write path during burst conditions.',
    authorId: 2,
    tags: ['k6', 'spike', 'load-testing'],
  });

  const response = http.post(`${baseUrl}/posts`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(response, {
    'created or accepted response': (res) => res.status === 201,
    'Spike response time under 500ms': (res) => res.timings.duration < 500,
  });

  sleep(1);
}
