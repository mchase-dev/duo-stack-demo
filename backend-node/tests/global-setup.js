/**
 * Global Setup for Tests
 * This runs once before all test suites
 */

module.exports = async () => {
  // Set test environment variables BEFORE anything else runs
  process.env.NODE_ENV = 'test';
  process.env.DB_DIALECT = 'sqlite';
  process.env.DB_STORAGE = ':memory:';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-at-least-32-characters-long';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-at-least-32-characters';
};
