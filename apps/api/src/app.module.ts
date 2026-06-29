import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // ── Configuration ────────────────────────────────────────────────────────
    // isGlobal: true means ConfigService is injectable everywhere without
    // re-importing ConfigModule into every feature module.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      envFilePath: ['.env'],
      cache: true,
    }),

    // ── Core infrastructure ──────────────────────────────────────────────────
    DatabaseModule,

    // ── Feature modules ──────────────────────────────────────────────────────
    HealthModule,

    UsersModule,

    AuthModule,

    // Future modules are added here:
    // AuthModule, UsersModule, OrganizationsModule, etc.
  ],
  controllers: [AppController],
  providers: [UsersService],
})
export class AppModule {}
