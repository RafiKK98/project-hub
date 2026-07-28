import { ActivityModule } from '@/activity/activity.module';
import { RealtimeModule } from '@/realtime/realtime.module';
import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { IssuesController } from './issues.controller';
import { IssuesService } from './issues.service';

@Module({
  imports: [NotificationsModule, RealtimeModule, ActivityModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
