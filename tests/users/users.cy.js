/**
 * Users Layer — Cypress API Tests
 * US01: Registrar novo usuário na plataforma (JOBAPP-6)
 *
 * Covers: POST /api/v1/users/register | GET /api/v1/users/me
 * Requires: API server running at BASE_URL (default: http://localhost:3000)
 */

const BASE = '/api/v1';
const uniqueEmail = () => `cy_user_${Date.now()}_${Math.random().toString(36).slice(2)}@jobapp.test`;

describe('[USERS] Users Layer — Cypress', () => {
  // ─── POST /api/v1/users/register ─────────────────────────────────────────

  describe('POST /api/v1/users/register', () => {
    it('US01-CY-001 | should return 201 and user object for valid registration', () => {
      cy.fixture('users').then((f) => {
        const user = { ...f.validUser, email: uniqueEmail() };
        cy.register(user).then((res) => {
          expect(res.status).to.equal(201);
          expect(res.body.message).to.equal('Usuário cadastrado com sucesso');
          expect(res.body.user).to.include.keys('_id', 'name', 'email');
          expect(res.body.user).to.not.have.property('password');
        });
      });
    });

    it('US01-CY-002 | should return 409 for duplicate email', () => {
      const email = uniqueEmail();
      cy.register({ name: 'First', email, password: 'First1234' }).then(() => {
        cy.register({ name: 'Dup', email, password: 'Dup12345' }).then((res) => {
          expect(res.status).to.equal(409);
          expect(res.body.message).to.equal('E-mail já cadastrado');
        });
      });
    });

    it('US01-CY-003 | should return 400 for password shorter than 8 chars', () => {
      cy.fixture('users').then((f) => {
        cy.register({ ...f.weakPassword, email: uniqueEmail() }).then((res) => {
          expect(res.status).to.equal(400);
          const msgs = res.body.errors.map((e) => e.message).join(' ');
          expect(msgs).to.include('8');
        });
      });
    });

    it('US01-CY-004 | should return 400 for password without numbers', () => {
      cy.fixture('users').then((f) => {
        cy.register({ ...f.noNumberPassword, email: uniqueEmail() }).then((res) => {
          expect(res.status).to.equal(400);
          const msgs = res.body.errors.map((e) => e.message).join(' ');
          expect(msgs).to.include('número');
        });
      });
    });

    it('US01-CY-005 | should return 400 for invalid email format', () => {
      cy.fixture('users').then((f) => {
        cy.register(f.invalidEmail).then((res) => {
          expect(res.status).to.equal(400);
          const fields = res.body.errors.map((e) => e.field);
          expect(fields).to.include('email');
        });
      });
    });

    it('US01-CY-006 | should return 400 when name field is missing', () => {
      cy.register({ email: uniqueEmail(), password: 'NoName123' }).then((res) => {
        expect(res.status).to.equal(400);
        const fields = res.body.errors.map((e) => e.field);
        expect(fields).to.include('name');
      });
    });

    it('US01-CY-007 | should return 400 when all required fields are missing', () => {
      cy.register({}).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors.length).to.be.greaterThan(1);
      });
    });
  });

  // ─── GET /api/v1/users/me ─────────────────────────────────────────────────

  describe('GET /api/v1/users/me', () => {
    it('US01-CY-008 | should return 200 with user profile for authenticated user', () => {
      cy.registerAndLogin().then(({ token, userId }) => {
        cy.api('GET', `${BASE}/users/me`, null, token).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user._id).to.equal(userId);
          expect(res.body.user).to.not.have.property('password');
        });
      });
    });

    it('US01-CY-009 | should return 401 without token', () => {
      cy.request({
        method: 'GET',
        url: `${BASE}/users/me`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
      });
    });

    it('US01-CY-010 | should return 401 for malformed token', () => {
      cy.request({
        method: 'GET',
        url: `${BASE}/users/me`,
        failOnStatusCode: false,
        headers: { Authorization: 'Bearer this.is.garbage' },
      }).then((res) => {
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Token inválido');
      });
    });
  });
});
