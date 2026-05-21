import { Router } from "express";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";
import {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  chatLimiter,
} from "../middleware/rateLimiter.middleware";

const router = Router();

router.use("/auth", authLimiter, authRouter);
router.use("/admin", adminRouter);

// Add protected routes like this:
// router.use("/documents", authenticate, documentsRouter);

// All authenticated API routes: general limiter
// app.use('/api/v1', apiLimiter);

export default router;
