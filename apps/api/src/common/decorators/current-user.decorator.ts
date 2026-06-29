import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/token.service';

/**
 * Extracts the JWT payload from the request, injected by JwtAuthGuard.
 *
 * @example
 * @Get('me')
 * getMe(@CurrentUser() user: JwtPayload) {
 *   return user.sub // user id
 * }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    return request.user;
  },
);
