import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to users with one of the specified platform roles.
 *
 * @example
 * @Roles(UserRole.ADMIN)
 * @Delete(':id')
 * deleteUser() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
