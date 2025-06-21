"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const models_1 = require("./models");
const articles_1 = __importDefault(require("./routers/articles"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
// Routes
app.get("/", (req, res) => {
    res.send("News API Backend is running!");
});
app.use("/api/articles", articles_1.default);
// Start the server and sync database.
const startServer = async () => {
    try {
        await (0, models_1.syncDatabase)();
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    }
    catch (error) {
        console.error(`Failed to start server:`, error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=app.js.map