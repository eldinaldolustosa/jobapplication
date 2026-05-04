/**
 * Auth Layer — Supertest Integration Tests
 * US02: Autenticar usuário e obter token JWT (JOBAPP-7)
 *
 * Covers: POST /api/v1/auth/login | POST /api/v1/auth/refresh
 */
require('dotenv').config({ path: '.env.test' });
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearCollections, closeTestDB } = require('../helpers/dbHelper');
const { createUserAndLogin, buildUser } = require('../helpers/authHelper');

describe('[AUTH] Authentication Layer', () => {
  let registeredCredentials;

  before(async () => {
    await connectTestDB();
    await clearCollections('users');
    // Pre-create a known user for login tests
    const { credentials } = await createUserAndLogin();
    registeredCredentials = credentials;
  });

  after(async () => {
    await clearCollections('users');
    await closeTestDB();
  });

  // ─── POST /api/v1/auth/login ───────────────────────────────────────────────

  describe('POST /api/v1/auth/login', () => {
    it('US02-001 | should return 200 with accessToken and refreshToken for valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(registeredCredentials);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('accessToken').that.is.a('string');
      expect(res.body).to.have.property('refreshToken').that.is.a('string');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.not.have.property('password');
    });

    it('US02-002 | should return JWT payload containing sub (userId)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(registeredCredentials);

      const payload = JSON.parse(
        Buffer.from(res.body.accessToken.split('.')[1], 'base64').toString()
      );
      expect(payload).to.have.property('sub').that.is.a('string');
      expect(payload).to.have.property('exp');
    });

    it('US02-003 | should return 401 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: registeredCredentials.email, password: 'WrongPass999' });

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Credenciais inválidas');
    });

    it('US02-004 | should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'ghost@nowhere.test', password: 'AnyPass1234' });

      expect(res.status).to.equal(401);
      // Same message as wrong password — prevents user enumeration (anti-enumeration)
      expect(res.body.message).to.equal('Credenciais inválidas');
    });

    it('US02-005 | should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'TestPass1234' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors').that.is.an('array');
    });

    it('US02-006 | should return 400 when password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: registeredCredentials.email });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors').that.is.an('array');
    });

    it('US02-007 | should return 400 for malformed email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'TestPass1234' });

      expect(res.status).to.equal(400);
    });
  });

  // ─── POST /api/v1/auth/refresh ────────────────────────────────────────────

  describe('POST /api/v1/auth/refresh', () => {
    let validRefreshToken;

    before(async () => {
      const { refreshToken } = await createUserAndLogin();
      validRefreshToken = refreshToken;
    });

    it('US02-008 | should return 200 with new tokens for valid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: validRefreshToken });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('accessToken').that.is.a('string');
      expect(res.body).to.have.property('refreshToken').that.is.a('string');
    });

    it('US02-009 | should return 401 for an invalid refresh token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid.token.string' });

      expect(res.status).to.equal(401);
    });

    it('US02-010 | should return 400 when refreshToken is missing from body', async () => {
      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .send({});

      expect(res.status).to.equal(400);
    });
  });

  // ─── Protected route access ───────────────────────────────────────────────

  describe('JWT Guard — Protected Routes', () => {
    it('US02-011 | should return 401 when Authorization header is absent', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Token de autenticação não fornecido');
    });

    it('US02-012 | should return 401 for malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer this.is.not.valid');

      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Token inválido');
    });

    it('US02-013 | should return 200 when a valid token is provided', async () => {
      const { token } = await createUserAndLogin();
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
    });
  });
});
