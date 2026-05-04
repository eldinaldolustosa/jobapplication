const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'reports/cypress/screenshots',
    videosFolder: 'reports/cypress/videos',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports/cypress',
      charts: true,
      reportPageTitle: 'JobApplication API — Cypress Test Report',
      embeddedScreenshots: true,
      inlineAssets: true,
    },
    env: {
      BASE_URL: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
