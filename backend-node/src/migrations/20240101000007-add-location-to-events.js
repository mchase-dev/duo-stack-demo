'use strict';

/**
 * Migration: Add location column to Events table
 *
 * Adds a location field to store event location information
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Events', 'location', {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Events', 'location');
  },
};
