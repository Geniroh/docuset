import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";
import { PERMISSIONS } from "../constants/permissions";
import * as adminController from "../controller/admin.controller";

const router = Router();

router.get("/users/roles", authenticate, adminController.getAdminRoles);

router.get(
  "/roles",
  authenticate,
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  adminController.getAllRoles,
);

router.post(
  "/users/:userId/roles",
  authenticate,
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  adminController.assignRoleToUser,
);

router.delete(
  "/users/:userId/roles/:roleName",
  authenticate,
  requirePermission(PERMISSIONS.ROLES_MANAGE),
  adminController.revokeRoleFromUser,
);

export default router;
