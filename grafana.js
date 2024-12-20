import http from 'k6/http';
import { check, fail } from 'k6';

// Base URL for API requests
const baseUrl = 'https://htprdapi.hightable.ai';

export const options = {
  scenarios: {
    auth_and_table_view: {
      executor: 'ramping-vus', // Adjust VUs over time
      startVUs: 1, // Start with 1 VU
      stages: [
        { duration: '1m', target: 10 }, // Ramp up to 10 VUs in 1 minute
        { duration: '2m', target: 10 }, // Stay at 10 VUs for 2 minutes
        { duration: '1m', target: 0 },  // Ramp down to 0 VUs in 1 minute
      ],
      gracefulStop: '30s', // Time to allow in-progress iterations to complete
      tags: { scenario: 'auth_and_table_view' }, // Tag for scenario-specific metrics
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.02'], // Less than 2% of requests should fail
    http_req_duration: ['p(95)<2000', 'p(99)<2500'], // 95% under 2 seconds, 99% under 2.5 seconds
  },
};

// Helper function to generate Authorization headers
function getAuthHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

// Helper function to build URLs
function buildUrl(endpoint, queryParams = {}) {
  const queryString = Object.entries(queryParams)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
  return `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ''}`;
}

// API configuration object
const apiConfig = {
  authApi: {
    method: 'post',
    endpoint: '/oauth/token',
    headers: { 'Content-Type': 'application/json' },
    payload: {
      client_id: 'CLIENT002',
      client_secret: '5PY02KdOpCX5FO93jSjPa7gKsBvQF',
      is_signup: false,
      login_type: 'phone',
      grant_type: 'password',
      password: '7799',
      username: '9999912345',
    },
    check: (response) =>
      check(response, {
        'login success': (r) => r.status === 200,
      }),
  },
  tableListApi: {
    method: 'get',
    endpoint: '/tables/list',
    check: (response) =>
      check(response, {
        'table list retrieved': (r) => r.status === 200,
      }),
  },
  tableViewApi: {
    method: 'get',
    endpoint: '/tables/view',
    check: (response) =>
      check(response, {
        'table view retrieved': (r) => r.status === 200,
      }),
  },
};

// Main function for test execution
export default function () {
  // Authenticate to get an access token
  const authPayload = JSON.stringify(apiConfig.authApi.payload);
  const authResponse = http.post(`${baseUrl}${apiConfig.authApi.endpoint}`, authPayload, {
    headers: apiConfig.authApi.headers,
  });

  if (!apiConfig.authApi.check(authResponse)) {
    fail('Authentication failed');
  }

  // Extract the access token
  // @ts-ignore

  const accessToken = JSON.parse(authResponse.body).access_token;
  if (!accessToken) {
    fail('Access token not found in response');
  }

  // Fetch table list
  const tableListUrl = buildUrl(apiConfig.tableListApi.endpoint);
  const tableListResponse = http.get(tableListUrl, {
    headers: getAuthHeaders(accessToken),
    tags: { action: 'table_list' },
  });

  if (!apiConfig.tableListApi.check(tableListResponse)) {
    fail('Failed to retrieve table list');
  }

  // Fetch table view
  const tableViewUrl = buildUrl(apiConfig.tableViewApi.endpoint, { id: 951 });
  const tableViewResponse = http.get(tableViewUrl, {
    headers: getAuthHeaders(accessToken),
    tags: { action: 'table_view' },
  });
}
