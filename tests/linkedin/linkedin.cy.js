/**
 * LinkedIn Layer — Cypress API Tests
 * US06: Cadastrar perfil LinkedIn de empresa (JOBAPP-11)
 * US07: Cadastrar perfil LinkedIn de recrutador/colaborador (JOBAPP-12)
 *
 * Requires: API server running at BASE_URL (default: http://localhost:3000)
 */

const COMPANIES = '/api/v1/linkedin/companies';
const CONTACTS = '/api/v1/linkedin/contacts';

const uniqueCompanyUrl = () =>
  `https://www.linkedin.com/company/cy-co-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const uniqueContactUrl = () =>
  `https://www.linkedin.com/in/cy-ct-${Date.now()}-${Math.random().toString(36).slice(2)}`;

describe('[LINKEDIN] LinkedIn Layer — Cypress', () => {
  let token, otherToken;

  beforeEach(() => {
    cy.registerAndLogin().then((auth) => { token = auth.token; });
    cy.registerAndLogin().then((auth) => { otherToken = auth.token; });
  });

  // ─── POST /api/v1/linkedin/companies ─────────────────────────────────────

  describe('POST /api/v1/linkedin/companies', () => {
    it('US06-CY-001 | should return 201 and persist LinkedIn company profile', () => {
      cy.fixture('linkedin').then((f) => {
        const payload = { ...f.validCompany, linkedinUrl: uniqueCompanyUrl() };
        cy.api('POST', COMPANIES, payload, token).then((res) => {
          expect(res.status).to.equal(201);
          expect(res.body).to.include.keys('_id', 'name', 'linkedinUrl');
          expect(res.body.name).to.equal(f.validCompany.name);
        });
      });
    });

    it('US06-CY-002 | should return 409 for duplicate URL by same user', () => {
      const url = uniqueCompanyUrl();
      cy.api('POST', COMPANIES, { name: 'Corp A', linkedinUrl: url }, token);
      cy.api('POST', COMPANIES, { name: 'Corp A2', linkedinUrl: url }, token).then((res) => {
        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal('Empresa já cadastrada');
      });
    });

    it('US06-CY-003 | should allow same URL for different users', () => {
      const url = uniqueCompanyUrl();
      cy.api('POST', COMPANIES, { name: 'Corp', linkedinUrl: url }, token).then((r1) => {
        expect(r1.status).to.equal(201);
      });
      cy.api('POST', COMPANIES, { name: 'Corp', linkedinUrl: url }, otherToken).then((r2) => {
        expect(r2.status).to.equal(201);
      });
    });

    it('US06-CY-004 | should return 400 for URL not matching linkedin.com/company/ pattern', () => {
      cy.fixture('linkedin').then((f) => {
        cy.api('POST', COMPANIES, f.invalidCompanyUrl, token).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.include('linkedin.com/company');
        });
      });
    });

    it('US06-CY-005 | should return 401 without authentication token', () => {
      cy.request({
        method: 'POST',
        url: COMPANIES,
        body: { name: 'Test', linkedinUrl: uniqueCompanyUrl() },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
      });
    });
  });

  // ─── GET /api/v1/linkedin/companies ──────────────────────────────────────

  describe('GET /api/v1/linkedin/companies', () => {
    it('US06-CY-006 | should return only the authenticated user\'s companies', () => {
      cy.api('POST', COMPANIES, { name: 'A', linkedinUrl: uniqueCompanyUrl() }, token);
      cy.api('POST', COMPANIES, { name: 'B', linkedinUrl: uniqueCompanyUrl() }, token);
      cy.api('POST', COMPANIES, { name: 'C', linkedinUrl: uniqueCompanyUrl() }, otherToken);

      cy.api('GET', COMPANIES, null, token).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').with.lengthOf(2);
      });
    });
  });

  // ─── PUT /DELETE /api/v1/linkedin/companies/:id ───────────────────────────

  describe('PUT | DELETE /api/v1/linkedin/companies/:id', () => {
    it('US06-CY-007 | should return 200 and updated fields for PUT', () => {
      cy.api('POST', COMPANIES, { name: 'Updatable', linkedinUrl: uniqueCompanyUrl() }, token).then((created) => {
        cy.api('PUT', `${COMPANIES}/${created.body._id}`, { sector: 'Fintech', notes: 'Top company' }, token).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.sector).to.equal('Fintech');
        });
      });
    });

    it('US06-CY-008 | should return 204 for DELETE and 404 on subsequent GET', () => {
      cy.api('POST', COMPANIES, { name: 'To Delete', linkedinUrl: uniqueCompanyUrl() }, token).then((created) => {
        const id = created.body._id;
        cy.api('DELETE', `${COMPANIES}/${id}`, null, token).then((del) => {
          expect(del.status).to.equal(204);
        });
        cy.api('GET', `${COMPANIES}/${id}`, null, token).then((get) => {
          expect(get.status).to.equal(404);
        });
      });
    });
  });

  // ─── POST /api/v1/linkedin/contacts ──────────────────────────────────────

  describe('POST /api/v1/linkedin/contacts', () => {
    it('US07-CY-001 | should return 201 and create a Recruiter contact', () => {
      cy.fixture('linkedin').then((f) => {
        const payload = { ...f.validRecruiter, linkedinUrl: uniqueContactUrl() };
        cy.api('POST', CONTACTS, payload, token).then((res) => {
          expect(res.status).to.equal(201);
          expect(res.body.type).to.equal('Recrutador');
        });
      });
    });

    it('US07-CY-002 | should return 201 and create a Collaborator contact', () => {
      cy.fixture('linkedin').then((f) => {
        const payload = { ...f.validCollaborator, linkedinUrl: uniqueContactUrl() };
        cy.api('POST', CONTACTS, payload, token).then((res) => {
          expect(res.status).to.equal(201);
          expect(res.body.type).to.equal('Colaborador');
        });
      });
    });

    it('US07-CY-003 | should return 409 for duplicate LinkedIn URL', () => {
      const url = uniqueContactUrl();
      cy.api('POST', CONTACTS, { name: 'Ana', linkedinUrl: url, type: 'Recrutador' }, token);
      cy.api('POST', CONTACTS, { name: 'Ana2', linkedinUrl: url, type: 'Recrutador' }, token).then((res) => {
        expect(res.status).to.equal(409);
        expect(res.body.message).to.equal('Contato já cadastrado');
      });
    });

    it('US07-CY-004 | should return 400 for URL not matching linkedin.com/in/ pattern', () => {
      cy.fixture('linkedin').then((f) => {
        cy.api('POST', CONTACTS, f.invalidContactUrl, token).then((res) => {
          expect(res.status).to.equal(400);
          expect(res.body.message).to.include('linkedin.com/in');
        });
      });
    });

    it('US07-CY-005 | should return 400 for invalid contact type', () => {
      cy.fixture('linkedin').then((f) => {
        const payload = { ...f.invalidContactType, linkedinUrl: uniqueContactUrl() };
        cy.api('POST', CONTACTS, payload, token).then((res) => {
          expect(res.status).to.equal(400);
        });
      });
    });
  });

  // ─── GET /api/v1/linkedin/contacts ───────────────────────────────────────

  describe('GET /api/v1/linkedin/contacts', () => {
    it('US07-CY-006 | should return all contacts for authenticated user', () => {
      cy.api('POST', CONTACTS, { name: 'R1', linkedinUrl: uniqueContactUrl(), type: 'Recrutador' }, token);
      cy.api('POST', CONTACTS, { name: 'C1', linkedinUrl: uniqueContactUrl(), type: 'Colaborador' }, token);

      cy.api('GET', CONTACTS, null, token).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').with.lengthOf(2);
      });
    });

    it('US07-CY-007 | should filter contacts by ?type=Recrutador', () => {
      cy.api('POST', CONTACTS, { name: 'R', linkedinUrl: uniqueContactUrl(), type: 'Recrutador' }, token);
      cy.api('POST', CONTACTS, { name: 'C', linkedinUrl: uniqueContactUrl(), type: 'Colaborador' }, token);

      cy.api('GET', `${CONTACTS}?type=Recrutador`, null, token).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').with.lengthOf(1);
        expect(res.body[0].type).to.equal('Recrutador');
      });
    });

    it('US07-CY-008 | should filter contacts by ?type=Colaborador', () => {
      cy.api('POST', CONTACTS, { name: 'R', linkedinUrl: uniqueContactUrl(), type: 'Recrutador' }, token);
      cy.api('POST', CONTACTS, { name: 'C', linkedinUrl: uniqueContactUrl(), type: 'Colaborador' }, token);

      cy.api('GET', `${CONTACTS}?type=Colaborador`, null, token).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').with.lengthOf(1);
        expect(res.body[0].type).to.equal('Colaborador');
      });
    });
  });

  // ─── PUT | DELETE /api/v1/linkedin/contacts/:id ──────────────────────────

  describe('PUT | DELETE /api/v1/linkedin/contacts/:id', () => {
    it('US07-CY-009 | should return 200 and updated fields for PUT', () => {
      cy.api('POST', CONTACTS, { name: 'To Update', linkedinUrl: uniqueContactUrl(), type: 'Recrutador' }, token).then((created) => {
        cy.api('PUT', `${CONTACTS}/${created.body._id}`, { notes: 'Reached out on 2026-05-03' }, token).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.notes).to.equal('Reached out on 2026-05-03');
        });
      });
    });

    it('US07-CY-010 | should return 204 for DELETE and 404 on subsequent GET', () => {
      cy.api('POST', CONTACTS, { name: 'To Delete', linkedinUrl: uniqueContactUrl(), type: 'Colaborador' }, token).then((created) => {
        const id = created.body._id;
        cy.api('DELETE', `${CONTACTS}/${id}`, null, token).then((del) => {
          expect(del.status).to.equal(204);
        });
        cy.api('GET', `${CONTACTS}/${id}`, null, token).then((get) => {
          expect(get.status).to.equal(404);
        });
      });
    });
  });
});
