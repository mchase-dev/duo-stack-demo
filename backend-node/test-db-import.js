// Test importing database module
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:';

console.log('Env vars set:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_DIALECT: process.env.DB_DIALECT,
  DB_STORAGE: process.env.DB_STORAGE,
});

// Using require to test CommonJS import
try {
  const db = require('./src/config/database.ts');
  console.log('Successfully imported database module');
  console.log('sequelize exists:', !!db.sequelize);
  console.log('sequelize type:', typeof db.sequelize);
} catch (error) {
  console.error('Error importing database:', error);
}
