'use strict';

/**
 * Migration: Create Messages table
 *
 * Creates the Messages table for storing direct messages between users.
 * Includes foreign key references to Users table (for sender and recipient)
 * and indexes for fromUserId, toUserId, createdAt, and deletedAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fromUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      toUserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('Messages', ['fromUserId'], {
      name: 'messages_from_user_id_index',
    });

    await queryInterface.addIndex('Messages', ['toUserId'], {
      name: 'messages_to_user_id_index',
    });

    await queryInterface.addIndex('Messages', ['createdAt'], {
      name: 'messages_created_at_index',
    });

    await queryInterface.addIndex('Messages', ['deletedAt'], {
      name: 'messages_deleted_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Messages');
  },
};
