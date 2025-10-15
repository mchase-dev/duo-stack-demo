// TypeScript database configuration
import { Sequelize, Options } from 'sequelize';
import { config } from 'dotenv';

// Only load .env if not in test environment (tests set env vars directly)
if (process.env.NODE_ENV !== 'test') {
  config();
}

/**
 * Get database configuration based on environment
 */
function getDatabaseConfig(): Options {
  const dialect = (process.env.DB_DIALECT as any) || 'postgres';

  const config: Options = {
    dialect,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'duostackdemo',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    storage: process.env.DB_STORAGE, // For SQLite
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true, // Enable soft deletes with deletedAt
      deletedAt: 'deletedAt',
    },
  };

  // Only add pool if not SQLite
  if (dialect !== 'sqlite') {
    config.pool = {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    };
  }

  return config;
}

// Create Sequelize instance
const dbConfig = getDatabaseConfig();

export const sequelize = new Sequelize(
  dbConfig.database || 'duostackdemo',
  dbConfig.username || 'postgres',
  dbConfig.password || '',
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect as any,
    logging: dbConfig.logging,
    define: dbConfig.define,
    pool: dbConfig.pool,
  }
);

/**
 * Get the Sequelize instance
 */
export function getSequelize(): Sequelize {
  return sequelize;
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
}

export default sequelize;
