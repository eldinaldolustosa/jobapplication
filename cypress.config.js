const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'tests/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    fixturesFolder: 'tests/fixtures',
    screenshotsFolder: 'reports/cypress/screenshots',
    videosFolder: 'reports/cypress/videos',
    video: false,
    env: {
      BASE_URL: 'http://localhost:3000',
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
