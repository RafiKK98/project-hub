/**
 * Mirrors the backend Permission enum for frontend use.
 * Used to conditionally render UI elements based on user permissions.
 */
export const Permission = {
  PLATFORM_MANAGE_USERS: "platform:manage_users",
  PLATFORM_VIEW_METRICS: "platform:view_metrics",
  PLATFORM_MANAGE_SETTINGS: "platform:manage_settings",
  ORG_CREATE: "org:create",
  ORG_READ: "org:read",
  ORG_UPDATE: "org:update",
  ORG_DELETE: "org:delete",
  ORG_MANAGE_MEMBERS: "org:manage_members",
  ORG_MANAGE_BILLING: "org:manage_billing",
  PROJECT_CREATE: "project:create",
  PROJECT_READ: "project:read",
  PROJECT_UPDATE: "project:update",
  PROJECT_DELETE: "project:delete",
  PROJECT_MANAGE_MEMBERS: "project:manage_members",
  PROJECT_MANAGE_SETTINGS: "project:manage_settings",
  ISSUE_CREATE: "issue:create",
  ISSUE_READ: "issue:read",
  ISSUE_UPDATE: "issue:update",
  ISSUE_DELETE: "issue:delete",
  ISSUE_ASSIGN: "issue:assign",
  ISSUE_CHANGE_STATUS: "issue:change_status",
  COMMENT_CREATE: "comment:create",
  COMMENT_READ: "comment:read",
  COMMENT_UPDATE_OWN: "comment:update_own",
  COMMENT_DELETE_OWN: "comment:delete_own",
  COMMENT_DELETE_ANY: "comment:delete_any",
} as const;

export type Permission = (typeof Permission)[keyof typeof Permission];

export const ROLE_PERMISSION_SETS: Record<string, Permission[]> = {
  USER: [
    Permission.ORG_CREATE,
    Permission.ORG_READ,
    Permission.PROJECT_CREATE,
    Permission.PROJECT_READ,
    Permission.PROJECT_UPDATE,
    Permission.ISSUE_CREATE,
    Permission.ISSUE_READ,
    Permission.ISSUE_UPDATE,
    Permission.ISSUE_ASSIGN,
    Permission.ISSUE_CHANGE_STATUS,
    Permission.COMMENT_CREATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_UPDATE_OWN,
    Permission.COMMENT_DELETE_OWN,
  ],
  ADMIN: Object.values(Permission) as Permission[],
};

/**
 * Returns true if the given role has the specified permission.
 * Used for conditional UI rendering — not a security boundary.
 * Real enforcement always happens on the backend.
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSION_SETS[role] ?? [];
  return permissions.includes(permission);
}
