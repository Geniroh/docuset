const bearerAuth = {
  security: [{ bearerAuth: [] }],
};

export const adminPaths: Record<string, object> = {
  "/admin/users/roles": {
    get: {
      ...bearerAuth,
      tags: ["Admin"],
      summary: "Get roles for the authenticated user",
      responses: {
        200: {
          description: "Roles retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/UserRole" },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/admin/roles": {
    get: {
      ...bearerAuth,
      tags: ["Admin"],
      summary: "List all roles with their permissions",
      description: "Requires `roles:manage` permission.",
      responses: {
        200: {
          description: "Roles retrieved successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Role" },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/admin/users/{userId}/roles": {
    post: {
      ...bearerAuth,
      tags: ["Admin"],
      summary: "Assign a role to a user",
      description: "Requires `roles:manage` permission.",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/AssignRoleRequest" },
          },
        },
      },
      responses: {
        200: {
          description: "Role assigned successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Role" },
                },
              },
            },
          },
        },
        400: {
          description: "Missing userId or roleName",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "User or role not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },

  "/admin/users/{userId}/roles/{roleName}": {
    delete: {
      ...bearerAuth,
      tags: ["Admin"],
      summary: "Revoke a role from a user",
      description: "Requires `roles:manage` permission.",
      parameters: [
        {
          name: "userId",
          in: "path",
          required: true,
          schema: { type: "string", format: "uuid" },
        },
        {
          name: "roleName",
          in: "path",
          required: true,
          schema: { type: "string", example: "admin" },
        },
      ],
      responses: {
        200: {
          description: "Role revoked successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  data: { $ref: "#/components/schemas/Role" },
                },
              },
            },
          },
        },
        400: {
          description: "Missing userId or roleName",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        401: {
          description: "Missing or invalid token",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        403: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        404: {
          description: "User or role not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
    },
  },
};
