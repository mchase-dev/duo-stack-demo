import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// RefreshToken attributes interface
export interface RefreshTokenAttributes {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt?: Date;
}

// Optional fields for creation
export interface RefreshTokenCreationAttributes
  extends Optional<RefreshTokenAttributes, 'id' | 'revoked' | 'createdAt'> {}

/**
 * RefreshToken model - Stores refresh tokens for JWT authentication
 */
class RefreshToken
  extends Model<RefreshTokenAttributes, RefreshTokenCreationAttributes>
  implements RefreshTokenAttributes
{
  public id!: string;
  public userId!: string;
  public tokenHash!: string;
  public expiresAt!: Date;
  public revoked!: boolean;
  public readonly createdAt!: Date;

  static initModel(sequelize: Sequelize): typeof RefreshToken {
    RefreshToken.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Users',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        tokenHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        expiresAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        revoked: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        modelName: 'RefreshToken',
        tableName: 'RefreshTokens',
        timestamps: true,
        updatedAt: false, // RefreshTokens don't have updatedAt
        paranoid: false, // No soft deletes for RefreshTokens
        indexes: [
          { fields: ['userId'] },
          { fields: ['tokenHash'] },
          { fields: ['expiresAt'] },
        ],
      }
    );
    return RefreshToken;
  }
}

export default RefreshToken;
