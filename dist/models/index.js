"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = exports.Tag = exports.Article = exports.syncDatabase = exports.sequelize = void 0;
const database_1 = __importDefault(require("../config/database"));
exports.sequelize = database_1.default;
const Article_1 = __importDefault(require("./Article"));
exports.Article = Article_1.default;
const Category_1 = __importDefault(require("./Category"));
exports.Category = Category_1.default;
const Tag_1 = __importDefault(require("./Tag"));
exports.Tag = Tag_1.default;
Article_1.default.belongsToMany(Tag_1.default, {
    through: "ArticleTags",
    foreignKey: "articleId",
    as: "tags", // Alias for eager loading
});
Tag_1.default.belongsToMany(Article_1.default, {
    through: "ArticleTags",
    foreignKey: "tagId",
    as: "articles",
});
Article_1.default.belongsToMany(Category_1.default, {
    through: "ArticleCategories",
    foreignKey: "articleId",
    as: "categories", // Alias for eager loading
});
Category_1.default.belongsToMany(Article_1.default, {
    through: "ArticleCategories",
    foreignKey: "categoryId",
    as: "articles",
});
const syncDatabase = async () => {
    try {
        await database_1.default.sync({ alter: true });
        console.log("Database synchronized successfully.");
    }
    catch (error) {
        console.error("Error syncing database:", error);
        throw error;
    }
};
exports.syncDatabase = syncDatabase;
//# sourceMappingURL=index.js.map