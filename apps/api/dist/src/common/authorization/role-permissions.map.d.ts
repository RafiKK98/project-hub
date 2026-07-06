import { UserRole } from '@prisma/client';
import { Permission } from '../enums/permission.enum';
export declare const ROLE_PERMISSIONS: Record<string, Permission[]>;
export declare function getPermissionsForRole(role: UserRole): Permission[];
export declare function roleHasPermission(role: UserRole, permission: Permission): boolean;
//# sourceMappingURL=role-permissions.map.d.ts.map