/**
 * Job Applications Layer — Cypress API Tests
 * US03: Cadastrar oferta de emprego (JOBAPP-8)
 * US04: Enviar currículo personalizado (JOBAPP-9)
 * US05: Registrar etapa do processo seletivo (JOBAPP-10)
 *
 * Requires: API server running at BASE_URL (default: http://localhost:3000)
 */

const BASE = '/api/v1/job-applications';

describe('[JOB APPLICATIONS] Job Applications Layer — Cypress', () => {
  let token, userId, otherToken;

  beforeEach(() => {
    cy.registerAndLogin().then((auth) => {
      token = auth.token;
      userId = auth.userId;
    });
    cy.registerAndLogin().then((auth) => {
      otherToken = auth.token;
    });
  });

  // ─── POST /api/v1/job-applications ───────────────────────────────────────

  describe('POST /api/v1/job-applications', () => {
    it('US03-CY-001 | should return 201 with status=Enviado and userId assigned', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((res) => {
          expect(res.status).to.equal(201);
          expect(res.body.status).to.equal('Enviado');
          expect(res.body.userId).to.equal(userId);
          expect(res.body).to.include.keys('_id', 'company', 'position');
        });
      });
    });

    it('US03-CY-002 | should return 201 with minimal required payload', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.minimal, token).then((res) => {
          expect(res.status).to.equal(201);
        });
      });
    });

    it('US03-CY-003 | should return 400 when company is missing', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.missingCompany, token).then((res) => {
          expect(res.status).to.equal(400);
          const fields = res.body.errors.map((e) => e.field);
          expect(fields).to.include('company');
        });
      });
    });

    it('US03-CY-004 | should return 400 for negative salary', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.negativeSalary, token).then((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });

    it('US03-CY-005 | should return 401 without auth token', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.request({
          method: 'POST',
          url: BASE,
          body: f.valid,
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(401);
        });
      });
    });
  });

  // ─── GET /api/v1/job-applications ────────────────────────────────────────

  describe('GET /api/v1/job-applications', () => {
    it('US03-CY-006 | should return only this user\'s applications', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token);
        cy.api('POST', BASE, f.minimal, token);
        cy.api('POST', BASE, f.valid, otherToken);

        cy.api('GET', BASE, null, token).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array').with.lengthOf(2);
          res.body.forEach((app) => expect(app.userId).to.equal(userId));
        });
      });
    });
  });

  // ─── GET /api/v1/job-applications/:id ────────────────────────────────────

  describe('GET /api/v1/job-applications/:id', () => {
    it('US03-CY-007 | should return 200 with full application details', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          cy.api('GET', `${BASE}/${created.body._id}`, null, token).then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body._id).to.equal(created.body._id);
            expect(res.body.benefits).to.deep.equal(f.valid.benefits);
          });
        });
      });
    });

    it('US03-CY-008 | should return 403 when accessing another user\'s application', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, otherToken).then((created) => {
          cy.api('GET', `${BASE}/${created.body._id}`, null, token).then((res) => {
            expect(res.status).to.equal(403);
          });
        });
      });
    });
  });

  // ─── PUT /api/v1/job-applications/:id ────────────────────────────────────

  describe('PUT /api/v1/job-applications/:id', () => {
    it('US03-CY-009 | should return 200 with updated salary and description', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          cy.api('PUT', `${BASE}/${created.body._id}`, f.updatePayload, token).then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body.salary).to.equal(f.updatePayload.salary);
          });
        });
      });
    });
  });

  // ─── DELETE /api/v1/job-applications/:id ─────────────────────────────────

  describe('DELETE /api/v1/job-applications/:id', () => {
    it('US03-CY-010 | should return 204 and 404 on subsequent GET', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          const id = created.body._id;
          cy.api('DELETE', `${BASE}/${id}`, null, token).then((del) => {
            expect(del.status).to.equal(204);
          });
          cy.api('GET', `${BASE}/${id}`, null, token).then((get) => {
            expect(get.status).to.equal(404);
          });
        });
      });
    });
  });

  // ─── POST /api/v1/job-applications/:id/stages ────────────────────────────

  describe('POST /api/v1/job-applications/:id/stages', () => {
    it('US05-CY-001 | should return 201 and update application status', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          const id = created.body._id;

          cy.api('POST', `${BASE}/${id}/stages`, f.stages.feedback, token).then((res) => {
            expect(res.status).to.equal(201);
            expect(res.body.status).to.equal('Feedback');
          });

          cy.api('GET', `${BASE}/${id}`, null, token).then((app) => {
            expect(app.body.status).to.equal('Feedback');
          });
        });
      });
    });

    it('US05-CY-002 | should return 400 for invalid stage status value', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          cy.api('POST', `${BASE}/${created.body._id}/stages`, f.stages.invalidStatus, token).then((res) => {
            expect(res.status).to.equal(400);
          });
        });
      });
    });

    it('US05-CY-003 | should return 422 for retroactive stage date', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          const id = created.body._id;

          cy.api('POST', `${BASE}/${id}/stages`, f.stages.interview, token); // date: 2026-05-10

          cy.api('POST', `${BASE}/${id}/stages`,
            { status: 'Feedback', date: '2026-04-01' }, token
          ).then((res) => {
            expect(res.status).to.equal(422);
          });
        });
      });
    });
  });

  // ─── GET /api/v1/job-applications/:id/stages ─────────────────────────────

  describe('GET /api/v1/job-applications/:id/stages', () => {
    it('US05-CY-004 | should return stages in ascending chronological order', () => {
      cy.fixture('jobApplications').then((f) => {
        cy.api('POST', BASE, f.valid, token).then((created) => {
          const id = created.body._id;

          cy.api('POST', `${BASE}/${id}/stages`, f.stages.feedback, token);
          cy.api('POST', `${BASE}/${id}/stages`, f.stages.interview, token);

          cy.api('GET', `${BASE}/${id}/stages`, null, token).then((res) => {
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array').with.lengthOf(2);
            expect(new Date(res.body[0].date) <= new Date(res.body[1].date)).to.be.true;
          });
        });
      });
    });
  });
});
