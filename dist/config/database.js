"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not defined in environment variables.");
}
const sequelize = new sequelize_1.Sequelize(databaseUrl, {
    dialect: "postgres",
    logging: false,
});
exports.default = sequelize;
//# sourceMappingURL=database.js.map