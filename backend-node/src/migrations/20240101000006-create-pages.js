'use strict';

/**
 * Migration: Create Pages table
 *
 * Creates the Pages table for storing CMS pages managed by Superusers.
 * Includes foreign key reference to Users table and indexes for
 * slug, isPublished, createdBy, and deletedAt.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pages', {
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
      slug: {
        type: Sequelize.STRING(200),
        allowNull: false,
        unique: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex('Pages', ['slug'], {
      unique: true,
      name: 'pages_slug_unique',
    });

    await queryInterface.addIndex('Pages', ['isPublished'], {
      name: 'pages_is_published_index',
    });

    await queryInterface.addIndex('Pages', ['createdBy'], {
      name: 'pages_created_by_index',
    });

    await queryInterface.addIndex('Pages', ['deletedAt'], {
      name: 'pages_deleted_at_index',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Pages');
  },
};
