import { Model, DataTypes, Optional, Sequelize } from 'sequelize';

// Page attributes interface
export interface PageAttributes {
  id: string;
  title: string;
  slug: string;
  content: string;
  isPublished: boolean;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

// Optional fields for creation
export interface PageCreationAttributes
  extends Optional<PageAttributes, 'id' | 'isPublished' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * Page model - Stores CMS pages for Superuser management
 * Content can be markdown or HTML
 */
class Page extends Model<PageAttributes, PageCreationAttributes> implements PageAttributes {
  public id!: string;
  public title!: string;
  public slug!: string;
  public content!: string;
  public isPublished!: boolean;
  public createdBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  static initModel(sequelize: Sequelize): typeof Page {
    Page.init(
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
        slug: {
          type: DataTypes.STRING(200),
          allowNull: false,
          unique: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        isPublished: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
        modelName: 'Page',
        tableName: 'Pages',
        timestamps: true,
        paranoid: true, // Enables soft deletes with deletedAt
        indexes: [
          { unique: true, fields: ['slug'] },
          { fields: ['isPublished'] },
          { fields: ['createdBy'] },
          { fields: ['deletedAt'] },
        ],
      }
    );
    return Page;
  }
}

export default Page;
