import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';

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

    // Future modules are added here:
    // AuthModule, UsersModule, OrganizationsModule, etc.
  ],
  controllers: [AppController],
})
export class AppModule {}
