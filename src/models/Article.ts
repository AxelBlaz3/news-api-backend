import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface ArticleAttributes {
  id: string;
  title: string;
  content: string;
  publishedAt: Date;
  imageUrl?: string;
  videoUrl?: string;
}

// Define the attributes that are optional for creation
interface ArticleCreationAttributes
  extends Optional<ArticleAttributes, "id" | "publishedAt"> {}

class Article extends Model<ArticleAttributes, ArticleCreationAttributes> {
  public id!: string;
  public title!: string;
  public content!: string;
  public publishedAt!: Date;
  public imageUrl?: string;
  public videoUrl?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { sequelize, tableName: "articles", timestamps: true }
);

export default Article;
