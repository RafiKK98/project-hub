import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { JwtPayload } from '../../auth/token.service';
import { roleHasPermission } from '../authorization/role-permissions.map';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Permission } from '../enums/permission.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No role or permission requirements - allow through
    if (!requiredRoles?.length && !requiredPermissions?.length) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();

    const user = request.user;
    if (!user) throw new ForbiddenException('No authenticated user found');

    const userRole = user.role as UserRole;

    // ── Role check ────────────────────────────────────────────────────────────
    if (requiredRoles?.length) {
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `This action requires one of the following roles: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // ── Permission check ──────────────────────────────────────────────────────
    if (requiredPermissions?.length) {
      const missingPermissions = requiredPermissions.filter(
        (permission) => !roleHasPermission(userRole, permission),
      );

      if (missingPermissions.length > 0) {
        throw new ForbiddenException(
          `Missing required permissions: ${missingPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}
