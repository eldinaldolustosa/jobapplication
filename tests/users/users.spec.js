/**
 * Users Layer — Supertest Integration Tests
 * US01: Registrar novo usuário na plataforma (JOBAPP-6)
 *
 * Covers: POST /api/v1/users/register | GET /api/v1/users/me
 */
require('dotenv').config({ path: '.env.test' });
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearCollections, closeTestDB } = require('../helpers/dbHelper');
const { createUserAndLogin, uniqueEmail } = require('../helpers/authHelper');

describe('[USERS] Users Layer', () => {
  before(async () => {
    await connectTestDB();
    await clearCollections('users');
  });

  afterEach(async () => {
    await clearCollections('users');
  });

  after(async () => {
    await closeTestDB();
  });

  // ─── POST /api/v1/users/register ─────────────────────────────────────────

  describe('POST /api/v1/users/register', () => {
    it('US01-001 | should return 201 and user object for valid registration data', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Eddie Lustosa', email: uniqueEmail(), password: 'Eddie1234' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('message', 'Usuário cadastrado com sucesso');
      expect(res.body.user).to.include.keys('_id', 'name', 'email', 'createdAt');
    });

    it('US01-002 | should never return password in the response body', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Security Test', email: uniqueEmail(), password: 'SecurePass1' });

      expect(res.status).to.equal(201);
      expect(res.body.user).to.not.have.property('password');
    });

    it('US01-003 | should return 409 Conflict when email is already registered', async () => {
      const email = uniqueEmail();
      await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'First User', email, password: 'FirstPass1' });

      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Duplicate User', email, password: 'DupPass123' });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal('E-mail já cadastrado');
    });

    it('US01-004 | should return 400 when password has fewer than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Short Pass', email: uniqueEmail(), password: 'ab1' });

      expect(res.status).to.equal(400);
      const errorMessages = res.body.errors.map((e) => e.message);
      expect(errorMessages.join(' ')).to.include('8');
    });

    it('US01-005 | should return 400 when password contains no numbers', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'No Number', email: uniqueEmail(), password: 'abcdefghij' });

      expect(res.status).to.equal(400);
      const errorMessages = res.body.errors.map((e) => e.message);
      expect(errorMessages.join(' ')).to.include('número');
    });

    it('US01-006 | should return 400 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'Bad Email', email: 'not-an-email', password: 'ValidPass1' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('errors').that.is.an('array');
    });

    it('US01-007 | should return 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ email: uniqueEmail(), password: 'ValidPass1' });

      expect(res.status).to.equal(400);
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).to.include('name');
    });

    it('US01-008 | should return 400 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({ name: 'No Email', password: 'ValidPass1' });

      expect(res.status).to.equal(400);
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).to.include('email');
    });

    it('US01-009 | should return 400 when all fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/users/register')
        .send({});

      expect(res.status).to.equal(400);
      expect(res.body.errors.length).to.be.greaterThan(1);
    });
  });

  // ─── GET /api/v1/users/me ─────────────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('US01-010 | should return 200 and user profile for authenticated user', async () => {
      const { token, user } = await createUserAndLogin();
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body.user._id).to.equal(user._id);
      expect(res.body.user).to.not.have.property('password');
    });

    it('US01-011 | should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/users/me');
      expect(res.status).to.equal(401);
    });

    it('US01-012 | should return 401 for invalid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer garbage.token.here');

      expect(res.status).to.equal(401);
    });
  });
});
