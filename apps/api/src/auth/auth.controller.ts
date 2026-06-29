import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { AuthResponse, AuthTokens, AuthUser } from '@projecthub/types';
import { Permission, RequirePermissions, Roles } from '../common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto';
import type { JwtPayload } from './token.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.auth.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.auth.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate a refresh token and issue new token pair' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all refresh tokens for the current user' })
  async logout(@CurrentUser() user: JwtPayload): Promise<void> {
    await this.auth.logout(user.sub);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  async me(@CurrentUser() user: JwtPayload): Promise<AuthUser> {
    return this.auth.getMe(user.sub);
  }

  // ── Authorization smoke tests (remove in Phase 15) ────────────────────────

  @Get('test/admin-only')
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dev] Returns 200 only for ADMIN role' })
  testAdminOnly(): { message: string } {
    return { message: 'You are an admin' };
  }
  @Get('test/user-only')
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Dev] Returns 200 only for USER role' })
  testUserOnly(): { message: string } {
    return { message: 'You are a user' };
  }

  @Get('test/permission')
  @RequirePermissions(Permission.PLATFORM_MANAGE_USERS)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Dev] Returns 200 only if user has PLATFORM_MANAGE_USERS',
  })
  testPermission(): { message: string } {
    return { message: 'You have platform:manage_users permission' };
  }
}
