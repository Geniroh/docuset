import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { registerSchema, loginSchema, refreshSchema } from "../validators/auth.validators";
import * as authController from "../controller/auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
