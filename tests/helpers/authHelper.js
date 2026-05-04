require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const app = require('../../src/app');

let _counter = 0;
const uniqueEmail = () => `test_${Date.now()}_${++_counter}@jobapp.test`;

const buildUser = (overrides = {}) => ({
  name: 'Test User',
  email: uniqueEmail(),
  password: 'TestPass1234',
  ...overrides,
});

/**
 * Registers a new user and returns credentials + JWT tokens.
 * Each call generates a unique email to guarantee test isolation.
 */
const createUserAndLogin = async (overrides = {}) => {
  const userData = buildUser(overrides);

  const registerRes = await request(app)
    .post('/api/v1/users/register')
    .send(userData);

  if (registerRes.status !== 201) {
    throw new Error(`Register failed (${registerRes.status}): ${JSON.stringify(registerRes.body)}`);
  }

  const loginRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: userData.email, password: userData.password });

  if (loginRes.status !== 200) {
    throw new Error(`Login failed (${loginRes.status}): ${JSON.stringify(loginRes.body)}`);
  }

  return {
    user: loginRes.body.user,
    token: loginRes.body.accessToken,
    refreshToken: loginRes.body.refreshToken,
    credentials: { email: userData.email, password: userData.password },
  };
};

module.exports = { createUserAndLogin, buildUser, uniqueEmail };
