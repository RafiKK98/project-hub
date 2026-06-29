import { UserRole } from '@prisma/client';
import { Permission } from '../enums/permission.enum';

/**
 * Defines which permissions each platform role grants.
 *
 * This is the single source of truth for role capabilities
 * Changing a role's permissions here propagates everywhere automatically.
 */
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [UserRole.USER]: [
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

  [UserRole.SUPPORT]: [
    // Support can read everything but not modify platform settings
    Permission.PLATFORM_VIEW_METRICS,
    Permission.ORG_READ,
    Permission.PROJECT_READ,
    Permission.ISSUE_READ,
    Permission.ISSUE_UPDATE,
    Permission.COMMENT_READ,
    Permission.COMMENT_DELETE_ANY,
  ],

  [UserRole.ADMIN]: [
    // Admins get everything
    ...Object.values(Permission),
  ],
};

/**
 * Returns the full permission set for a given role.
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Checks whether a role has a specific permission.
 */
export function roleHasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return getPermissionsForRole(role).includes(permission);
}
