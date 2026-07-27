import { RealtimeGateway } from '@/realtime/realtime.gateway';
import { beforeEach, describe, it, jest } from '@jest/globals';
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

// assigneeId typed as string | null to match Prisma's Issue model exactly
function makeMockIssue(assigneeId: string | null = null) {
  return {
    id: 'issue-1',
    number: 1,
    title: 'Fix the button',
    description: null,
    status: IssueStatus.BACKLOG,
    priority: IssuePriority.NO_PRIORITY,
    boardOrder: 1000,
    projectId: 'project-1',
    createdById: 'user-1',
    assigneeId,
    dueDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: mockUser,
    assignee: null,
    labels: [],
  };
}

const mockOrgMembership = (role: MemberRole = MemberRole.OWNER) => ({
  id: 'm1',
  userId: 'user-1',
  organizationId: 'org-1',
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockProjectMember = (
  userId: string,
  role: ProjectMemberRole = ProjectMemberRole.DEVELOPER,
) => ({
  id: 'pm1',
  projectId: 'project-1',
  userId,
  role,
  createdAt: new Date(),
  updatedAt: new Date(),
});

const realtime = {
  emitToProject: jest.fn(),
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IssuesService', () => {
  let service: IssuesService;
  let prisma: MockPrisma;

  const mockNotificationsService = {
    createNotification: jest
      .fn<() => Promise<void>>()
      .mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    prisma = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IssuesService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: RealtimeGateway, useValue: realtime },
      ],
    }).compile();

    service = module.get<IssuesService>(IssuesService);
    jest.clearAllMocks();
    resetPrismaMock(prisma);
    mockNotificationsService.createNotification.mockResolvedValue(undefined);
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
      prisma.membership.findUnique.mockResolvedValue(
        mockOrgMembership(MemberRole.DEVELOPER),
      );
      prisma.projectMember.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllForProject('org-1', 'project-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('allows org OWNER access without a ProjectMember row', async () => {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue(
        mockOrgMembership(MemberRole.OWNER),
      );
      prisma.issue.findMany.mockResolvedValue([]);

      const result = await service.findAllForProject(
        'org-1',
        'project-1',
        'user-1',
      );

      expect(result).toEqual([]);
      expect(prisma.projectMember.findUnique).not.toHaveBeenCalled();
    });
  });

  // ── Sequential issue numbering ────────────────────────────────────────────

  describe('create — sequential numbering', () => {
    function setupProjectAccess() {
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue(
        mockOrgMembership(MemberRole.OWNER),
      );
      prisma.organization.findFirst.mockResolvedValue(mockOrg as never);
    }

    it('assigns number 1 to the first issue in a project', async () => {
      setupProjectAccess();
      prisma.$transaction.mockImplementation(
        async (fn: (tx: MockPrisma) => Promise<unknown>) => {
          const tx = createPrismaMock();
          tx.issue.findFirst.mockResolvedValue(null);
          tx.issue.create.mockResolvedValue(makeMockIssue() as never);
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
          tx.issue.findFirst
            .mockResolvedValueOnce({ number: 5 } as never)
            .mockResolvedValueOnce({ boardOrder: 5000 } as never);
          tx.issue.create.mockResolvedValue({
            ...makeMockIssue(),
            number: 6,
            boardOrder: 6000,
          } as never);
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
            ...makeMockIssue(),
            number: 4,
            boardOrder: 4000,
          } as never);
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
    function setupIssueUpdate(assigneeId: string | null = null) {
      const issue = makeMockIssue(assigneeId);
      prisma.project.findFirst.mockResolvedValue(mockProject);
      prisma.membership.findUnique.mockResolvedValue(
        mockOrgMembership(MemberRole.OWNER),
      );
      prisma.issue.findUnique.mockResolvedValue(issue as never);
      prisma.issue.update.mockResolvedValue(issue as never);
      prisma.organization.findFirst.mockResolvedValue(mockOrg as never);
    }

    it('sends ISSUE_ASSIGNED notification when assignee changes', async () => {
      setupIssueUpdate(null); // currently unassigned
      prisma.projectMember.findUnique.mockResolvedValue(
        mockProjectMember('user-2') as never,
      );

      await service.update('org-1', 'project-1', 1, 'user-1', {
        assigneeId: 'user-2',
      });

      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'ISSUE_ASSIGNED', userId: 'user-2' }),
      );
    });

    it('does NOT send notification when user assigns issue to themselves', async () => {
      setupIssueUpdate(null);
      prisma.projectMember.findUnique.mockResolvedValue(
        mockProjectMember('user-1') as never,
      );

      await service.update('org-1', 'project-1', 1, 'user-1', {
        assigneeId: 'user-1',
      });

      expect(
        mockNotificationsService.createNotification,
      ).not.toHaveBeenCalled();
    });

    it('sends ISSUE_STATUS_CHANGED notification to assignee', async () => {
      setupIssueUpdate('user-2'); // issue assigned to user-2

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
      setupIssueUpdate('user-1'); // user-1 is both updater and assignee

      await service.update('org-1', 'project-1', 1, 'user-1', {
        status: IssueStatus.DONE,
      });

      expect(
        mockNotificationsService.createNotification,
      ).not.toHaveBeenCalled();
    });
  });
});
