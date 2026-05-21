import express, { Request, Response } from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import cors from "cors";
import { swaggerSpec } from "./config/swagger";
import router from "./routes";
import { errorHandler } from "./middleware/error.middleware";
import { verifyWebhookSignature } from "./middleware/webhook.middleware";
import { sanitizeInput } from "./middleware/sanitize.middleware";
import { bullBoardAdapter } from "./config/bull-board";
import "./events";
import "./queues/document.worker";
import { requestLogger } from "./middleware/requestLogger.middleware";
import { metricsRegistry } from "./lib/metrics";
import { metricsMiddleware } from "./middleware/metrics.middleware";
import healthRoutes from "./routes/health.routes";

const app = express();
const secret = process.env.WEBHOOK_SECRET!;

// 1. Security headers (first, applies to all responses)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "validator.swagger.io"],
      },
    },
  }),
);

// 2. Webhook route (BEFORE global body parsers)
app.use(
  "/webhooks",
  express.raw({
    type: "application/json",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }),
  verifyWebhookSignature(secret, "x-signature"),
);

// 3. Global body parsers
app.use(express.json({ limit: "10mb" })); // Consider adding limits
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Input sanitization (after body parsing)
app.use(sanitizeInput);

app.use(requestLogger);

// Parse allowed origins from env variable (separated by |)
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split("|").map((origin) => origin.trim())
  : ["http://localhost:3001"];

// Add pattern matching for wildcard subdomains
const isOriginAllowed = (origin: string, allowedList: string[]): boolean => {
  // Check exact match first
  if (allowedList.includes(origin)) return true;

  // Check for wildcard patterns (e.g., https://*.mydomain.com)
  for (const allowed of allowedList) {
    if (allowed.includes("*")) {
      const pattern = allowed.replace(/\./g, "\\.").replace(/\*/g, ".*");
      const regex = new RegExp(`^${pattern}$`);
      if (regex.test(origin)) return true;
    }
  }

  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (isOriginAllowed(origin, allowedOrigins)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  }),
);

// 5. Health check (before rate limiting if you add it)
app.use(healthRoutes);

app.use(metricsMiddleware);

// Metrics endpoint (no auth — Prometheus needs to scrape it)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", metricsRegistry.contentType);
  res.send(await metricsRegistry.metrics());
});

// 6. Admin routes (add authentication middleware here!)
app.use("/admin/queues", /* authMiddleware, */ bullBoardAdapter.getRouter());

// 7. API documentation
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 8. API routes
app.use("/api/v1", router);

// 9. 404 handler (after all valid routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: `Route ${req.path} not found` },
  });
});

// 10. Global error handler (always last)
app.use(errorHandler);

export default app;
