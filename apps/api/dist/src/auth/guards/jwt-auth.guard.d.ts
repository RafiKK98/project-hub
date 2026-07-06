import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../token.service';
export declare class JwtAuthGuard implements CanActivate {
    private readonly tokens;
    private readonly reflector;
    constructor(tokens: TokenService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
    private extractBearerToken;
}
//# sourceMappingURL=jwt-auth.guard.d.ts.map