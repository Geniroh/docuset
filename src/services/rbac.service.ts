import { prisma } from "../config/db";
import { NotFoundError } from "../lib/errors";
import { appEvents } from "../lib/event";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  CACHE_TTL,
  cacheGetOrSet,
} from "../lib/cache";

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const cacheKey = `permissions:${userId}`;
  const permissions = await cacheGetOrSet(
    cacheKey,
    CACHE_TTL.PERMISSIONS,
    async () => {
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      });
      const perms = new Set<string>();
      for (const ur of userRoles) {
        for (const rp of ur.role.permissions) {
          perms.add(rp.permission.name);
        }
      }
      return [...perms]; // Return as array for serialization
    },
  );
  return new Set(permissions);
}

export async function getAllRoles() {
  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  return roles;
}

export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  return userRoles.map((userRole) => ({
    roleId: userRole.roleId,
    roleName: userRole.role.name,
    roleDescription: userRole.role.description,
    assignedAt: userRole.assignedAt,
    assignedBy: userRole.assignedBy,
    permissions: userRole.role.permissions.map((rp) => ({
      id: rp.permission.id,
      name: rp.permission.name,
      resource: rp.permission.resource,
      action: rp.permission.action,
      description: rp.permission.description,
    })),
  }));
}

export async function assignRoleToUser(
  userId: string,
  roleName: string,
  assignedBy: string,
) {
  const role = await prisma.role.findUnique({
    where: { name: roleName.toLowerCase().trim() },
  });
  if (!role) throw new NotFoundError(`Role '${roleName}' not found`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: {
      userId,
      roleId: role.id,
      assignedBy,
    },
  });

  // Audit event
  appEvents.emit("admin:role-assigned", {
    targetUserId: userId,
    roleName,
    assignedBy,
  });

  return role;
}

export async function revokeRoleFromUser(
  userId: string,
  roleName: string,
  revokedBy: string,
) {
  const role = await prisma.role.findUnique({
    where: { name: roleName.toLowerCase().trim() },
  });
  if (!role) throw new NotFoundError(`Role '${roleName}' not found`);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  await prisma.userRole.deleteMany({
    where: { userId, roleId: role.id },
  });

  // Audit event
  appEvents.emit("admin:role-revoked", {
    targetUserId: userId,
    roleName,
    revokedBy,
  });

  return role;
}
