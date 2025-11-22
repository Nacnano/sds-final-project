import http from 'k6/http';
import { check } from 'k6';
import { URL_TESTS } from './utils/constants.js';

/**
 * ===========================================================
 *  K6 BACKEND LOAD TEST – 100K USER READY
 * ===========================================================
 *  How to run:
 *   • Local small test:   k6 run backend-load-test.js
 *   • Cloud (100k users): k6 cloud backend-load-test.js
 *   • Self-hosted:        Split vus across multiple runners
 *
 *  Env vars:
 *   BASE_URL=https://staging.api.example.com
 *   AUTH_TOKEN=<optional Bearer token>
 * 
 *  Run command:
 *  k6 run --out cloud tools/scripts/k6-load-test.js
 */



const BASE_URL = __ENV.BASE_URL || 'https://localhost:30000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const VUS = __ENV.VUS || 100;
const DURATION = __ENV.LOAD_TEST_DURATION || '1m';

export const options = {
  scenarios: {
    massive_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 }, // warm-up
        { duration: '1m', target: VUS/10 }, // moderate
        { duration: DURATION, target: VUS },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% failures
    http_req_duration: ['p(95)<800'], // 95% under 800 ms
    http_reqs: ['count>0'], // ensure requests sent
  },
  noConnectionReuse: false,
  discardResponseBodies: true, // reduce memory usage
};

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
};

export default function () {
  for (const url of URL_TESTS) {
    const res = http.get(`${BASE_URL}${url}`, { headers });

    check(res, {
      'status is success': (r) => r.status >= 200 && r.status < 300,
      'response time < 2000ms': (r) => r.timings.duration < 2000,
    });
  }
}