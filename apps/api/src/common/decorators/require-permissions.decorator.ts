import { SetMetadata } from '@nestjs/common';
import { Permission } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Restricts a route to users whose role grants all of the specified permissions.
 *
 * Prefer this over @Roles() for feature-level authorization — it stays
 * correct even if role definitions change.
 *
 * @example
 * @RequirePermissions(Permission.PROJECT_DELETE)
 * @Delete(':id')
 * deleteProject() { ... }
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
