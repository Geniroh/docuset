import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";
import { UnauthorizedError } from "../lib/errors";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    tier: string;
  };
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Missing or malformed Authorization header"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as {
      userId: string;
      email: string;
      tier: string;
    };

    (req as AuthRequest).user = {
      userId: payload.userId,
      email: payload.email,
      tier: payload.tier,
    };

    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}
