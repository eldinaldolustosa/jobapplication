const BASE = '/api/v1';

Cypress.Commands.add('register', (userData) => {
  return cy.request({
    method: 'POST',
    url: `${BASE}/users/register`,
    body: userData,
    failOnStatusCode: false,
  });
});

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

Cypress.Commands.add('createJobApplication', (payload) => {
  const defaults = {
    company: `Cypress Corp ${Date.now()}`,
    position: 'QA Engineer',
    applicationDate: new Date().toISOString().split('T')[0],
  };
  return cy.api('POST', `${BASE}/job-applications`, { ...defaults, ...payload });
});

Cypress.Commands.add('addStage', (appId, stagePayload) => {
  return cy.api('POST', `${BASE}/job-applications/${appId}/stages`, stagePayload);
});

Cypress.Commands.add('createLinkedinCompany', (payload) => {
  const defaults = {
    name: `Cypress Company ${Date.now()}`,
    linkedinUrl: `https://www.linkedin.com/company/cy-test-${Date.now()}`,
  };
  return cy.api('POST', `${BASE}/linkedin/companies`, { ...defaults, ...payload });
});

Cypress.Commands.add('createLinkedinContact', (payload) => {
  const defaults = {
    name: `Cypress Contact ${Date.now()}`,
    linkedinUrl: `https://www.linkedin.com/in/cy-contact-${Date.now()}`,
    type: 'Recrutador',
  };
  return cy.api('POST', `${BASE}/linkedin/contacts`, { ...defaults, ...payload });
});
