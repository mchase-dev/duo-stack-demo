import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Event visibility enum (PascalCase values to match .NET and frontend)
export enum EventVisibility {
  Private = 'Private',
  Public = 'Public',
  Restricted = 'Restricted',
}

// Event attributes interface
export interface EventAttributes {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  visibility: EventVisibility;
  allowedUserIds?: string[];
  createdBy: string;
  color?: string;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Optional fields for creation
export interface EventCreationAttributes
  extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * Event model - Stores calendar events
 * Color coding: Private (gray #6B7280), Public (blue #3B82F6), Restricted (green #10B981)
 */
class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string;
  public title!: string;
  public description?: string;
  public startTime!: Date;
  public endTime!: Date;
  public visibility!: EventVisibility;
  public allowedUserIds?: string[];
  public createdBy!: string;
  public color?: string;
  public location?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  static initModel(sequelize: Sequelize): typeof Event {
    Event.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        startTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        endTime: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        visibility: {
          type: DataTypes.ENUM(...Object.values(EventVisibility)),
          allowNull: false,
        },
        allowedUserIds: {
          type: DataTypes.JSON,
          allowNull: true,
          comment: 'Array of user IDs for restricted events',
        },
        createdBy: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        color: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        location: {
          type: DataTypes.STRING(200),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Event',
        tableName: 'Events',
        timestamps: true,
        paranoid: true, // Enables soft deletes with deletedAt
        indexes: [
          { fields: ['createdBy'] },
          { fields: ['startTime'] },
          { fields: ['endTime'] },
          { fields: ['visibility'] },
          { fields: ['deletedAt'] },
        ],
      }
    );
    return Event;
  }
}

export default Event;
