import "dotenv/config";
import express, { Application, Request, Response } from "express";
import { syncDatabase } from "./models";
import articlesRouter from "./routers/articles";

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("News API Backend is running!");
});

app.use("/api/articles", articlesRouter);

// Start the server and sync database.
const startServer = async () => {
  try {
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server:`, error);
    process.exit(1);
  }
};

startServer();
