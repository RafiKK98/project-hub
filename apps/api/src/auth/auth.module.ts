import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TokenService } from './token.service';

@Module({
  imports: [
    UsersModule,
    // JwtModule is registered here without a secret because TokenService
    // reads secrets dynamically from ConfigService per call.
    // This allows different secrets for access vs refresh tokens.
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,

    // Register JwtAuthGuard as the global guard.
    // All routes are protected by default; use @Public() to opt out.
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [TokenService],
})
export class AuthModule {}
