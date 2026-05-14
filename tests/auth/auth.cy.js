const BASE = '/api/v1';

describe('[AUTH] Authentication Layer — Cypress', () => {
  let registeredCredentials;

  before(() => {
    cy.registerAndLogin().then(({ credentials }) => {
      registeredCredentials = credentials;
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('US02-CY-001 | should return 200 with accessToken and refreshToken', () => {
      cy.login(registeredCredentials).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('accessToken').that.is.a('string');
        expect(res.body).to.have.property('refreshToken').that.is.a('string');
        expect(res.body.user).to.not.have.property('password');
      });
    });

    it('US02-CY-002 | should return 401 for wrong password', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/login`,
        body: { email: registeredCredentials.email, password: 'WRONG_PASS_99' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Credenciais inválidas');
      });
    });

    it('US02-CY-003 | should return 401 for non-existent email', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/login`,
        body: { email: `ghost_${Date.now()}@nowhere.test`, password: 'AnyPass1234' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Credenciais inválidas');
      });
    });

    it('US02-CY-004 | should return 400 for missing email', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/login`,
        body: { password: 'TestPass123' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors).to.be.an('array').and.have.length.greaterThan(0);
      });
    });

    it('US02-CY-005 | should return 400 for missing password', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/login`,
        body: { email: registeredCredentials.email },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
        expect(res.body.errors).to.be.an('array');
      });
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('US02-CY-006 | should return 200 with new tokens for valid refresh token', () => {
      cy.registerAndLogin().then(({ refreshToken }) => {
        cy.request({
          method: 'POST',
          url: `${BASE}/auth/refresh`,
          body: { refreshToken },
          failOnStatusCode: false,
        }).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('accessToken');
          expect(res.body).to.have.property('refreshToken');
        });
      });
    });

    it('US02-CY-007 | should return 401 for invalid refresh token', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/refresh`,
        body: { refreshToken: 'invalid.token.abc' },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
      });
    });

    it('US02-CY-008 | should return 400 when refreshToken is absent', () => {
      cy.request({
        method: 'POST',
        url: `${BASE}/auth/refresh`,
        body: {},
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(400);
      });
    });
  });

  describe('JWT Guard — Protected Routes', () => {
    it('US02-CY-009 | should return 401 when Authorization header is missing', () => {
      cy.request({
        method: 'GET',
        url: `${BASE}/users/me`,
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.equal(401);
        expect(res.body.message).to.equal('Token de autenticação não fornecido');
      });
    });

    it('US02-CY-010 | should return 200 for valid Bearer token on protected route', () => {
      cy.registerAndLogin().then(({ token }) => {
        cy.api('GET', `${BASE}/users/me`, null, token).then((res) => {
          expect(res.status).to.equal(200);
          expect(res.body.user).to.include.keys('_id', 'email');
        });
      });
    });
  });
});
