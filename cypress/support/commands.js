/**
 * Custom Cypress Commands — JobApplication API
 * Reusable commands for API interaction across all test layers.
 */

const BASE = '/api/v1';

// ─── Auth Commands ────────────────────────────────────────────────────────────

/** Register a new user. Returns the full response. */
Cypress.Commands.add('register', (userData) => {
  return cy.request({
    method: 'POST',
    url: `${BASE}/users/register`,
    body: userData,
    failOnStatusCode: false,
  });
});

/** Login and store tokens in Cypress.env. Returns the full response. */
Cypress.Commands.add('login', (credentials) => {
  return cy.request({
    method: 'POST',
    url: `${BASE}/auth/login`,
    body: credentials,
    failOnStatusCode: false,
  }).then((res) => {
    if (res.status === 200) {
      Cypress.env('accessToken', res.body.accessToken);
      Cypress.env('refreshToken', res.body.refreshToken);
      Cypress.env('userId', res.body.user._id);
    }
    return res;
  });
});

/** Register + Login in one step. Returns { token, refreshToken, userId }. */
Cypress.Commands.add('registerAndLogin', (overrides = {}) => {
  const ts = Date.now();
  const userData = {
    name: 'Cypress User',
    email: `cy_${ts}@jobapp.test`,
    password: 'CypressPass1',
    ...overrides,
  };
  return cy.register(userData).then(() => {
    return cy.login({ email: userData.email, password: userData.password }).then((res) => {
      return {
        token: res.body.accessToken,
        refreshToken: res.body.refreshToken,
        userId: res.body.user._id,
        credentials: { email: userData.email, password: userData.password },
      };
    });
  });
});

// ─── Generic Authenticated Request ───────────────────────────────────────────

/** Make an authenticated API request. Uses Cypress.env('accessToken') by default. */
Cypress.Commands.add('api', (method, url, body = null, tokenOverride = null) => {
  const token = tokenOverride || Cypress.env('accessToken');
  const options = {
    method,
    url,
    failOnStatusCode: false,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
  if (body) options.body = body;
  return cy.request(options);
});

// ─── Job Application Commands ─────────────────────────────────────────────────

/** Create a job application with the authenticated user's token. */
Cypress.Commands.add('createJobApplication', (payload) => {
  const defaults = {
    company: `Cypress Corp ${Date.now()}`,
    position: 'QA Engineer',
    applicationDate: new Date().toISOString().split('T')[0],
  };
  return cy.api('POST', `${BASE}/job-applications`, { ...defaults, ...payload });
});

/** Register a stage for a job application. */
Cypress.Commands.add('addStage', (appId, stagePayload) => {
  return cy.api('POST', `${BASE}/job-applications/${appId}/stages`, stagePayload);
});

// ─── LinkedIn Commands ────────────────────────────────────────────────────────

/** Create a LinkedIn company profile. */
Cypress.Commands.add('createLinkedinCompany', (payload) => {
  const defaults = {
    name: `Cypress Company ${Date.now()}`,
    linkedinUrl: `https://www.linkedin.com/company/cy-test-${Date.now()}`,
  };
  return cy.api('POST', `${BASE}/linkedin/companies`, { ...defaults, ...payload });
});

/** Create a LinkedIn contact profile. */
Cypress.Commands.add('createLinkedinContact', (payload) => {
  const defaults = {
    name: `Cypress Contact ${Date.now()}`,
    linkedinUrl: `https://www.linkedin.com/in/cy-contact-${Date.now()}`,
    type: 'Recrutador',
  };
  return cy.api('POST', `${BASE}/linkedin/contacts`, { ...defaults, ...payload });
});
