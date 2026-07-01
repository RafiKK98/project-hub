import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IssuePriority, MemberRole, Prisma } from '@prisma/client';
import { IssueDto, IssueFilters } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { CreateIssueDto, ReorderIssueDto, UpdateIssueDto } from './dto';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.ADMIN, MemberRole.OWNER];

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class IssuesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(
    orgId: string,
    projectId: string,
    userId: string,
    dto: CreateIssueDto,
  ): Promise<IssueDto> {
    const project = await this.assertProjectAccess(orgId, projectId, userId);

    if (dto.assigneeId) {
      await this.assertProjectMember(projectId, dto.assigneeId);
    }

    const issue = await this.prisma.$transaction(
      async (tx) => {
        const lastIssue = await tx.issue.findFirst({
          where: { projectId },
          orderBy: { number: 'desc' },
          select: { number: true },
        });
        const nextNumber = (lastIssue?.number ?? 0) + 1;

        // boardOrder: place at the bottom of the backlog by using a large timestamp-based value
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
            priority: dto.priority || IssuePriority.NO_PRIORITY,
            boardOrder,
            projectId,
            createdById: userId,
            assigneeId: dto.assigneeId,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
          },
          include: {
            createdBy: { select: userSelect },
            assignee: { select: userSelect },
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return this.toIssueDto(issue, project.identifier);
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
        ...(filters?.status?.length && { status: { in: filters.status } }),
        ...(filters?.priority?.length && {
          priority: { in: filters.priority },
        }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
      },
      include: {
        createdBy: { select: userSelect },
        assignee: { select: userSelect },
      },
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
      include: {
        createdBy: { select: userSelect },
        assignee: { select: userSelect },
      },
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
    });
    if (!existing) throw new NotFoundException('Issue not found');

    if (dto.assigneeId) {
      await this.assertProjectMember(projectId, dto.assigneeId);
    }

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
      include: {
        createdBy: { select: userSelect },
        assignee: { select: userSelect },
      },
    });

    return this.toIssueDto(issue, project.identifier);
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
      include: {
        createdBy: { select: userSelect },
        assignee: { select: userSelect },
      },
    });

    return this.toIssueDto(issue, project.identifier);
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
    if (!member) {
      throw new NotFoundException('Assignee must be a member of this project');
    }
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
    },
    projectIdentifier: string,
  ): IssueDto {
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
      createdBy: issue.createdBy,
      assignee: issue.assignee,
    };
  }
}
