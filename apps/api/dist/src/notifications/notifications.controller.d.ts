import { NotificationCountDto, NotificationDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: JwtPayload, includeRead?: string): Promise<NotificationDto[]>;
    getUnreadCount(user: JwtPayload): Promise<NotificationCountDto>;
    markAsRead(id: string, user: JwtPayload): Promise<NotificationDto>;
    markAllAsRead(user: JwtPayload): Promise<void>;
}
//# sourceMappingURL=notifications.controller.d.ts.map