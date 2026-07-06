import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { AuthTokens } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
export declare class TokenService {
    private readonly jwt;
    private readonly config;
    private readonly prisma;
    private readonly logger;
    private readonly BCRYPT_ROUNDS;
    constructor(jwt: JwtService, config: ConfigService, prisma: PrismaService);
    signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
    verifyAccessToken(token: string): JwtPayload;
    createRefreshToken(userId: string, family?: string): Promise<string>;
    rotateRefreshToken(rawRefreshToken: string): Promise<{
        userId: string;
        newRefreshToken: string;
    }>;
    revokeAllUserTokens(userId: string): Promise<void>;
    issueTokens(user: {
        id: string;
        email: string;
        role: string;
    }): Promise<AuthTokens>;
}
//# sourceMappingURL=token.service.d.ts.map