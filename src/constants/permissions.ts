export const PERMISSIONS = {
  DOCUMENTS_CREATE:     "documents:create",
  DOCUMENTS_READ:       "documents:read",
  DOCUMENTS_UPDATE:     "documents:update",
  DOCUMENTS_DELETE:     "documents:delete",
  CONVERSATIONS_CREATE: "conversations:create",
  CONVERSATIONS_READ:   "conversations:read",
  USERS_READ:           "users:read",
  USERS_MANAGE:         "users:manage",
  ROLES_MANAGE:         "roles:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
