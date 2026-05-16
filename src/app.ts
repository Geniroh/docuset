import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import "./events";
import "./queues/document.worker";
import { bullBoardAdapter } from "./config/bull-board";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// Mount the dashboard (protect with auth in production)
app.use("/admin/queues", bullBoardAdapter.getRouter());

// API routes
app.use("/api/v1", router);

// Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.path} not found` },
  });
});

// Global error handler
app.use(errorHandler);

export default app;
