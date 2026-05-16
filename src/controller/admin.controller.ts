import { Request, Response, NextFunction } from "express";
import * as rbacService from "../services/rbac.service";
import { ValidationError } from "../lib/errors";

export async function getAdminRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const roles = await rbacService.getUserRoles(req.user!.id);
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function getAllRoles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const roles = await rbacService.getAllRoles();
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
}

export async function assignRoleToUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { roleName } = req.body;
    const userId = req.params.userId as string;
    if (!userId || !roleName)
      throw new ValidationError("Missing userId or roleName");
    const assignedBy = req.user!.id;
    const role = await rbacService.assignRoleToUser(
      userId,
      roleName,
      assignedBy,
    );
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}

export async function revokeRoleFromUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.params.userId as string;
    const roleName = req.params.roleName as string;
    if (!userId || !roleName)
      throw new ValidationError("Missing userId or roleName");
    const revokedBy = req.user!.id;
    const role = await rbacService.revokeRoleFromUser(
      userId,
      roleName,
      revokedBy,
    );
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
}
