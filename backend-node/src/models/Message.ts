import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Message attributes interface
export interface MessageAttributes {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  isRead: boolean;
  createdAt?: Date;
  deletedAt?: Date;
}

// Optional fields for creation
export interface MessageCreationAttributes
  extends Optional<MessageAttributes, 'id' | 'isRead' | 'createdAt' | 'deletedAt'> {}

/**
 * Message model - Stores direct messages between users
 */
class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public fromUserId!: string;
  public toUserId!: string;
  public content!: string;
  public isRead!: boolean;
  public readonly createdAt!: Date;
  public readonly deletedAt?: Date;

  static initModel(sequelize: Sequelize): typeof Message {
    Message.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        fromUserId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        toUserId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        isRead: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'Message',
        tableName: 'Messages',
        timestamps: true,
        updatedAt: false, // Messages don't have updatedAt
        paranoid: true, // Enables soft deletes with deletedAt
        indexes: [
          { fields: ['fromUserId'] },
          { fields: ['toUserId'] },
          { fields: ['createdAt'] },
          { fields: ['deletedAt'] },
        ],
      }
    );
    return Message;
  }
}

export default Message;
