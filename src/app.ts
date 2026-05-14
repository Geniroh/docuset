import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import router from "./routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// API routes
app.use("/api", router);

// Swagger UI
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
