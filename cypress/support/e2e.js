import './commands';

// Suppress fetch/XHR noise in Cypress logs for cleaner output
Cypress.on('uncaught:exception', () => false);

before(() => {
  cy.log('JobApplication API — Cypress Test Suite');
  cy.log(`Base URL: ${Cypress.env('BASE_URL') || Cypress.config('baseUrl')}`);
});
