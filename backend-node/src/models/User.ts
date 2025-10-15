import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// User role enum
export enum UserRole {
  User = 'User',
  Admin = 'Admin',
  Superuser = 'Superuser',
}

// User attributes interface
export interface UserAttributes {
  id: string;
  email: string;
  emailConfirmed: boolean;
  username: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Optional fields for creation
export interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'emailConfirmed' | 'role' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * User model - Stores user account information and authentication data
 */
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public emailConfirmed!: boolean;
  public username!: string;
  public passwordHash!: string;
  public firstName?: string;
  public lastName?: string;
  public phoneNumber?: string;
  public avatarUrl?: string;
  public bio?: string;
  public role!: UserRole;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  /**
   * Initialize the User model with Sequelize instance
   */
  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        emailConfirmed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        username: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        passwordHash: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        firstName: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        lastName: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        phoneNumber: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        avatarUrl: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        bio: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        role: {
          type: DataTypes.ENUM(...Object.values(UserRole)),
          allowNull: false,
          defaultValue: UserRole.User,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'Users',
        timestamps: true,
        paranoid: true, // Enables soft deletes with deletedAt
        indexes: [
          { unique: true, fields: ['email'] },
          { unique: true, fields: ['username'] },
          { fields: ['deletedAt'] },
        ],
      }
    );
    return User;
  }
}

export default User;
