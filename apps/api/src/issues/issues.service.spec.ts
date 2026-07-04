import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import {
  IssuePriority,
  IssueStatus,
  MemberRole,
  ProjectMemberRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { IssuesService } from '../issues/issues.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  createPrismaMock,
  resetPrismaMock,
  type MockPrisma,
} from '../test/prisma.mock';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockOrg = { id: 'org-1', slug: 'acme', name: 'Acme' };

const mockProject = {
  id: 'project-1',
  name: 'Website',
  identifier: 'WEB',
  description: null,
  status: 'ACTIVE' as const,
  organizationId: 'org-1',
  createdById: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 'user-1',
  name: 'Jane',
  email: 'jane@example.com',
  avatarUrl: null,
};

const mockIssue = {
  id: 'issue-1',
  number: 1,
  title: 'Fix the button',
  description: null,
  status: IssueStatus.BACKLOG,
  priority: IssuePriority.NO_PRIORITY,
  boardOrder: 1000,
  projectId: 'project-1',
  createdById: 'user-1',
  assigneeId: null,
  dueDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: mockUser,
  assignee: null,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IssuesService', () => {
  let service: IssuesService;
  let prisma: MockPrisma;

  const mockNotificationsService = {
    createNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
    jest.clearAllMocks();
    resetPrismaMock(prisma);
  });

  // ── Authorization ─────────────────────────────────────────────────────────

  describe('authorization', () => {
    it('throws NotFoundException when project does not exist', async () => {
      prisma.project.findFirst.mockResolvedValue(null);

      await expect(
        service.findAllForProject('org-1', 'project-404', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when user is not an org member', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllForProject('org-1', 'project-1', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when user is not a project member', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue({
        id: 'm1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.DEVELOPER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllForProject('org-1', 'project-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows org OWNER access without a ProjectMember row', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue({
        id: 'm1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.issue.findMany.mockResolvedValue([]);

      const result = await service.findAllForProject(
        'org-1',
        'project-1',
        'user-1',
      );

      expect(result).toEqual([]);
      // Should NOT check project membership for org owners
      expect(prisma.projectMember.findUnique).not.toHaveBeenCalled();
    });
  });

  // ── Sequential issue numbering ────────────────────────────────────────────

  describe('create — sequential numbering', () => {
    function setupProjectAccess() {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue({
        id: 'm1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.organization.findFirst.mockResolvedValue(mockOrg as never);
    }

    it('assigns number 1 to the first issue in a project', async () => {
      setupProjectAccess();
      // No existing issues
      prisma.$transaction.mockImplementation(
        async (fn: (tx: MockPrisma) => Promise<unknown>) => {
          const tx = createPrismaMock();
          tx.issue.findFirst.mockResolvedValue(null); // no lastIssue, no lastByOrder
          tx.issue.create.mockResolvedValue({
            ...mockIssue,
            number: 1,
            boardOrder: 1000,
          });
          return fn(tx);
        },
      );

      const result = await service.create('org-1', 'project-1', 'user-1', {
        title: 'First issue',
      });

      expect(result.number).toBe(1);
      expect(result.key).toBe('WEB-1');
    });

    it('assigns the next sequential number after existing issues', async () => {
      setupProjectAccess();
      prisma.$transaction.mockImplementation(
        async (fn: (tx: MockPrisma) => Promise<unknown>) => {
          const tx = createPrismaMock();
          // Simulate 5 existing issues
          tx.issue.findFirst
            .mockResolvedValueOnce({ number: 5 } as never) // lastIssue
            .mockResolvedValueOnce({ boardOrder: 5000 } as never); // lastByOrder
          tx.issue.create.mockResolvedValue({
            ...mockIssue,
            number: 6,
            boardOrder: 6000,
          });
          return fn(tx);
        },
      );

      const result = await service.create('org-1', 'project-1', 'user-1', {
        title: 'Sixth issue',
      });

      expect(result.number).toBe(6);
      expect(result.key).toBe('WEB-6');
    });

    it('places new issue at the end of the board (highest boardOrder)', async () => {
      setupProjectAccess();
      prisma.$transaction.mockImplementation(
        async (fn: (tx: MockPrisma) => Promise<unknown>) => {
          const tx = createPrismaMock();
          tx.issue.findFirst
            .mockResolvedValueOnce({ number: 3 } as never)
            .mockResolvedValueOnce({ boardOrder: 3000 } as never);
          tx.issue.create.mockResolvedValue({
            ...mockIssue,
            number: 4,
            boardOrder: 4000,
          });
          return fn(tx);
        },
      );

      const result = await service.create('org-1', 'project-1', 'user-1', {
        title: 'New issue',
      });

      expect(result.boardOrder).toBe(4000);
    });
  });

  // ── Notifications ─────────────────────────────────────────────────────────

  describe('notifications on update', () => {
    function setupIssueUpdate(overrides: Partial<typeof mockIssue> = {}) {
      const issue = { ...mockIssue, ...overrides };
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue({
        id: 'm1',
        userId: 'user-1',
        organizationId: 'org-1',
        role: MemberRole.OWNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      prisma.issue.findUnique.mockResolvedValue(issue as never);
      prisma.issue.update.mockResolvedValue(issue as never);
      prisma.organization.findFirst.mockResolvedValue(mockOrg as never);
    }

    it('sends ISSUE_ASSIGNED notification when assignee changes', async () => {
      setupIssueUpdate({ assigneeId: null });
      prisma.projectMember.findUnique.mockResolvedValue({
        id: 'pm1',
        projectId: 'project-1',
        userId: 'user-2',
        role: ProjectMemberRole.DEVELOPER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await service.update('org-1', 'project-1', 1, 'user-1', {
        assigneeId: 'user-2',
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ISSUE_ASSIGNED', userId: 'user-2' }),
      );
    });

    it('does NOT send notification when user assigns issue to themselves', async () => {
      setupIssueUpdate({ assigneeId: null });
      prisma.projectMember.findUnique.mockResolvedValue({
        id: 'pm1',
        projectId: 'project-1',
        userId: 'user-1',
        role: ProjectMemberRole.DEVELOPER,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // user-1 assigning to user-1 (themselves)
      await service.update('org-1', 'project-1', 1, 'user-1', {
        assigneeId: 'user-1',
      });

      expect(
        mockNotificationsService.createNotification,
      ).not.toHaveBeenCalled();
    });

    it('sends ISSUE_STATUS_CHANGED notification to assignee', async () => {
      // Issue already has an assignee (user-2), status is being changed by user-1
      setupIssueUpdate({ assigneeId: 'user-2' });

      await service.update('org-1', 'project-1', 1, 'user-1', {
        status: IssueStatus.IN_PROGRESS,
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'ISSUE_STATUS_CHANGED',
          userId: 'user-2',
        }),
      );
    });

    it('does NOT send status notification when updater is also the assignee', async () => {
      // user-1 is both the updater and the assignee
      setupIssueUpdate({ assigneeId: 'user-1' });

      await service.update('org-1', 'project-1', 1, 'user-1', {
        status: IssueStatus.DONE,
      });

      expect(
        mockNotificationsService.createNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
