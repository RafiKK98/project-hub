import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { AuthResponse, AuthTokens, AuthUser } from '@projecthub/types';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto } from './dto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly BCRYPT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    await this.users.assertEmailAvailable(dto.email);

    const passwordHash = await bcrypt.hash(dto.password, this.BCRYPT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        name: dto.name.trim(),
        accounts: {
          create: {
            provider: 'local',
            providerAccountId: dto.email.toLowerCase().trim(),
            passwordHash,
          },
        },
      },
    });

    const tokens = await this.tokens.issueTokens(user);
    return { user: this.toAuthUser(user), tokens };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findByEmail(dto.email.toLowerCase().trim());

    if (!user) {
      // Use same error for both "not found" and "wrong password"
      // to prevent user enumeration attacks
      throw new UnauthorizedException('Invalid email or password');
    }

    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'local',
          providerAccountId: dto.email.toLowerCase().trim(),
        },
      },
    });

    if (!account?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      account.passwordHash,
    );
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.tokens.issueTokens(user);
    console.warn({ user: this.toAuthUser(user), tokens });
    return { user: this.toAuthUser(user), tokens };
  }

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    const { userId, newRefreshToken } =
      await this.tokens.rotateRefreshToken(rawRefreshToken);
    const user = await this.users.findByIdOrThrow(userId);
    const accessToken = this.tokens.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string): Promise<void> {
    await this.tokens.revokeAllUserTokens(userId);
  }

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.users.findByIdOrThrow(userId);
    return this.toAuthUser(user);
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
