import type { AuthResponse, AuthTokens, AuthUser } from '@projecthub/types';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto';
import type { JwtPayload } from './token.service';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(dto: RefreshTokenDto): Promise<AuthTokens>;
    logout(user: JwtPayload): Promise<void>;
    me(user: JwtPayload): Promise<AuthUser>;
    testAdminOnly(): {
        message: string;
    };
    testUserOnly(): {
        message: string;
    };
    testPermission(): {
        message: string;
    };
}
//# sourceMappingURL=auth.controller.d.ts.map