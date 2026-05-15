import { Router } from "express";
import authRouter from "./auth.routes";

const router = Router();

router.use("/auth", authRouter);

// Add protected routes like this:
// router.use("/documents", authenticate, documentsRouter);

export default router;
