import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationCountDto, NotificationDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiQuery({ name: 'includeRead', required: false, type: Boolean })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('includeRead') includeRead?: string,
  ): Promise<NotificationDto[]> {
    return this.notificationsService.findAllForUser(
      user.sub,
      includeRead === 'true',
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationCountDto> {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationDto> {
    return this.notificationsService.markAsRead(user.sub, id);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: JwtPayload): Promise<void> {
    return this.notificationsService.markAllAsRead(user.sub);
  }
}
