import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../services/rbac.service";
import { ForbiddenError } from "../lib/errors";

export function requirePermission(...requiredPermissions: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!(req as any).user) {
        throw new ForbiddenError("Not authenticated");
      }

      const userPermissions = await getUserPermissions(
        (req as any).user.userId,
      );

      // Check that the user has ALL required permissions

      const missing = requiredPermissions.filter(
        (p) => !userPermissions.has(p),
      );

      if (missing.length > 0) {
        throw new ForbiddenError(`You do not have the required permission.`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
