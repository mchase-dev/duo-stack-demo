// Sequelize configuration for different database dialects
// This file is used by sequelize-cli for migrations and seeds

require("dotenv").config();

const config = {
  development: {
    dialect: process.env.DB_DIALECT || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "duostackdemo",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
    storage: process.env.DB_STORAGE, // For SQLite
    logging: console.log,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true, // Enable soft deletes
      deletedAt: "deletedAt",
    },
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
      deletedAt: "deletedAt",
    },
  },
  production: {
    dialect: process.env.DB_DIALECT || "postgres",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    storage: process.env.DB_STORAGE, // For SQLite
    logging: false,
    define: {
      timestamps: true,
      underscored: false,
      paranoid: true,
      deletedAt: "deletedAt",
    },
    pool: {
      max: 10,
      min: 2,
      acquire: 30000,
      idle: 10000,
    },
  },
};

module.exports = config;
