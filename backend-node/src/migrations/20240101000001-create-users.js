'use strict';

/**
 * Migration: Create Users table
 *
 * Creates the Users table with all fields for user account information
 * and authentication data. Includes indexes for email, username, and deletedAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      emailConfirmed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      username: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      passwordHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      lastName: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      avatarUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('User', 'Admin', 'Superuser'),
        allowNull: false,
        defaultValue: 'User',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('Users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });

    await queryInterface.addIndex('Users', ['username'], {
      unique: true,
      name: 'users_username_unique',
    });

    await queryInterface.addIndex('Users', ['deletedAt'], {
      name: 'users_deleted_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  },
};
