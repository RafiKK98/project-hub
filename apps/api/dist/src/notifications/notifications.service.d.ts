import { NotificationType as PrismaNotificationType } from '@prisma/client';
import { NotificationCountDto, NotificationDto, NotificationPayload } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createNotification(params: {
        userId: string;
        type: PrismaNotificationType;
        title: string;
        body: string;
        payload: NotificationPayload;
    }): Promise<void>;
    findAllForUser(userId: string, includeRead?: boolean): Promise<NotificationDto[]>;
    getUnreadCount(userId: string): Promise<NotificationCountDto>;
    markAsRead(userId: string, notificationId: string): Promise<NotificationDto>;
    markAllAsRead(userId: string): Promise<void>;
    private toDto;
}
//# sourceMappingURL=notifications.service.d.ts.map