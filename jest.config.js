module.exports = {
    testEnvironment: 'node',
    watchman: false, // Disable Watchman explicitly
    testMatch: ['**/__tests__/**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
  };