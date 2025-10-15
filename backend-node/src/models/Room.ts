import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Room attributes interface
export interface RoomAttributes {
  id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  createdBy: string;
  createdAt?: Date;
  deletedAt?: Date;
}

// Optional fields for creation
export interface RoomCreationAttributes
  extends Optional<RoomAttributes, 'id' | 'isPublic' | 'createdAt' | 'deletedAt'> {}

/**
 * Room model - Stores chat room information
 */
class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public isPublic!: boolean;
  public createdBy!: string;
  public readonly createdAt!: Date;
  public readonly deletedAt?: Date;

  static initModel(sequelize: Sequelize): typeof Room {
    Room.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        slug: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        isPublic: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
      },
      {
        sequelize,
        modelName: 'Room',
        tableName: 'Rooms',
        timestamps: true,
        updatedAt: false, // Rooms don't have updatedAt
        paranoid: true, // Enables soft deletes with deletedAt
        indexes: [
          { unique: true, fields: ['slug'] },
          { fields: ['createdBy'] },
          { fields: ['deletedAt'] },
        ],
      }
    );
    return Room;
  }
}

export default Room;
