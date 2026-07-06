"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createNotification(params) {
        const { userId, type, title, body, payload } = params;
        await this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body,
                payload: payload,
            },
        });
    }
    async findAllForUser(userId, includeRead = false) {
        const notifications = await this.prisma.notification.findMany({
            where: { userId, ...(!includeRead && { readAt: null }) },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return notifications.map((n) => this.toDto(n));
    }
    async getUnreadCount(userId) {
        const unread = await this.prisma.notification.count({
            where: { userId, readAt: null },
        });
        return { unread };
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { readAt: new Date() },
        });
        if (notification.count === 0) {
        }
        const updated = await this.prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!updated)
            throw new Error('Notification not found');
        return this.toDto(updated);
    }
    async markAllAsRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, readAt: null },
            data: { readAt: new Date() },
        });
    }
    toDto(n) {
        return {
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
            payload: n.payload,
            readAt: n.readAt?.toISOString() ?? null,
            createdAt: n.createdAt.toISOString(),
        };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map