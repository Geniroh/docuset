import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(
      req.body,
      String(req.headers["user-agent"] ?? "unknown"),
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refreshToken(req.body.refreshToken);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.body.refreshToken);
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
}
