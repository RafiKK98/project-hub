import { beforeEach, describe, it, jest } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { TokenService } from '../auth/token.service';
import { PrismaService } from '../database/prisma.service';
import {
  createPrismaMock,
  resetPrismaMock,
  type MockPrisma,
} from '../test/prisma.mock';
import { UsersService } from '../users/users.service';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  avatarUrl: null,
  role: UserRole.USER,
  emailVerified: false,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const mockTokens = {
  accessToken: 'access-token-123',
  refreshToken: 'family-uuid.raw-token-uuid',
};

const mockAccount = {
  id: 'account-1',
  userId: 'user-1',
  provider: 'local',
  providerAccountId: 'jane@example.com',
  passwordHash: '', // filled per-test
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let authService: AuthService;
  let prisma: MockPrisma;

  const mockTokenService = {
    issueTokens: jest
      .fn<() => Promise<typeof mockTokens>>()
      .mockResolvedValue(mockTokens),
    rotateRefreshToken: jest.fn(),
    revokeAllUserTokens: jest
      .fn<(userId: string) => Promise<void>>()
      .mockResolvedValue(undefined),
    signAccessToken: jest
      .fn<() => string>()
      .mockReturnValue('access-token-123'),
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        { provide: PrismaService, useValue: prisma },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
    resetPrismaMock(prisma);
    // Re-apply default implementations after reset
    mockTokenService.issueTokens.mockResolvedValue(mockTokens);
    mockTokenService.revokeAllUserTokens.mockResolvedValue(undefined);
    mockTokenService.signAccessToken.mockReturnValue('access-token-123');
  });

  // ── register ───────────────────────────────────────────────────────────────

  describe('register', () => {
    it('creates a new user and returns tokens', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'jane@example.com',
        name: 'Jane Doe',
        password: 'SecurePass123!',
      });

      expect(result.user.email).toBe('jane@example.com');
      expect(result.tokens).toEqual(mockTokens);
      expect(prisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('throws ConflictException when email is already registered', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          email: 'jane@example.com',
          name: 'Jane Doe',
          password: 'SecurePass123!',
        }),
      ).rejects.toThrow(ConflictException);

      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('stores a bcrypt hash, never the plaintext password', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(mockUser);

      await authService.register({
        email: 'jane@example.com',
        name: 'Jane Doe',
        password: 'SecurePass123!',
      });

      const createCall = prisma.user.create.mock.calls[0]?.[0];
      // Navigate through the Prisma nested create structure safely
      const accountsInput = createCall?.data?.accounts as
        | {
            create?:
              { passwordHash?: string } | Array<{ passwordHash?: string }>;
          }
        | undefined;
      const createInput = accountsInput?.create;
      const passwordHash = Array.isArray(createInput)
        ? createInput[0]?.passwordHash
        : createInput?.passwordHash;

      expect(passwordHash).toBeDefined();
      expect(passwordHash).not.toBe('SecurePass123!');
      const isHash = await bcrypt.compare('SecurePass123!', passwordHash ?? '');
      expect(isHash).toBe(true);
    });
  });

  // ── login ──────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('SecurePass123!', 10);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.account.findUnique.mockResolvedValue({
        ...mockAccount,
        passwordHash,
      });

      const result = await authService.login({
        email: 'jane@example.com',
        password: 'SecurePass123!',
      });

      expect(result.user.email).toBe('jane@example.com');
      expect(result.tokens).toEqual(mockTokens);
    });

    it('throws UnauthorizedException for unknown email', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nobody@example.com',
          password: 'anything',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass123!', 10);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.account.findUnique.mockResolvedValue({
        ...mockAccount,
        passwordHash,
      });

      await expect(
        authService.login({
          email: 'jane@example.com',
          password: 'WrongPass123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('uses the same error for wrong email and wrong password (no enumeration)', async () => {
      // Wrong email
      prisma.user.findUnique.mockResolvedValue(null);
      const noEmailError = await authService
        .login({ email: 'nobody@example.com', password: 'Pass123!' })
        .catch((e: UnauthorizedException) => e);

      // Wrong password
      const passwordHash = await bcrypt.hash('Correct123!', 10);
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.account.findUnique.mockResolvedValue({
        ...mockAccount,
        passwordHash,
      });
      const wrongPassError = await authService
        .login({ email: 'jane@example.com', password: 'Wrong123!' })
        .catch((e: UnauthorizedException) => e);

      expect((noEmailError as UnauthorizedException).message).toBe(
        (wrongPassError as UnauthorizedException).message,
      );
    });
  });

  // ── logout ─────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('revokes all refresh tokens for the user', async () => {
      await authService.logout('user-1');
      expect(mockTokenService.revokeAllUserTokens).toHaveBeenCalledWith(
        'user-1',
      );
    });
  });
});
