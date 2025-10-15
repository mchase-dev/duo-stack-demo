/**
 * Models Index - Central export point for all Sequelize models
 * Sets up model associations according to database schema
 */

import { Sequelize } from 'sequelize';
import User from './User';
import RefreshToken from './RefreshToken';
import Message from './Message';
import Event from './Event';
import Room from './Room';
import Page from './Page';

// Track which Sequelize instances have been initialized
const initializedInstances = new WeakSet<Sequelize>();

/**
 * Initialize all models with the given Sequelize instance
 * This must be called before using any models
 */
export function initModels(sequelize: Sequelize): void {
  if (initializedInstances.has(sequelize)) {
    console.log('[models/index.ts] initModels: Already initialized for this sequelize instance');
    return; // Already initialized for this instance
  }

  console.log('[models/index.ts] initModels: Initializing models with sequelize instance');

  // Initialize all models
  User.initModel(sequelize);
  RefreshToken.initModel(sequelize);
  Message.initModel(sequelize);
  Event.initModel(sequelize);
  Room.initModel(sequelize);
  Page.initModel(sequelize);

  console.log('[models/index.ts] initModels: All models initialized');

  // ============================================
  // Model Associations
  // ============================================

  /**
   * User Associations
   * User has many: RefreshTokens, Messages (sent), Messages (received), Events, Rooms, Pages
   */

  // User -> RefreshTokens (1:N)
  User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE',
  });
  RefreshToken.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // User -> Messages as sender (1:N)
  User.hasMany(Message, {
    foreignKey: 'fromUserId',
    as: 'sentMessages',
    onDelete: 'CASCADE',
  });
  Message.belongsTo(User, {
    foreignKey: 'fromUserId',
    as: 'sender',
  });

  // User -> Messages as recipient (1:N)
  User.hasMany(Message, {
    foreignKey: 'toUserId',
    as: 'receivedMessages',
    onDelete: 'CASCADE',
  });
  Message.belongsTo(User, {
    foreignKey: 'toUserId',
    as: 'recipient',
  });

  // User -> Events (1:N)
  User.hasMany(Event, {
    foreignKey: 'createdBy',
    as: 'events',
    onDelete: 'CASCADE',
  });
  Event.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // User -> Rooms (1:N)
  User.hasMany(Room, {
    foreignKey: 'createdBy',
    as: 'rooms',
    onDelete: 'CASCADE',
  });
  Room.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  // User -> Pages (1:N)
  User.hasMany(Page, {
    foreignKey: 'createdBy',
    as: 'pages',
    onDelete: 'CASCADE',
  });
  Page.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator',
  });

  initializedInstances.add(sequelize);
}

// ============================================
// Export all models
// ============================================

export {
  User,
  RefreshToken,
  Message,
  Event,
  Room,
  Page,
};

// Export enums
export { UserRole } from './User';
export { EventVisibility } from './Event';

// Export interfaces
export type { UserAttributes, UserCreationAttributes } from './User';
export type { RefreshTokenAttributes, RefreshTokenCreationAttributes } from './RefreshToken';
export type { MessageAttributes, MessageCreationAttributes } from './Message';
export type { EventAttributes, EventCreationAttributes } from './Event';
export type { RoomAttributes, RoomCreationAttributes } from './Room';
export type { PageAttributes, PageCreationAttributes } from './Page';

// Default export with all models
export default {
  User,
  RefreshToken,
  Message,
  Event,
  Room,
  Page,
};
