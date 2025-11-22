import http from 'k6/http';
import { check, sleep } from 'k6';
import { URL_TESTS } from './utils/constants.js';

/**
 * ===========================================================
 *  K6 BACKEND STRESS TEST
 * ===========================================================
 *  Purpose:
 *   - Ramp the system up to a high number of virtual users and
 *     sustain them to discover breaking points and resource limits.
 *
 *  How to run:
 *   • Local quick run: k6 run testing/scripts/k6-stress-test.js
 *   • Cloud:           k6 cloud testing/scripts/k6-stress-test.js
 *
 *  Env vars:
 *   BASE_URL=https://staging.api.example.com
 *   AUTH_TOKEN=<optional Bearer token>
 *   VUS=<max VUs as integer, default 2000>
 *   RAMP_UP_MINUTES=<minutes to ramp to max VUs, default 10>
 *   SUSTAIN_MINUTES=<minutes to hold max VUs, default 10>
 */

const BASE_URL = __ENV.BASE_URL || 'https://localhost:30000';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || '';
const MAX_VUS = parseInt(__ENV.VUS, 10) || 2000;
const RAMP_UP_MINUTES = parseInt(__ENV.STRESS_TEST_RAMP_UP_MINUTES, 10) || 10;
const SUSTAIN_MINUTES = parseInt(__ENV.STRESS_TEST_SUSTAIN_MINUTES, 10) || 10;

// Build a set of ramp stages to gradually reach MAX_VUS then sustain
const rampUpStages = [
  { duration: '1m', target: 50 }, // warm-up
  { duration: `${Math.max(1, Math.floor(RAMP_UP_MINUTES / 3))}m`, target: Math.max(100, Math.floor(MAX_VUS / 10)) },
  { duration: `${Math.max(1, Math.floor(RAMP_UP_MINUTES / 3))}m`, target: Math.max(200, Math.floor(MAX_VUS / 3)) },
  { duration: `${Math.max(1, Math.floor(RAMP_UP_MINUTES / 3))}m`, target: MAX_VUS },
];

export const options = {
  scenarios: {
    stress_ramp: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        ...rampUpStages,
        { duration: `${SUSTAIN_MINUTES}m`, target: MAX_VUS }, // sustain the peak load
        { duration: '2m', target: 0 }, // flush down
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    // For a stress test we tolerate a slightly higher failure rate while identifying the breaking point.
    http_req_failed: ['rate<0.05'], // less than 5% failures
    http_req_duration: ['p(90)<3000'], // 90% under 3s (relaxed for stress)
    http_reqs: ['count>0'],
  },
  noConnectionReuse: false,
  discardResponseBodies: true,
};

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_TOKEN && { Authorization: `Bearer ${AUTH_TOKEN}` }),
};

export default function () {
  for (const url of URL_TESTS) {
    const res = http.get(`${BASE_URL}${url}`, { headers });

    check(res, {
      'status is 2xx': (r) => r.status >= 200 && r.status < 300,
      'response time < 5000ms': (r) => r.timings.duration < 5000,
    });

    // Small sleep to avoid hammering one endpoint too tightly per VU loop
    sleep(Math.random() * 1);
  }
}
