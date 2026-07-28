import { PrismaService } from '@/database/prisma.service';
import { RealtimeGateway } from '@/realtime/realtime.gateway';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityType, MemberRole, Prisma } from '@prisma/client';
import { ActivityDto, ActivityPayload } from '@projecthub/types';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];

const actorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class ActivityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  /**
   * Records one activity entry and broadcasts it live to anyone else viewing
   * the project. Called internally by IssuesService and LabelsService after
   * a diff is detected — never exposed as a direct write endpoint.
   */
  async record(
    projectId: string,
    issueId: string,
    actorId: string,
    type: ActivityType,
    payload: ActivityPayload,
  ): Promise<void> {
    const activity = await this.prisma.activity.create({
      data: { issueId, actorId, type, payload: payload as object },
      include: { actor: { select: actorSelect } },
    });

    this.realtime.emitToProject(
      projectId,
      'activity:created',
      this.toDto(activity),
      actorId,
    );
  }

  async findAllForIssue(
    orgId: string,
    projectId: string,
    issueNumber: number,
    userId: string,
  ): Promise<ActivityDto[]> {
    const issue = await this.assertIssueAccess(
      orgId,
      projectId,
      issueNumber,
      userId,
    );

    const activities = await this.prisma.activity.findMany({
      where: { issueId: issue.id },
      include: { actor: { select: actorSelect } },
      orderBy: { createdAt: 'asc' },
    });

    return activities.map((a) => this.toDto(a));
  }

  private async assertIssueAccess(
    orgId: string,
    projectId: string,
    issueNumber: number,
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

    if (!ORG_ADMIN_ROLES.includes(orgMembership.role)) {
      const projectMember = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId } },
      });
      if (!projectMember)
        throw new ForbiddenException('You are not a member of this project');
    }

    const issue = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number: issueNumber } },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    return issue;
  }

  private toDto(activity: {
    id: string;
    type: ActivityType;
    payload: unknown;
    createdAt: Date;
    actor: {
      id: string;
      name: string | null;
      email: string;
      avatarUrl: string | null;
    };
  }): ActivityDto {
    return {
      id: activity.id,
      type: activity.type as ActivityDto['type'],
      payload: activity.payload as ActivityPayload,
      createdAt: activity.createdAt.toISOString(),
      actor: activity.actor,
    };
  }
}
