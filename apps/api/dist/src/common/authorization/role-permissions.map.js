"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_PERMISSIONS = void 0;
exports.getPermissionsForRole = getPermissionsForRole;
exports.roleHasPermission = roleHasPermission;
const client_1 = require("@prisma/client");
const permission_enum_1 = require("../enums/permission.enum");
exports.ROLE_PERMISSIONS = {
    [client_1.UserRole.USER]: [
        permission_enum_1.Permission.ORG_CREATE,
        permission_enum_1.Permission.ORG_READ,
        permission_enum_1.Permission.PROJECT_CREATE,
        permission_enum_1.Permission.PROJECT_READ,
        permission_enum_1.Permission.PROJECT_UPDATE,
        permission_enum_1.Permission.ISSUE_CREATE,
        permission_enum_1.Permission.ISSUE_READ,
        permission_enum_1.Permission.ISSUE_UPDATE,
        permission_enum_1.Permission.ISSUE_ASSIGN,
        permission_enum_1.Permission.ISSUE_CHANGE_STATUS,
        permission_enum_1.Permission.COMMENT_CREATE,
        permission_enum_1.Permission.COMMENT_READ,
        permission_enum_1.Permission.COMMENT_UPDATE_OWN,
        permission_enum_1.Permission.COMMENT_DELETE_OWN,
    ],
    [client_1.UserRole.SUPPORT]: [
        permission_enum_1.Permission.PLATFORM_VIEW_METRICS,
        permission_enum_1.Permission.ORG_READ,
        permission_enum_1.Permission.PROJECT_READ,
        permission_enum_1.Permission.ISSUE_READ,
        permission_enum_1.Permission.ISSUE_UPDATE,
        permission_enum_1.Permission.COMMENT_READ,
        permission_enum_1.Permission.COMMENT_DELETE_ANY,
    ],
    [client_1.UserRole.ADMIN]: [
        ...Object.values(permission_enum_1.Permission),
    ],
};
function getPermissionsForRole(role) {
    return exports.ROLE_PERMISSIONS[role] ?? [];
}
function roleHasPermission(role, permission) {
    return getPermissionsForRole(role).includes(permission);
}
//# sourceMappingURL=role-permissions.map.js.map