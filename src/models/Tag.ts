import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface TagAttributes {
  id: string;
  name: string;
}

interface TagCreationAttributes extends Optional<TagAttributes, "id"> {}

class Tag extends Model<TagAttributes, TagCreationAttributes> {
  public id!: string;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "tags",
    timestamps: true,
  }
);

export default Tag;
