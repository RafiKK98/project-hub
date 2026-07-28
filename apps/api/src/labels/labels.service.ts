import { ActivityService } from '@/activity/activity.service';
import { PrismaService } from '@/database/prisma.service';
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityType, MemberRole, ProjectMemberRole } from '@prisma/client';
import { LabelDto } from '@projecthub/types';
import { CreateLabelDto, SetIssueLabelsDto, UpdateLabelDto } from './dto';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];
const PROJECT_MANAGER_ROLES: ProjectMemberRole[] = [ProjectMemberRole.MANAGER];

@Injectable()
export class LabelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  // ── Project labels CRUD ───────────────────────────────────────────────────

  async findAllForProject(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<LabelDto[]> {
    await this.assertProjectAccess(orgId, projectId, userId);

    const labels = await this.prisma.label.findMany({
      where: { projectId },
      orderBy: { name: 'asc' },
    });

    return labels.map(this.toDto);
  }

  async create(
    orgId: string,
    projectId: string,
    userId: string,
    dto: CreateLabelDto,
  ): Promise<LabelDto> {
    await this.assertProjectManager(orgId, projectId, userId);

    const existing = await this.prisma.label.findUnique({
      where: { projectId_name: { projectId, name: dto.name.trim() } },
    });
    if (existing)
      throw new ConflictException(
        `A label named "${dto.name}" already exists in this project`,
      );

    const label = await this.prisma.label.create({
      data: { name: dto.name.trim(), color: dto.color, projectId },
    });

    return this.toDto(label);
  }

  async update(
    orgId: string,
    projectId: string,
    labelId: string,
    userId: string,
    dto: UpdateLabelDto,
  ): Promise<LabelDto> {
    await this.assertProjectManager(orgId, projectId, userId);

    const existing = await this.prisma.label.findFirst({
      where: { id: labelId, projectId },
    });
    if (!existing) throw new NotFoundException('Label not found');

    const label = await this.prisma.label.update({
      where: { id: labelId },
      data: {
        ...(dto.name && { name: dto.name.trim() }),
        ...(dto.color && { color: dto.color }),
      },
    });

    return this.toDto(label);
  }

  async delete(
    orgId: string,
    projectId: string,
    labelId: string,
    userId: string,
  ): Promise<void> {
    await this.assertProjectManager(orgId, projectId, userId);

    const existing = await this.prisma.label.findFirst({
      where: { id: labelId, projectId },
    });
    if (!existing) throw new NotFoundException('Label not found');

    await this.prisma.label.delete({ where: { id: labelId } });
  }

  // ── Issue label assignment ────────────────────────────────────────────────

  async setIssueLabels(
    orgId: string,
    projectId: string,
    issueNumber: number,
    userId: string,
    dto: SetIssueLabelsDto,
  ): Promise<LabelDto[]> {
    await this.assertProjectAccess(orgId, projectId, userId);

    const issue = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number: issueNumber } },
      include: { labels: { include: { label: true } } },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    // Verify all labelIds belong to this project
    if (dto.labelIds.length > 0) {
      const labels = await this.prisma.label.findMany({
        where: { id: { in: dto.labelIds }, projectId },
      });
      if (labels.length !== dto.labelIds.length)
        throw new NotFoundException(
          'One or more labels not found in this project',
        );
    }

    // Diff against the current set before we overwrite it, for the activity log
    const previousLabels = issue.labels.map((il) => il.label);
    const previousIds = new Set(previousLabels.map((l) => l.id));
    const nextIds = new Set(dto.labelIds);
    const addedIds = dto.labelIds.filter((id) => !previousIds.has(id));
    const removedLabels = previousLabels.filter((l) => !nextIds.has(l.id));

    // Replace all labels atomically
    await this.prisma.$transaction([
      this.prisma.issueLabel.deleteMany({ where: { issueId: issue.id } }),
      ...(dto.labelIds.length > 0
        ? [
            this.prisma.issueLabel.createMany({
              data: dto.labelIds.map((labelId) => ({
                issueId: issue.id,
                labelId,
              })),
            }),
          ]
        : []),
    ]);

    const labels = await this.prisma.label.findMany({
      where: { id: { in: dto.labelIds } },
      orderBy: { name: 'asc' },
    });

    if (addedIds.length > 0 || removedLabels.length > 0) {
      const addedLabels = labels.filter((l) => addedIds.includes(l.id));
      await this.activityService.record(
        projectId,
        issue.id,
        userId,
        ActivityType.LABELS_CHANGED,
        {
          added: addedLabels.map((l) => ({ name: l.name, color: l.color })),
          removed: removedLabels.map((l) => ({ name: l.name, color: l.color })),
        },
      );
    }

    return labels.map(this.toDto);
  }

  async getIssueLabels(
    orgId: string,
    projectId: string,
    issueNumber: number,
    userId: string,
  ): Promise<LabelDto[]> {
    await this.assertProjectAccess(orgId, projectId, userId);

    const issue = await this.prisma.issue.findUnique({
      where: { projectId_number: { projectId, number: issueNumber } },
      include: {
        labels: {
          include: { label: true },
          orderBy: { label: { name: 'asc' } },
        },
      },
    });
    if (!issue) throw new NotFoundException('Issue not found');

    return issue.labels.map((il) => this.toDto(il.label));
  }

  // ── Private helpers ───────────────────────────────────────────────────────

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

    if (ORG_ADMIN_ROLES.includes(orgMembership.role)) return;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!projectMember)
      throw new ForbiddenException('You are not a member of this project');
  }

  private async assertProjectManager(
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

    if (ORG_ADMIN_ROLES.includes(orgMembership.role)) return;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!projectMember || !PROJECT_MANAGER_ROLES.includes(projectMember.role))
      throw new ForbiddenException('Only project managers can manage labels');
  }

  private toDto(label: {
    id: string;
    name: string;
    color: string;
    projectId: string;
    createdAt: Date;
  }): LabelDto {
    return {
      id: label.id,
      name: label.name,
      color: label.color,
      projectId: label.projectId,
      createdAt: label.createdAt.toISOString(),
    };
  }
}
