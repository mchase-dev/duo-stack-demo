/**
 * Test Setup
 * Configures test database and environment
 */

import { Sequelize } from 'sequelize';
import { initModels } from '../src/models';

console.log('[setup.ts] Creating test sequelize instance with env:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_DIALECT: process.env.DB_DIALECT,
  DB_STORAGE: process.env.DB_STORAGE,
});

// Create a Sequelize instance specifically for tests
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false,
  define: {
    timestamps: true,
    underscored: false,
    paranoid: true,
    deletedAt: 'deletedAt',
  },
});

console.log('[setup.ts] Test sequelize instance created:', !!sequelize);
console.log('[setup.ts] Test sequelize config:', sequelize.config);

// Initialize models with the test sequelize instance
initModels(sequelize);

// Export for tests to use
export { sequelize };

// Setup and teardown hooks
beforeAll(async () => {
  console.log('[setup.ts] beforeAll: Starting database sync...');
  try {
    await sequelize.sync({ force: true });
    console.log('[setup.ts] beforeAll: Database sync completed');
  } catch (error) {
    console.error('[setup.ts] beforeAll: Database sync failed:', error);
    throw error;
  }
}, 30000); // 30 second timeout

afterEach(async () => {
  // Clean up all tables after each test
  console.log('[setup.ts] afterEach: Cleaning up database...');
  try {
    // For SQLite, we need to manually delete from each table
    // truncate() doesn't work well with foreign keys in SQLite
    await sequelize.query('PRAGMA foreign_keys = OFF');
    await sequelize.query('DELETE FROM RefreshTokens');
    await sequelize.query('DELETE FROM Messages');
    await sequelize.query('DELETE FROM Events');
    await sequelize.query('DELETE FROM Rooms');
    await sequelize.query('DELETE FROM Pages');
    await sequelize.query('DELETE FROM Users');
    await sequelize.query('PRAGMA foreign_keys = ON');
    console.log('[setup.ts] afterEach: Database cleaned');
  } catch (error: any) {
    console.error('[setup.ts] afterEach: Error cleaning database:', error.message);
  }
});

afterAll(async () => {
  await sequelize.close();
});
