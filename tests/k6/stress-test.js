import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 25 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export default function stressTest() {
  const responses = http.batch([
    ['GET', `${baseUrl}/health`],
    ['GET', `${baseUrl}/users`],
    ['GET', `${baseUrl}/posts`],
  ]);

  responses.forEach((response) => {
    check(response, {
      'status is below 400': (res) => res.status < 400,
      'Response time under 300ms': (res) => res.timings.duration < 300,
    });
  });

  sleep(1);
}
