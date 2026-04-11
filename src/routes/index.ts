import { Router } from "express";
import authRouter from "./auth.routes";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use("/auth", authRouter);

// All routes registered below this line require a valid access token
router.use(authenticate);

export default router;
