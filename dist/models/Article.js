"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Article extends sequelize_1.Model {
    id;
    title;
    content;
    publishedAt;
    imageUrl;
    videoUrl;
    createdAt;
    updatedAt;
}
Article.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    publishedAt: {
        type: sequelize_1.DataTypes.DATE,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    videoUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, { sequelize: database_1.default, tableName: "articles", timestamps: true });
exports.default = Article;
//# sourceMappingURL=Article.js.map