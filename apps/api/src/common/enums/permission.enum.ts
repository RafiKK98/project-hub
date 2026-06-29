/**
 * Fine-grained permission set for ProjectHub
 *
 * Convention: RESOURCE_ACTION
 * Platform-level permissions are prefixed with PLATFORM_.
 * Workspace-level permissions are prefixed with their resource.
 *
 * Roles are maped to permission sets in role-permission.map.ts
 */
export enum Permission {
  // ── Platform ───────────────────────────────────────────────────────────────
  PLATFORM_MANAGE_USERS = 'platform:manage_users',
  PLATFORM_VIEW_METRICS = 'platform:view_metrics',
  PLATFORM_MANAGE_SETTINGS = 'platform:manage_settings',

  // ── Organizations ──────────────────────────────────────────────────────────
  ORG_CREATE = 'org:create',
  ORG_READ = 'org:read',
  ORG_UPDATE = 'org:update',
  ORG_DELETE = 'org:delete',
  ORG_MANAGE_MEMBERS = 'org:manage_members',
  ORG_MANAGE_BILLING = 'org:manage_billing',

  // ── Projects ───────────────────────────────────────────────────────────────
  PROJECT_CREATE = 'project:create',
  PROJECT_READ = 'project:read',
  PROJECT_UPDATE = 'project:update',
  PROJECT_DELETE = 'project:delete',
  PROJECT_MANAGE_MEMBERS = 'project:manage_members',
  PROJECT_MANAGE_SETTINGS = 'project:manage_settings',

  // ── Issues ─────────────────────────────────────────────────────────────────
  ISSUE_CREATE = 'issue:create',
  ISSUE_READ = 'issue:read',
  ISSUE_UPDATE = 'issue:update',
  ISSUE_DELETE = 'issue:delete',
  ISSUE_ASSIGN = 'issue:assign',
  ISSUE_CHANGE_STATUS = 'issue:change_status',

  // ── Comments ───────────────────────────────────────────────────────────────
  COMMENT_CREATE = 'comment:create',
  COMMENT_READ = 'comment:read',
  COMMENT_UPDATE_OWN = 'comment:update_own',
  COMMENT_DELETE_OWN = 'comment:delete_own',
  COMMENT_DELETE_ANY = 'comment:delete_any',
}
