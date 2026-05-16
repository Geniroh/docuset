import { Router } from "express";
import authRouter from "./auth.routes";
import adminRouter from "./admin.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/admin", adminRouter);

// Add protected routes like this:
// router.use("/documents", authenticate, documentsRouter);

export default router;
