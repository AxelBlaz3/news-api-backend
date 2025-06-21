import sequelize from "../config/database";
import Article from "./Article";
import Category from "./Category";
import Tag from "./Tag";

Article.belongsToMany(Tag, {
  through: "ArticleTags",
  foreignKey: "articleId",
  as: "tags", // Alias for eager loading
});

Tag.belongsToMany(Article, {
  through: "ArticleTags",
  foreignKey: "tagId",
  as: "articles",
});

Article.belongsToMany(Category, {
  through: "ArticleCategories",
  foreignKey: "articleId",
  as: "categories", // Alias for eager loading
});

Category.belongsToMany(Article, {
  through: "ArticleCategories",
  foreignKey: "categoryId",
  as: "articles",
});

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error syncing database:", error);
    throw error;
  }
};

export { sequelize, syncDatabase, Article, Tag, Category };
