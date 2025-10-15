'use strict';

/**
 * Migration: Create Rooms table
 *
 * Creates the Rooms table for storing chat room information.
 * Includes foreign key reference to Users table and indexes for
 * slug, createdBy, and deletedAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rooms', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      isPublic: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes
    await queryInterface.addIndex('Rooms', ['slug'], {
      unique: true,
      name: 'rooms_slug_unique',
    });

    await queryInterface.addIndex('Rooms', ['createdBy'], {
      name: 'rooms_created_by_index',
    });

    await queryInterface.addIndex('Rooms', ['deletedAt'], {
      name: 'rooms_deleted_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Rooms');
  },
};
