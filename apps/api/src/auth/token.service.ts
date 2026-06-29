import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { AuthTokens } from '@projecthub/types';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly BCRYPT_ROUNDS = 10;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // ── Access token ────────────────────────────────────────────────────────────

  signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwt.sign(payload, {
      secret: this.config.getOrThrow('app.jwt.secret'),
      expiresIn:
        this.config.get<JwtSignOptions['expiresIn']>('app.jwt.expiresIn')!,
    });
  }

  verifyAccessToken(token: string): JwtPayload {
    try {
      return this.jwt.verify<JwtPayload>(token, {
        secret: this.config.get<string>('app.jwt.secret')!,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  // ── Refresh token ───────────────────────────────────────────────────────────

  /**
   * Creates a new refresh token, hashes it, and persists it.
   * Optionally accepts a family ID (for rotation within an existing session).
   */
  async createRefreshToken(userId: string, family?: string): Promise<string> {
    const rawToken = randomUUID();
    const tokenFamily = family ?? randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, this.BCRYPT_ROUNDS);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: { userId, tokenHash, family: tokenFamily, expiresAt },
    });

    // Return the raw token — client stores this, we only keep the hash
    // Format: <family>.<rawToken> so we can look up the family on refresh
    return `${tokenFamily}.${rawToken}`;
  }

  /**
   * Validates a refresh token and rotates it.
   * Returns the userId and the new token pair.
   *
   * Rotation breach detection:
   * If a token from a revoked family is presented, all tokens in that
   * family are deleted, forcing the legitimate user to re-authenticate.
   */
  async rotateRefreshToken(
    rawRefreshToken: string,
  ): Promise<{ userId: string; newRefreshToken: string }> {
    const [family, token] = rawRefreshToken.split('.');

    if (!family || !token) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    // Find all tokens in this family
    const familyTokens = await this.prisma.refreshToken.findMany({
      where: { family },
    });

    if (familyTokens.length === 0) {
      throw new UnauthorizedException('Refresh token family not found');
    }

    // Try to match the presented token against stored hashes in this family
    let matchedToken: (typeof familyTokens)[number] | null = null;
    for (const stored of familyTokens) {
      const isMatch = await bcrypt.compare(token, stored.tokenHash);
      if (isMatch) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      // Token reuse detected — someone is replaying an old token.
      // Invalidate the entire family to protect the legitimate user.
      this.logger.warn(
        `Refresh token reuse detected for family: ${family}. Revoking all family tokens.`,
      );
      await this.prisma.refreshToken.deleteMany({ where: { family } });
      throw new UnauthorizedException(
        'Refresh token reuse detected. Please log in again.',
      );
    }

    if (matchedToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Rotate: delete the used token, issue a new one in the same family
    await this.prisma.refreshToken.delete({ where: { id: matchedToken.id } });
    const newRefreshToken = await this.createRefreshToken(
      matchedToken.userId,
      family,
    );

    return { userId: matchedToken.userId, newRefreshToken };
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  // ── Combined token issuance ─────────────────────────────────────────────────

  async issueTokens(user: {
    id: string;
    email: string;
    role: string;
  }): Promise<AuthTokens> {
    const accessToken = this.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await this.createRefreshToken(user.id);
    return { accessToken, refreshToken };
  }
}
