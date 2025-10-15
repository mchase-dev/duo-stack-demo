'use strict';

/**
 * Migration: Create RefreshTokens table
 *
 * Creates the RefreshTokens table for storing JWT refresh tokens.
 * Includes foreign key reference to Users table and indexes for
 * userId, tokenHash, and expiresAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('RefreshTokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      tokenHash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex('RefreshTokens', ['userId'], {
      name: 'refresh_tokens_user_id_index',
    });

    await queryInterface.addIndex('RefreshTokens', ['tokenHash'], {
      name: 'refresh_tokens_token_hash_index',
    });

    await queryInterface.addIndex('RefreshTokens', ['expiresAt'], {
      name: 'refresh_tokens_expires_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('RefreshTokens');
  },
};
