import crypto from "crypto";
import jwt from "jsonwebtoken";
import { AUTH_EVENTS } from "../events/auth.events";
import { prisma } from "../config/db";
import { hashPassword, comparePassword } from "../utils/formater";
import { appEvents } from "../lib/event";
import config from "../config/config";

interface TokenPayload {
  userId: string;
  email: string;
  tier: string;
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export async function register(data: { email: string; password: string }) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });
  if (existing) throw new Error("Email already registered");
  const passwordHash = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase().trim(),
      passwordHash,
    },
  });

  // Find the default role
  const defaultRole = await prisma.role.findFirst({
    where: { isDefault: true },
  });

  if (defaultRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: defaultRole.id,
      },
    });
  }

  // Emit and move on. Don't wait for listeners.
  appEvents.emit(AUTH_EVENTS.USER_REGISTERED, {
    id: user.id,
    email: user.email,
    tier: user.tier,
  });

  return { id: user.id, email: user.email, tier: user.tier };
}

export async function login(
  data: { email: string; password: string },
  deviceInfo?: string,
) {
  const user = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase().trim() },
  });

  if (!user || !(await comparePassword(data.password, user.passwordHash))) {
    appEvents.emit(AUTH_EVENTS.LOGIN_FAILED, {
      email: data.email,
      deviceInfo: deviceInfo ?? "unknown",
    });
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    throw new Error("Account is disabled");
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    tier: user.tier,
  });
  const refreshToken = signRefreshToken(user.id);

  // Decode to get the expiry timestamp embedded in the JWT
  const decoded = jwt.decode(refreshToken) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: hashToken(refreshToken),
      expiresAt,
    },
  });

  appEvents.emit(AUTH_EVENTS.USER_LOGGED_IN, {
    userId: user.id,
    deviceInfo: deviceInfo ?? "unknown",
  });

  return { accessToken, refreshToken };
}

export async function refreshToken(token: string) {
  // Verify signature and expiry first (fast, no DB hit on bad tokens)
  let payload: { userId: string };
  try {
    payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch {
    throw new Error("Invalid or expired refresh token");
  }

  // Check the token hash exists in DB (detects revoked/already-rotated tokens)
  const stored = await prisma.refreshToken.findUnique({
    where: { token: hashToken(token) },
    include: { user: { select: { email: true, tier: true, isActive: true } } },
  });

  if (!stored || stored.expiresAt < new Date()) {
    throw new Error("Refresh token not found or expired");
  }

  if (!stored.user.isActive) {
    throw new Error("Account is disabled");
  }

  // Rotate: delete old token, issue a new one
  const newRefreshToken = signRefreshToken(payload.userId);
  const decoded = jwt.decode(newRefreshToken) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);

  await prisma.$transaction([
    prisma.refreshToken.delete({ where: { id: stored.id } }),
    prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        token: hashToken(newRefreshToken),
        expiresAt,
      },
    }),
  ]);

  const accessToken = signAccessToken({
    userId: payload.userId,
    email: stored.user.email,
    tier: stored.user.tier,
  });

  appEvents.emit(AUTH_EVENTS.TOKEN_REFRESHED, { userId: payload.userId });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(token: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: hashToken(token) },
  });
}
