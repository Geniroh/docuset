export const authSchemas: Record<string, object> = {
  RegisterRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: {
        type: "string",
        minLength: 8,
        maxLength: 128,
        example: "Password123",
        description:
          "Must be at least 8 characters, contain an uppercase letter and a number",
      },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", example: "Password123" },
    },
  },

  RefreshRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", example: "<jwt-refresh-token>" },
    },
  },

  LogoutRequest: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", example: "<jwt-refresh-token>" },
    },
  },

  AuthUser: {
    type: "object",
    properties: {
      id: { type: "string", format: "uuid" },
      email: { type: "string", format: "email" },
      tier: { type: "string", example: "free" },
    },
  },

  TokenPair: {
    type: "object",
    properties: {
      accessToken: { type: "string" },
      refreshToken: { type: "string" },
      user: { $ref: "#/components/schemas/AuthUser" },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "UNAUTHORIZED" },
          message: { type: "string", example: "Authentication required" },
        },
      },
    },
  },
};
