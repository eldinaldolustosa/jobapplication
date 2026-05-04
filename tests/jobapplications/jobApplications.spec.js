/**
 * Job Applications Layer — Supertest Integration Tests
 * US03: Cadastrar oferta de emprego (JOBAPP-8)
 * US04: Enviar currículo personalizado (JOBAPP-9)
 * US05: Registrar etapa do processo seletivo (JOBAPP-10)
 *
 * Covers: CRUD /api/v1/job-applications + stages + resume
 */
require('dotenv').config({ path: '.env.test' });
const { expect } = require('chai');
const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../../src/app');
const { connectTestDB, clearCollections, closeTestDB } = require('../helpers/dbHelper');
const { createUserAndLogin } = require('../helpers/authHelper');
const fixtures = require('../fixtures/jobApplications.json');

const BASE = '/api/v1/job-applications';

describe('[JOB APPLICATIONS] Job Applications Layer', () => {
  let token, userId, otherToken;

  before(async () => {
    await connectTestDB();
    await clearCollections('users', 'jobapplications', 'stages');
  });

  beforeEach(async () => {
    await clearCollections('jobapplications', 'stages');
    const auth = await createUserAndLogin();
    token = auth.token;
    userId = auth.user._id;
    const other = await createUserAndLogin();
    otherToken = other.token;
  });

  after(async () => {
    await clearCollections('users', 'jobapplications', 'stages');
    await closeTestDB();
  });

  // ─── POST /api/v1/job-applications ───────────────────────────────────────

  describe('POST /api/v1/job-applications', () => {
    it('US03-001 | should return 201 and persist application with status=Enviado', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);

      expect(res.status).to.equal(201);
      expect(res.body).to.include.keys('_id', 'company', 'position', 'applicationDate', 'status');
      expect(res.body.status).to.equal('Enviado');
      expect(res.body.userId).to.equal(userId);
    });

    it('US03-002 | should return 201 with only required fields (minimal payload)', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.minimal);

      expect(res.status).to.equal(201);
      expect(res.body.company).to.equal(fixtures.minimal.company);
    });

    it('US03-003 | should return 400 when company is missing', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.missingCompany);

      expect(res.status).to.equal(400);
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).to.include('company');
    });

    it('US03-004 | should return 400 when position is missing', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.missingPosition);

      expect(res.status).to.equal(400);
      const fields = res.body.errors.map((e) => e.field);
      expect(fields).to.include('position');
    });

    it('US03-005 | should return 400 for negative salary value', async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.negativeSalary);

      expect(res.status).to.equal(400);
    });

    it('US03-006 | should return 401 without authentication token', async () => {
      const res = await request(app).post(BASE).send(fixtures.valid);
      expect(res.status).to.equal(401);
    });
  });

  // ─── GET /api/v1/job-applications ────────────────────────────────────────

  describe('GET /api/v1/job-applications', () => {
    it('US03-007 | should return 200 and list only the authenticated user\'s applications', async () => {
      await request(app).post(BASE).set('Authorization', `Bearer ${token}`).send(fixtures.valid);
      await request(app).post(BASE).set('Authorization', `Bearer ${token}`).send(fixtures.minimal);
      await request(app).post(BASE).set('Authorization', `Bearer ${otherToken}`).send(fixtures.valid);

      const res = await request(app)
        .get(BASE)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(2);
      res.body.forEach((app) => expect(app.userId).to.equal(userId));
    });

    it('US03-008 | should return an empty array when user has no applications', async () => {
      const res = await request(app)
        .get(BASE)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(0);
    });
  });

  // ─── GET /api/v1/job-applications/:id ────────────────────────────────────

  describe('GET /api/v1/job-applications/:id', () => {
    it('US03-009 | should return 200 with the application details', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);

      const res = await request(app)
        .get(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body._id).to.equal(created.body._id);
    });

    it('US03-010 | should return 403 when accessing another user\'s application', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(fixtures.valid);

      const res = await request(app)
        .get(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(403);
    });

    it('US03-011 | should return 404 for a non-existent application ID', async () => {
      const res = await request(app)
        .get(`${BASE}/000000000000000000000000`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
    });
  });

  // ─── PUT /api/v1/job-applications/:id ────────────────────────────────────

  describe('PUT /api/v1/job-applications/:id', () => {
    it('US03-012 | should return 200 and update the application fields', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);

      const res = await request(app)
        .put(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.updatePayload);

      expect(res.status).to.equal(200);
      expect(res.body.salary).to.equal(fixtures.updatePayload.salary);
      expect(res.body.description).to.equal(fixtures.updatePayload.description);
    });

    it('US03-013 | should return 403 when trying to update another user\'s application', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(fixtures.valid);

      const res = await request(app)
        .put(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.updatePayload);

      expect(res.status).to.equal(403);
    });
  });

  // ─── DELETE /api/v1/job-applications/:id ─────────────────────────────────

  describe('DELETE /api/v1/job-applications/:id', () => {
    it('US03-014 | should return 204 and remove the application', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);

      const del = await request(app)
        .delete(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(del.status).to.equal(204);

      const get = await request(app)
        .get(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);
      expect(get.status).to.equal(404);
    });

    it('US03-015 | should return 403 when deleting another user\'s application', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(fixtures.valid);

      const res = await request(app)
        .delete(`${BASE}/${created.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(403);
    });
  });

  // ─── POST /api/v1/job-applications/:id/stages ────────────────────────────

  describe('POST /api/v1/job-applications/:id/stages', () => {
    let appId;

    beforeEach(async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);
      appId = res.body._id;
    });

    it('US05-001 | should return 201 and update application status to new stage', async () => {
      const res = await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.feedback);

      expect(res.status).to.equal(201);
      expect(res.body.status).to.equal('Feedback');

      const app_ = await request(app)
        .get(`${BASE}/${appId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(app_.body.status).to.equal('Feedback');
    });

    it('US05-002 | should return 400 for invalid stage status value', async () => {
      const res = await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.invalidStatus);

      expect(res.status).to.equal(400);
    });

    it('US05-003 | should return 400 when stage date is missing', async () => {
      const res = await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.missingDate);

      expect(res.status).to.equal(400);
    });

    it('US05-004 | should return 422 when new stage date is before the last stage date', async () => {
      await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.interview); // date: 2026-05-10

      const res = await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Feedback', date: '2026-04-01', notes: 'retroactive' });

      expect(res.status).to.equal(422);
    });

    it('US05-005 | should return 422 when registering the same stage consecutively', async () => {
      await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.feedback);

      const res = await request(app)
        .post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'Feedback', date: '2026-05-10' });

      expect(res.status).to.equal(422);
    });

    it('US05-006 | should return 404 for non-existent application', async () => {
      const res = await request(app)
        .post(`${BASE}/000000000000000000000000/stages`)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.stages.feedback);

      expect(res.status).to.equal(404);
    });
  });

  // ─── GET /api/v1/job-applications/:id/stages ─────────────────────────────

  describe('GET /api/v1/job-applications/:id/stages', () => {
    it('US05-007 | should return stages in ascending chronological order', async () => {
      const created = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);
      const appId = created.body._id;

      await request(app).post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`).send(fixtures.stages.feedback);
      await request(app).post(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`).send(fixtures.stages.interview);

      const res = await request(app)
        .get(`${BASE}/${appId}/stages`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array').with.lengthOf(2);
      expect(new Date(res.body[0].date) <= new Date(res.body[1].date)).to.be.true;
    });
  });

  // ─── POST /api/v1/job-applications/:id/resume ────────────────────────────

  describe('POST /api/v1/job-applications/:id/resume', () => {
    let appId;
    const pdfPath = path.join(__dirname, '../../uploads/.gitkeep');
    const fakePdfPath = path.join(__dirname, '../fixtures/fake-resume.pdf');

    before(() => {
      // Create a minimal fake PDF for upload tests
      fs.writeFileSync(fakePdfPath, '%PDF-1.4 fake content for testing');
    });

    after(() => {
      if (fs.existsSync(fakePdfPath)) fs.unlinkSync(fakePdfPath);
    });

    beforeEach(async () => {
      const res = await request(app)
        .post(BASE)
        .set('Authorization', `Bearer ${token}`)
        .send(fixtures.valid);
      appId = res.body._id;
    });

    it('US04-001 | should return 201 and store resume metadata for valid PDF upload', async () => {
      const res = await request(app)
        .post(`${BASE}/${appId}/resume`)
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', fakePdfPath, { contentType: 'application/pdf' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('originalName');
      expect(res.body).to.have.property('uploadedAt');
    });

    it('US04-002 | should return 404 when querying resume that was never uploaded', async () => {
      const res = await request(app)
        .get(`${BASE}/${appId}/resume`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).to.equal(404);
      expect(res.body.message).to.include('Nenhum currículo');
    });

    it('US04-003 | should return 415 for non-PDF file format', async () => {
      const txtPath = path.join(__dirname, '../fixtures/fake-doc.txt');
      fs.writeFileSync(txtPath, 'fake document');

      const res = await request(app)
        .post(`${BASE}/${appId}/resume`)
        .set('Authorization', `Bearer ${token}`)
        .attach('resume', txtPath, { contentType: 'text/plain' });

      expect(res.status).to.equal(415);
      if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    });
  });
});
