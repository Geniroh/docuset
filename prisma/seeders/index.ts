import { prisma } from "../../src/config/db";
import { PERMISSIONS } from "../../src/constants/permissions";

const permissionDefs = [
  {
    name: PERMISSIONS.DOCUMENTS_CREATE,
    resource: "documents",
    action: "create",
    description: "Upload documents",
  },
  {
    name: PERMISSIONS.DOCUMENTS_READ,
    resource: "documents",
    action: "read",
    description: "View documents",
  },
  {
    name: PERMISSIONS.DOCUMENTS_UPDATE,
    resource: "documents",
    action: "update",
    description: "Edit document metadata",
  },
  {
    name: PERMISSIONS.DOCUMENTS_DELETE,
    resource: "documents",
    action: "delete",
    description: "Delete documents",
  },
  {
    name: PERMISSIONS.CONVERSATIONS_CREATE,
    resource: "conversations",
    action: "create",
    description: "Start conversations",
  },
  {
    name: PERMISSIONS.CONVERSATIONS_READ,
    resource: "conversations",
    action: "read",
    description: "View conversations",
  },
  {
    name: PERMISSIONS.USERS_READ,
    resource: "users",
    action: "read",
    description: "View user list",
  },
  {
    name: PERMISSIONS.USERS_MANAGE,
    resource: "users",
    action: "manage",
    description: "Manage user accounts",
  },
  {
    name: PERMISSIONS.ROLES_MANAGE,
    resource: "roles",
    action: "manage",
    description: "Manage roles and permissions",
  },
];

async function seedRBAC() {
  console.log("Starting RBAC seeding...");

  // Upsert all permissions
  const permissions: Record<string, any> = {};
  for (const perm of permissionDefs) {
    permissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
    console.log(`✓ Permission: ${perm.name}`);
  }

  // Define roles with their permissions
  const roleDefs = [
    {
      name: "admin",
      description: "Full system access",
      isDefault: false,
      permissions: Object.keys(permissions), // All permissions
    },
    {
      name: "member",
      description: "Standard user",
      isDefault: true,
      permissions: [
        PERMISSIONS.DOCUMENTS_CREATE,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPDATE,
        PERMISSIONS.CONVERSATIONS_CREATE,
        PERMISSIONS.CONVERSATIONS_READ,
      ],
    },
    {
      name: "viewer",
      description: "Read-only access",
      isDefault: false,
      permissions: [PERMISSIONS.DOCUMENTS_READ, PERMISSIONS.CONVERSATIONS_READ],
    },
  ];

  for (const roleDef of roleDefs) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: {},
      create: {
        name: roleDef.name,
        description: roleDef.description,
        isDefault: roleDef.isDefault,
      },
    });

    // Link permissions to role
    for (const permName of roleDef.permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permissions[permName].id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permissions[permName].id,
        },
      });
    }
    console.log(
      `✓ Role: ${roleDef.name} with ${roleDef.permissions.length} permissions`,
    );
  }

  console.log("✅ RBAC seeding completed!");
  console.log(`  - ${permissionDefs.length} permissions created`);
  console.log(`  - ${roleDefs.length} roles created`);
}

seedRBAC()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    // @ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
