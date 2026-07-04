import { Test, type TestingModule } from '@nestjs/testing';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  createPrismaMock,
  resetPrismaMock,
  type MockPrisma,
} from '../test/prisma.mock';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: NotificationType.ISSUE_ASSIGNED,
  title: 'Issue assigned to you',
  body: 'Jane assigned WEB-1 to you',
  payload: {
    issueKey: 'WEB-1',
    orgSlug: 'acme',
    projectIdentifier: 'WEB',
    issueId: 'i1',
    issueTitle: 'Fix it',
    projectId: 'p1',
  },
  readAt: null,
  createdAt: new Date('2026-01-01T10:00:00Z'),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: MockPrisma;

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
    resetPrismaMock(prisma);
  });

  // ── createNotification ────────────────────────────────────────────────────

  describe('createNotification', () => {
    it('creates a notification with correct fields', async () => {
      prisma.notification.create.mockResolvedValue(mockNotification as never);

      await service.createNotification({
        userId: 'user-1',
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'Issue assigned to you',
        body: 'Jane assigned WEB-1 to you',
        payload: { issueKey: 'WEB-1' } as never,
      });

      expect(prisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: NotificationType.ISSUE_ASSIGNED,
            title: 'Issue assigned to you',
          }),
        }),
      );
    });
  });

  // ── findAllForUser ────────────────────────────────────────────────────────

  describe('findAllForUser', () => {
    it('returns only unread notifications by default', async () => {
      prisma.notification.findMany.mockResolvedValue([
        mockNotification,
      ] as never);

      const result = await service.findAllForUser('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ readAt: null }),
        }),
      );
      expect(result).toHaveLength(1);
      expect(result[0]?.readAt).toBeNull();
    });

    it('includes read notifications when includeRead is true', async () => {
      const readNotification = { ...mockNotification, readAt: new Date() };
      prisma.notification.findMany.mockResolvedValue([
        readNotification,
      ] as never);

      await service.findAllForUser('user-1', true);

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({ readAt: null }),
        }),
      );
    });

    it('limits results to 50', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findAllForUser('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 50 }),
      );
    });

    it('orders by createdAt descending', async () => {
      prisma.notification.findMany.mockResolvedValue([]);

      await service.findAllForUser('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  // ── getUnreadCount ────────────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('returns the count of unread notifications', async () => {
      prisma.notification.count.mockResolvedValue(3);

      const result = await service.getUnreadCount('user-1');

      expect(result.unread).toBe(3);
      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
      });
    });
  });

  // ── markAllAsRead ─────────────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('sets readAt on all unread notifications for the user', async () => {
      prisma.notification.updateMany.mockResolvedValue({ count: 3 });

      await service.markAllAsRead('user-1');

      expect(prisma.notification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', readAt: null },
        data: { readAt: expect.any(Date) },
      });
    });
  });
});
