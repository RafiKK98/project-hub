import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { CommonModule } from './common/common.module';
import appConfig from './config/app.config';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { IssuesModule } from './issues/issues.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { LabelsModule } from './labels/labels.module';
import { RealtimeModule } from './realtime/realtime.module';

@Module({
  imports: [
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
    NotificationsModule,
    DashboardModule,
    LabelsModule,
    RealtimeModule,
  ],
})
export class AppModule {}
