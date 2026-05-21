export const adminSchemas: Record<string, object> = {
  Permission: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "documents:create" },
      resource: { type: "string", example: "documents" },
      action: { type: "string", example: "create" },
      description: { type: "string", example: "Upload documents" },
    },
  },

  Role: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      name: { type: "string", example: "admin" },
      description: { type: "string", example: "Full system access" },
      isDefault: { type: "boolean", example: false },
      permissions: {
        type: "array",
        items: { $ref: "#/components/schemas/Permission" },
      },
    },
  },

  UserRole: {
    type: "object",
    properties: {
      roleId: { type: "string", format: "uuid" },
      roleName: { type: "string", example: "member" },
      roleDescription: { type: "string", example: "Standard user" },
      assignedAt: { type: "string", format: "date-time" },
      assignedBy: { type: "string", format: "uuid" },
      permissions: {
        type: "array",
        items: { $ref: "#/components/schemas/Permission" },
      },
    },
  },

  AssignRoleRequest: {
    type: "object",
    required: ["roleName"],
    properties: {
      roleName: { type: "string", example: "admin" },
    },
  },
};
