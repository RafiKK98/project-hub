import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { UsersService } from './users/users.service';
import { IssuesModule } from './issues/issues.module';
import { CommentsModule } from './comments/comments.module';

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
    CommonModule,

    // ── Feature modules ──────────────────────────────────────────────────────
    HealthModule,
    UsersModule,
    AuthModule,
    OrganizationsModule,
    ProjectsModule,
    IssuesModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [UsersService],
})
export class AppModule {}
