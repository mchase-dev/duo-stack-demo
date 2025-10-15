'use strict';

/**
 * Migration: Create Events table
 *
 * Creates the Events table for storing calendar events with support
 * for private, public, and restricted visibility. Includes foreign key
 * reference to Users table and indexes for createdBy, startTime, endTime,
 * visibility, and deletedAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      startTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      visibility: {
        type: Sequelize.ENUM('private', 'public', 'restricted'),
        allowNull: false,
      },
      allowedUserIds: {
        type: Sequelize.JSON,
        allowNull: true,
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
      color: {
        type: Sequelize.STRING(20),
        allowNull: true,
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
    await queryInterface.addIndex('Events', ['createdBy'], {
      name: 'events_created_by_index',
    });

    await queryInterface.addIndex('Events', ['startTime'], {
      name: 'events_start_time_index',
    });

    await queryInterface.addIndex('Events', ['endTime'], {
      name: 'events_end_time_index',
    });

    await queryInterface.addIndex('Events', ['visibility'], {
      name: 'events_visibility_index',
    });

    await queryInterface.addIndex('Events', ['deletedAt'], {
      name: 'events_deleted_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Events');
  },
};
