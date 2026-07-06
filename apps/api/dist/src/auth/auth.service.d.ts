import type { AuthResponse, AuthTokens, AuthUser } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { TokenService } from './token.service';
export declare class AuthService {
    private readonly prisma;
    private readonly users;
    private readonly tokens;
    private readonly BCRYPT_ROUNDS;
    constructor(prisma: PrismaService, users: UsersService, tokens: TokenService);
    register(dto: RegisterDto): Promise<AuthResponse>;
    login(dto: LoginDto): Promise<AuthResponse>;
    refresh(rawRefreshToken: string): Promise<AuthTokens>;
    logout(userId: string): Promise<void>;
    getMe(userId: string): Promise<AuthUser>;
    private toAuthUser;
}
//# sourceMappingURL=auth.service.d.ts.map