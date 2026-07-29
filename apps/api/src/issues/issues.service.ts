import { ActivityService } from '@/activity/activity.service';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityType,
  MemberRole,
  NotificationType,
  Prisma,
} from '@prisma/client';
import { ActivityPayload, IssueDto, IssueFilters } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateIssueDto,
  ReorderIssueDto,
  SetParentDto,
  UpdateIssueDto,
} from './dto';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.ADMIN, MemberRole.OWNER];

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const summarySelect = {
  id: true,
  number: true,
  title: true,
  status: true,
  priority: true,
  assignee: { select: userSelect },
} satisfies Prisma.IssueSelect;

const issueInclude = {
  createdBy: { select: userSelect },
  assignee: { select: userSelect },
  labels: {
    include: { label: { select: { id: true, name: true, color: true } } },
    orderBy: { label: { name: 'asc' as const } },
  },
  parent: { select: summarySelect },
  subIssues: { select: summarySelect, orderBy: { number: 'asc' as const } },
} satisfies Prisma.IssueInclude;

@Injectable()
export class IssuesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly realtime: RealtimeGateway,
    private readonly activityService: ActivityService,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(
    orgId: string,
    projectId: string,
    userId: string,
    dto: CreateIssueDto,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    if (dto.assigneeId)
      await this.assertProjectMember(projectId, dto.assigneeId);

    if (dto.parentId) {
      const parent = await this.prisma.issue.findFirst({
        where: { id: dto.parentId, projectId },
      });
      if (!parent)
        throw new NotFoundException('Parent issue not found in this project');
      if (parent.parentId)
        throw new BadRequestException(
          'Cannot nest subtasks more than one level deep',
        );
    }

    const issue = await this.prisma.$transaction(
      async (tx) => {
        const lastIssue = await tx.issue.findFirst({
          where: { projectId },
          orderBy: { number: 'desc' },
          select: { number: true },
        });
        const nextNumber = (lastIssue?.number ?? 0) + 1;

        const lastByOrder = await tx.issue.findFirst({
          where: { projectId },
          orderBy: { boardOrder: 'desc' },
          select: { boardOrder: true },
        });
        const boardOrder = (lastByOrder?.boardOrder ?? 0) + 1000;

        return tx.issue.create({
          data: {
            number: nextNumber,
            title: dto.title.trim(),
            description: dto.description?.trim(),
            priority: dto.priority,
            boardOrder,
            projectId,
            createdById: userId,
            assigneeId: dto.assigneeId,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
            parentId: dto.parentId,
          },
          include: issueInclude,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    // Notify assignee if set and not self-assigned
    if (issue.assigneeId && issue.assigneeId !== userId) {
      const org = await this.prisma.organization.findFirst({
        where: { id: project.organizationId },
      });
      await this.notificationsService.createNotification({
        userId: issue.assigneeId,
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'Issue assigned to you',
        body: `${issue.createdBy.name ?? issue.createdBy.email} assigned ${project.identifier}-${issue.number} to you`,
        payload: {
          issueId: issue.id,
          issueKey: `${project.identifier}-${issue.number}`,
          issueTitle: issue.title,
          projectId,
          orgSlug: org?.slug ?? '',
          projectIdentifier: project.identifier,
        },
      });
    }

    await this.activityService.record(
      projectId,
      issue.id,
      userId,
      ActivityType.ISSUE_CREATED,
      {
        title: issue.title,
      },
    );

    const result = this.toIssueDto(issue, project.identifier);
    this.realtime.emitToProject(projectId, 'issue:created', result, userId);
    return result;
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAllForProject(
    orgId: string,
    projectId: string,
    userId: string,
    filters?: IssueFilters,
  ): Promise<IssueDto[]> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    const issues = await this.prisma.issue.findMany({
      where: {
        projectId,
        // Subtasks only appear nested under their parent, never as their
        // own board/list entry - this is what "parentId: null" excludes.
        parentId: null,
        ...(filters?.status?.length && { status: { in: filters.status } }),
        ...(filters?.priority?.length && {
          priority: { in: filters.priority },
        }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      },
      include: issueInclude,
      orderBy: { boardOrder: 'asc' },
    });

    return issues.map((issue) => this.toIssueDto(issue, project.identifier));
  }

  async findByNumber(
    orgId: string,
    projectId: string,
    number: number,
    userId: string,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    const issue = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
      include: issueInclude,
    });

    if (!issue) throw new NotFoundException('Issue not found');

    return this.toIssueDto(issue, project.identifier);
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(
    orgId: string,
    projectId: string,
    number: number,
    userId: string,
    dto: UpdateIssueDto,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    const existing = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
      include: {
        createdBy: { select: userSelect },
        assignee: { select: userSelect },
      },
    });
    if (!existing) throw new NotFoundException('Issue not found');

    if (dto.assigneeId)
      await this.assertProjectMember(projectId, dto.assigneeId);

    // Resolve the new assignee's display info before the write — needed for
    // both the existing notification and the new activity log entry
    let newAssignee: { name: string | null; email: string } | null = null;
    if (dto.assigneeId !== undefined && dto.assigneeId !== null)
      newAssignee = await this.prisma.user.findUnique({
        where: { id: dto.assigneeId },
        select: { name: true, email: true },
      });

    const issue = await this.prisma.issue.update({
      where: { id: existing.id },
      data: {
        ...(dto.title !== undefined && { title: dto.title.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description?.trim(),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.priority !== undefined && { priority: dto.priority }),
        ...(dto.assigneeId !== undefined && { assigneeId: dto.assigneeId }),
        ...(dto.dueDate !== undefined && {
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        }),
      },
      include: issueInclude,
    });

    const org = await this.prisma.organization.findFirst({
      where: { id: project.organizationId },
    });
    const issueKey = `${project.identifier}-${issue.number}`;

    // Notify new assignee (if changed and not self-assigned)
    if (
      dto.assigneeId &&
      dto.assigneeId !== existing.assigneeId &&
      dto.assigneeId !== userId
    )
      await this.notificationsService.createNotification({
        userId: dto.assigneeId,
        type: NotificationType.ISSUE_ASSIGNED,
        title: 'Issue assigned to you',
        body: `${existing.createdBy.name ?? existing.createdBy.email} assigned ${issueKey} to you`,
        payload: {
          issueId: issue.id,
          issueKey,
          issueTitle: issue.title,
          projectId,
          orgSlug: org?.slug ?? '',
          projectIdentifier: project.identifier,
        },
      });

    // Notify assignee of status change (if assigned, status changed, and not self-update)
    if (
      dto.status &&
      dto.status !== existing.status &&
      existing.assigneeId &&
      existing.assigneeId !== userId
    )
      await this.notificationsService.createNotification({
        userId: existing.assigneeId,
        type: NotificationType.ISSUE_STATUS_CHANGED,
        title: 'Issue status updated',
        body: `${issueKey} moved from ${existing.status} to ${dto.status}`,
        payload: {
          issueId: issue.id,
          issueKey,
          issueTitle: issue.title,
          oldStatus: existing.status,
          newStatus: dto.status,
          projectId,
          orgSlug: org?.slug ?? '',
          projectIdentifier: project.identifier,
        },
      });

    // ── Activity log — diff the pre-update row against the incoming DTO ────
    const activityEntries: Array<{
      type: ActivityType;
      payload: ActivityPayload;
    }> = [];

    if (dto.title !== undefined && dto.title.trim() !== existing.title)
      activityEntries.push({
        type: ActivityType.TITLE_CHANGED,
        payload: { oldTitle: existing.title, newTitle: dto.title.trim() },
      });
    if (
      dto.description !== undefined &&
      dto.description !== existing.description
    )
      activityEntries.push({
        type: ActivityType.DESCRIPTION_CHANGED,
        payload: {},
      });
    if (dto.status !== undefined && dto.status !== existing.status)
      activityEntries.push({
        type: ActivityType.STATUS_CHANGED,
        payload: { oldStatus: existing.status, newStatus: dto.status },
      });
    if (dto.priority !== undefined && dto.priority !== existing.priority)
      activityEntries.push({
        type: ActivityType.PRIORITY_CHANGED,
        payload: { oldPriority: existing.priority, newPriority: dto.priority },
      });
    if (dto.assigneeId !== undefined && dto.assigneeId !== existing.assigneeId)
      activityEntries.push({
        type: ActivityType.ASSIGNEE_CHANGED,
        payload: {
          oldAssigneeName: existing.assignee
            ? (existing.assignee.name ?? existing.assignee.email)
            : null,
          newAssigneeName: newAssignee
            ? (newAssignee.name ?? newAssignee.email)
            : null,
        },
      });
    if (dto.dueDate !== undefined) {
      const oldDueDateIso = existing.dueDate?.toISOString() ?? null;
      const newDueDateIso = dto.dueDate ?? null;
      if (oldDueDateIso !== newDueDateIso)
        activityEntries.push({
          type: ActivityType.DUE_DATE_CHANGED,
          payload: { oldDueDate: oldDueDateIso, newDueDate: newDueDateIso },
        });
    }

    for (const entry of activityEntries)
      await this.activityService.record(
        projectId,
        issue.id,
        userId,
        entry.type,
        entry.payload,
      );

    const result = this.toIssueDto(issue, project.identifier);
    this.realtime.emitToProject(projectId, 'issue:updated', result, userId);
    return result;
  }

  /**
   * Links or unlinks a subtask relationship. Enforces a single level of
   * nesting: the chosen parent must itself be top-level, and an issue that
   * already has its own subtasks can't become someone else's subtask
   */
  async setParent(
    orgId: string,
    projectId: string,
    number: number,
    userId: string,
    dto: SetParentDto,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    const issue = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
      include: {
        subIssues: { select: { id: true } },
        parent: { select: { number: true } },
      },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    const oldParentKey = issue.parent
      ? `${project.identifier}-${issue.parent.number}`
      : null;
    let newParentKey: string | null = null;

    if (dto.parentId) {
      if (dto.parentId === issue.id)
        throw new BadRequestException('An issue cannot be its own parent');

      const parent = await this.prisma.issue.findFirst({
        where: { id: dto.parentId, projectId },
      });
      if (!parent)
        throw new NotFoundException('Parent issue not found in this project');

      if (parent.parentId)
        throw new BadRequestException(
          'Cannot nest subtasks more than one level deep',
        );

      if (issue.subIssues.length > 0)
        throw new BadRequestException(
          'An issue with its own subtasks cannot become a subtask',
        );

      newParentKey = `${project.identifier}-${parent.number}`;
    }

    const updated = await this.prisma.issue.update({
      where: { id: issue.id },
      data: { parentId: dto.parentId },
      include: issueInclude,
    });

    if (oldParentKey !== newParentKey)
      await this.activityService.record(
        projectId,
        issue.id,
        userId,
        ActivityType.PARENT_CHANGED,
        {
          oldParentKey,
          newParentKey,
        },
      );

    const result = this.toIssueDto(updated, project.identifier);
    this.realtime.emitToProject(projectId, 'issue:updated', result, userId);
    return result;
  }

  // ── Reorder ─────────────────────────────────────────────────────────────────

  async reorder(
    orgId: string,
    projectId: string,
    number: number,
    userId: string,
    dto: ReorderIssueDto,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    const existing = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
    });
    if (!existing) throw new NotFoundException('Issue not found');

    const issue = await this.prisma.issue.update({
      where: { id: existing.id },
      data: {
        boardOrder: dto.boardOrder,
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: issueInclude,
    });

    const result = this.toIssueDto(issue, project.identifier);
    this.realtime.emitToProject(projectId, 'issue:reordered', result, userId);
    return result;
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async delete(
    orgId: string,
    projectId: string,
    number: number,
    userId: string,
  ): Promise<void> {
    await this.assertProjectAccess(orgId, projectId, userId);

    const existing = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number } },
    });
    if (!existing) throw new NotFoundException('Issue not found');

    await this.prisma.issue.delete({ where: { id: existing.id } });

    this.realtime.emitToProject(
      projectId,
      'issue:deleted',
      { id: existing.id, number: existing.number },
      userId,
    );
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async assertProjectAccess(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const orgMembership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!orgMembership) throw new NotFoundException('Organization not found');

    const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);
    if (isOrgAdmin) return project;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!projectMember)
      throw new ForbiddenException('You are not a member of this project');

    return project;
  }

  private async assertProjectMember(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!member)
      throw new NotFoundException('Assignee must be a member of this project');
  }

  private toIssueDto(
    issue: {
      id: string;
      number: number;
      title: string;
      description: string | null;
      status: string;
      priority: string;
      boardOrder: number;
      projectId: string;
      createdById: string;
      dueDate: Date | null;
      createdAt: Date;
      updatedAt: Date;
      createdBy: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
      };
      assignee: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
      } | null;
      labels: { label: { id: string; name: string; color: string } }[];
      parentId: string | null;
      parent: {
        id: string;
        number: number;
        title: string;
        status: string;
        priority: string;
        assignee: {
          id: string;
          name: string | null;
          email: string;
          avatarUrl: string | null;
        } | null;
      } | null;
      subIssues: {
        id: string;
        number: number;
        title: string;
        status: string;
        priority: string;
        assignee: {
          id: string;
          name: string | null;
          email: string;
          avatarUrl: string | null;
        } | null;
      }[];
    },
    projectIdentifier: string,
  ): IssueDto {
    const toSummary = (s: {
      id: string;
      number: number;
      title: string;
      status: string;
      priority: string;
      assignee: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
      } | null;
    }) => ({
      id: s.id,
      number: s.number,
      key: `${projectIdentifier}-${s.number}`,
      title: s.title,
      status: s.status as IssueDto['status'],
      priority: s.priority as IssueDto['priority'],
      assignee: s.assignee,
    });
    return {
      id: issue.id,
      number: issue.number,
      key: `${projectIdentifier}-${issue.number}`,
      title: issue.title,
      description: issue.description,
      status: issue.status as IssueDto['status'],
      priority: issue.priority as IssueDto['priority'],
      boardOrder: issue.boardOrder,
      projectId: issue.projectId,
      createdById: issue.createdById,
      dueDate: issue.dueDate?.toISOString() ?? null,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      labels: issue.labels.map((il) => il.label),
      parentId: issue.parentId,
      parent: issue.parent ? toSummary(issue.parent) : null,
      subtasks: issue.subIssues.map(toSummary),
      subtaskStats: {
        total: issue.subIssues.length,
        done: issue.subIssues.filter((s) => s.status === 'DONE').length,
      },
      createdBy: issue.createdBy,
      assignee: issue.assignee,
    };
  }
}
