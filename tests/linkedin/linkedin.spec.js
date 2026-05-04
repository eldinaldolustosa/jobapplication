/**
 * LinkedIn Layer — Supertest Integration Tests
 * US06: Cadastrar perfil LinkedIn de empresa (JOBAPP-11)
 * US07: Cadastrar perfil LinkedIn de recrutador/colaborador (JOBAPP-12)
 *
 * Covers: CRUD /api/v1/linkedin/companies | CRUD /api/v1/linkedin/contacts
 */
require('dotenv').config({ path: '.env.test' });
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/app');
const { connectTestDB, clearCollections, closeTestDB } = require('../helpers/dbHelper');
const { createUserAndLogin } = require('../helpers/authHelper');
const fixtures = require('../fixtures/linkedin.json');

const COMPANIES = '/api/v1/linkedin/companies';
const CONTACTS = '/api/v1/linkedin/contacts';

const uniqueCompanyUrl = () =>
  `https://www.linkedin.com/company/test-co-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const uniqueContactUrl = () =>
  `https://www.linkedin.com/in/test-contact-${Date.now()}-${Math.random().toString(36).slice(2)}`;

describe('[LINKEDIN] LinkedIn Layer', () => {
  let token, otherToken;

  before(async () => {
    await connectTestDB();
    await clearCollections('users', 'linkedincompanies', 'linkedincontacts');
  });

  beforeEach(async () => {
    await clearCollections('linkedincompanies', 'linkedincontacts');
    const auth = await createUserAndLogin();
    token = auth.token;
    const other = await createUserAndLogin();
    otherToken = other.token;
  });

  after(async () => {
    await clearCollections('users', 'linkedincompanies', 'linkedincontacts');
    await closeTestDB();
  });

  // ─── POST /api/v1/linkedin/companies ─────────────────────────────────────

  describe('POST /api/v1/linkedin/companies', () => {
    it('US06-001 | should return 201 and persist LinkedIn company profile', async () => {
      const payload = { ...fixtures.validCompany, linkedinUrl: uniqueCompanyUrl() };
      const res = await request(app)
        .post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).to.equal(201);
      expect(res.body).to.include.keys('_id', 'name', 'linkedinUrl');
      expect(res.body.name).to.equal(fixtures.validCompany.name);
    });

    it('US06-002 | should return 409 when same LinkedIn URL is registered twice by same user', async () => {
      const url = uniqueCompanyUrl();
      await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp A', linkedinUrl: url });

      const res = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp A duplicate', linkedinUrl: url });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal('Empresa já cadastrada');
    });

    it('US06-003 | should allow same URL to be used by two different users', async () => {
      const url = uniqueCompanyUrl();
      const r1 = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp A', linkedinUrl: url });

      const r2 = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Corp A', linkedinUrl: url });

      expect(r1.status).to.equal(201);
      expect(r2.status).to.equal(201);
    });

    it('US06-004 | should return 400 for URL not matching linkedin.com/company/ pattern', async () => {
      const res = await request(app)
        .post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.invalidCompanyUrl);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('linkedin.com/company');
    });

    it('US06-005 | should return 400 when company name is missing', async () => {
      const res = await request(app)
        .post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ linkedinUrl: uniqueCompanyUrl() });

      expect(res.status).to.equal(400);
    });

    it('US06-006 | should return 401 without authentication token', async () => {
      const res = await request(app).post(COMPANIES).send(fixtures.validCompany);
      expect(res.status).to.equal(401);
    });
  });

  // ─── GET /api/v1/linkedin/companies ──────────────────────────────────────

  describe('GET /api/v1/linkedin/companies', () => {
    it('US06-007 | should return 200 and list only the authenticated user\'s companies', async () => {
      await request(app).post(COMPANIES).set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp A', linkedinUrl: uniqueCompanyUrl() });
      await request(app).post(COMPANIES).set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp B', linkedinUrl: uniqueCompanyUrl() });
      await request(app).post(COMPANIES).set('Authorization', `Bearer ${otherToken}`)
        .send({ name: 'Corp C', linkedinUrl: uniqueCompanyUrl() });

      const res = await request(app)
        .get(COMPANIES)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(2);
    });
  });

  // ─── GET/PUT/DELETE /api/v1/linkedin/companies/:id ───────────────────────

  describe('GET | PUT | DELETE /api/v1/linkedin/companies/:id', () => {
    it('US06-008 | should return 200 for GET by ID', async () => {
      const created = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp D', linkedinUrl: uniqueCompanyUrl() });

      const res = await request(app)
        .get(`${COMPANIES}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body._id).to.equal(created.body._id);
    });

    it('US06-009 | should return 200 and updated fields for PUT', async () => {
      const created = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp E', linkedinUrl: uniqueCompanyUrl() });

      const res = await request(app)
        .put(`${COMPANIES}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Great fintech company', sector: 'Fintech' });

      expect(res.status).to.equal(200);
      expect(res.body.notes).to.equal('Great fintech company');
    });

    it('US06-010 | should return 204 for DELETE and 404 on subsequent GET', async () => {
      const created = await request(app).post(COMPANIES)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Corp F', linkedinUrl: uniqueCompanyUrl() });

      const del = await request(app)
        .delete(`${COMPANIES}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(del.status).to.equal(204);

      const get = await request(app)
        .get(`${COMPANIES}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(get.status).to.equal(404);
    });
  });

  // ─── POST /api/v1/linkedin/contacts ──────────────────────────────────────

  describe('POST /api/v1/linkedin/contacts', () => {
    it('US07-001 | should return 201 and create a Recruiter contact', async () => {
      const payload = { ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() };
      const res = await request(app)
        .post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).to.equal(201);
      expect(res.body.type).to.equal('Recrutador');
    });

    it('US07-002 | should return 201 and create a Collaborator contact', async () => {
      const payload = { ...fixtures.validCollaborator, linkedinUrl: uniqueContactUrl() };
      const res = await request(app)
        .post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).to.equal(201);
      expect(res.body.type).to.equal('Colaborador');
    });

    it('US07-003 | should return 409 when same LinkedIn URL is registered twice', async () => {
      const url = uniqueContactUrl();
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ana', linkedinUrl: url, type: 'Recrutador' });

      const res = await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ name: 'Ana Dup', linkedinUrl: url, type: 'Recrutador' });

      expect(res.status).to.equal(409);
      expect(res.body.message).to.equal('Contato já cadastrado');
    });

    it('US07-004 | should return 400 for URL not matching linkedin.com/in/ pattern', async () => {
      const res = await request(app)
        .post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.invalidContactUrl);

      expect(res.status).to.equal(400);
      expect(res.body.message).to.include('linkedin.com/in');
    });

    it('US07-005 | should return 400 for invalid contact type value', async () => {
      const payload = { ...fixtures.invalidContactType, linkedinUrl: uniqueContactUrl() };
      const res = await request(app)
        .post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).to.equal(400);
    });

    it('US07-006 | should return 400 when type field is missing', async () => {
      const res = await request(app)
        .post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'No Type', linkedinUrl: uniqueContactUrl() });

      expect(res.status).to.equal(400);
    });

    it('US07-007 | should return 401 without authentication token', async () => {
      const res = await request(app).post(CONTACTS).send(fixtures.validRecruiter);
      expect(res.status).to.equal(401);
    });
  });

  // ─── GET /api/v1/linkedin/contacts ───────────────────────────────────────

  describe('GET /api/v1/linkedin/contacts', () => {
    it('US07-008 | should list all contacts for the authenticated user', async () => {
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validCollaborator, linkedinUrl: uniqueContactUrl() });

      const res = await request(app)
        .get(CONTACTS)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(2);
    });

    it('US07-009 | should filter contacts by type=Recrutador', async () => {
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validCollaborator, linkedinUrl: uniqueContactUrl() });

      const res = await request(app)
        .get(`${CONTACTS}?type=Recrutador`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(1);
      expect(res.body[0].type).to.equal('Recrutador');
    });

    it('US07-010 | should filter contacts by type=Colaborador', async () => {
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });
      await request(app).post(CONTACTS).set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validCollaborator, linkedinUrl: uniqueContactUrl() });

      const res = await request(app)
        .get(`${CONTACTS}?type=Colaborador`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(1);
      expect(res.body[0].type).to.equal('Colaborador');
    });
  });

  // ─── GET | PUT | DELETE /api/v1/linkedin/contacts/:id ────────────────────

  describe('GET | PUT | DELETE /api/v1/linkedin/contacts/:id', () => {
    it('US07-011 | should return 200 for GET contact by ID', async () => {
      const created = await request(app).post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });

      const res = await request(app)
        .get(`${CONTACTS}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
    });

    it('US07-012 | should return 200 and updated fields for PUT', async () => {
      const created = await request(app).post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });

      const res = await request(app)
        .put(`${CONTACTS}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ notes: 'Very responsive recruiter', email: 'recruiter@test.com' });

      expect(res.status).to.equal(200);
      expect(res.body.notes).to.equal('Very responsive recruiter');
    });

    it('US07-013 | should return 204 for DELETE and 404 on subsequent GET', async () => {
      const created = await request(app).post(CONTACTS)
        .set('Authorization', `Bearer ${token}`)
        .send({ ...fixtures.validRecruiter, linkedinUrl: uniqueContactUrl() });

      const del = await request(app)
        .delete(`${CONTACTS}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(del.status).to.equal(204);

      const get = await request(app)
        .get(`${CONTACTS}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(get.status).to.equal(404);
    });
  });
});
