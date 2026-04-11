import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/config";

export interface AuthRequest extends Request {
  user: {
    userId: string;
    email: string;
    tier: string;
  };
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or malformed Authorization header" });
    return;
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
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
