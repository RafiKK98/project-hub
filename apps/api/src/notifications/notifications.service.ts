import { Injectable } from '@nestjs/common';
import { NotificationType as PrismaNotificationType } from '@prisma/client';
import {
  NotificationCountDto,
  NotificationDto,
  NotificationPayload,
} from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create (called internally by other services) ─────────────────────────

  async createNotification(params: {
    userId: string;
    type: PrismaNotificationType;
    title: string;
    body: string;
    payload: NotificationPayload;
  }): Promise<void> {
    const { userId, type, title, body, payload } = params;
    await this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body,
        payload: payload as object,
      },
    });
  }

  // ── Read ──────────────────────────────────────────────────────────────────

  async findAllForUser(
    userId: string,
    includeRead = false,
  ): Promise<NotificationDto[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, ...(!includeRead && { readAt: null }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications.map((n) => this.toDto(n));
  }

  async getUnreadCount(userId: string): Promise<NotificationCountDto> {
    const unread = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unread };
  }

  // ── Mark as read ──────────────────────────────────────────────────────────

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationDto> {
    const notification = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });

    if (notification.count === 0) {
      // Either not found or doesn't belong to user — silently ignore
    }

    const updated = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!updated) throw new Error('Notification not found');

    return this.toDto(updated);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private toDto(n: {
    id: string;
    type: PrismaNotificationType;
    title: string;
    body: string;
    payload: unknown;
    readAt: Date | null;
    createdAt: Date;
  }): NotificationDto {
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      payload: n.payload as NotificationPayload,
      readAt: n.readAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    };
  }
}
