/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup/env.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/scripts/**',
    '!src/config/docs/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  // Evita múltiplas instâncias do Mongoose / memory server competindo entre workers
  maxWorkers: 1,
  testTimeout: 60000,
};
