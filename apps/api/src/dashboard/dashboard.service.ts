import { Injectable } from '@nestjs/common';
import { MemberRole, Prisma } from '@prisma/client';
import { DashboardDto, ProjectStatusBreakdown } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];

const userSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

const issueInclude = {
  createdBy: { select: userSelect },
  assignee: { select: userSelect },
  labels: {
    include: { label: { select: { id: true, name: true, color: true } } },
    orderBy: { label: { name: 'asc' as const } },
  },
} satisfies Prisma.IssueInclude;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string): Promise<DashboardDto> {
    // Collect all project IDs the user has access to (via org admin or direct membership)
    const accessibleProjectIds = await this.getAccessibleProjectIds(userId);

    const [assignedToMe, recentlyUpdated, projectBreakdowns] =
      await Promise.all([
        this.getAssignedToMe(userId, accessibleProjectIds),
        this.getRecentlyUpdated(userId, accessibleProjectIds),
        this.getProjectBreakdowns(userId, accessibleProjectIds),
      ]);

    return { assignedToMe, recentlyUpdated, projectBreakdowns };
  }

  // ── Private ───────────────────────────────────────────────────────────────

  private async getAccessibleProjectIds(userId: string): Promise<string[]> {
    // Get orgs where user is owner/admin (implicit full project access)
    const adminMemberships = await this.prisma.membership.findMany({
      where: { userId, role: { in: ORG_ADMIN_ROLES } },
      select: { organizationId: true },
    });
    const adminOrgIds = adminMemberships.map((m) => m.organizationId);

    // Projects in those orgs — all accessible
    const adminProjects = await this.prisma.project.findMany({
      where: { organizationId: { in: adminOrgIds } },
      select: { id: true },
    });

    // Projects where user has explicit membership
    const directMemberships = await this.prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });

    const allIds = new Set([
      ...adminProjects.map((p) => p.id),
      ...directMemberships.map((m) => m.projectId),
    ]);

    return Array.from(allIds);
  }

  private async getAssignedToMe(userId: string, projectIds: string[]) {
    if (projectIds.length === 0) return [];

    const issues = await this.prisma.issue.findMany({
      where: {
        projectId: { in: projectIds },
        assigneeId: userId,
        status: { notIn: ['DONE', 'CANCELLED'] },
      },
      include: {
        ...issueInclude,
        project: { select: { identifier: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return issues.map((i) => this.toIssueDto(i, i.project.identifier));
  }

  private async getRecentlyUpdated(_userId: string, projectIds: string[]) {
    if (projectIds.length === 0) return [];

    const issues = await this.prisma.issue.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        ...issueInclude,
        project: { select: { identifier: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
    });

    return issues.map((i) => this.toIssueDto(i, i.project.identifier));
  }

  private async getProjectBreakdowns(
    _userId: string,
    projectIds: string[],
  ): Promise<ProjectStatusBreakdown[]> {
    if (projectIds.length === 0) return [];

    const projects = await this.prisma.project.findMany({
      where: { id: { in: projectIds }, status: 'ACTIVE' },
      include: {
        organization: { select: { slug: true } },
        issues: { select: { status: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    return projects.map((project) => {
      const counts = {
        BACKLOG: 0,
        TODO: 0,
        IN_PROGRESS: 0,
        IN_REVIEW: 0,
        DONE: 0,
        CANCELLED: 0,
      };
      for (const issue of project.issues)
        counts[issue.status as keyof typeof counts]++;

      return {
        projectId: project.id,
        projectName: project.name,
        projectIdentifier: project.identifier,
        orgSlug: project.organization.slug,
        status: project.status as ProjectStatusBreakdown['status'],
        counts,
        total: project.issues.length,
      };
    });
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
    },
    projectIdentifier: string,
  ) {
    return {
      id: issue.id,
      number: issue.number,
      key: `${projectIdentifier}-${issue.number}`,
      title: issue.title,
      description: issue.description,
      status: issue.status as 'BACKLOG',
      priority: issue.priority as 'NO_PRIORITY',
      boardOrder: issue.boardOrder,
      projectId: issue.projectId,
      createdById: issue.createdById,
      dueDate: issue.dueDate?.toISOString() ?? null,
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      labels: issue.labels.map((il) => il.label),
      createdBy: issue.createdBy,
      assignee: issue.assignee,
    };
  }
}
