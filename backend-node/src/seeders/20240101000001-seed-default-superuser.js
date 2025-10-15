'use strict';

const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

/**
 * Seeder: Create default Superuser account
 *
 * Seeds the database with a default Superuser account for initial system access.
 * This account should have its password changed after first login.
 *
 * Default credentials:
 * - Email: superuser@example.com
 * - Username: superuser
 * - Password: please_change_123
 * - Role: Superuser
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash the default password using bcrypt with 10 rounds
    const passwordHash = await bcrypt.hash('please_change_123', 10);

    // Create the default superuser
    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(),
        email: 'superuser@example.com',
        emailConfirmed: true,
        username: 'superuser',
        passwordHash: passwordHash,
        firstName: 'Super',
        lastName: 'User',
        phoneNumber: null,
        avatarUrl: null,
        bio: null,
        role: 'Superuser',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Remove the default superuser account
    await queryInterface.bulkDelete('Users', {
      email: 'superuser@example.com',
    });
  },
};
