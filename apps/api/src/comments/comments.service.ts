import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  MemberRole,
  NotificationType,
  Prisma,
  ProjectMemberRole,
} from '@prisma/client';
import type { CommentDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateCommentDto, UpdateCommentDto } from './dto';

const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];

const authorSelect = {
  id: true,
  name: true,
  email: true,
  avatarUrl: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class CommentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async create(
    orgId: string,
    projectId: string,
    issueNumber: number,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentDto> {
    const issue = await this.assertIssueAccess(
      orgId,
      projectId,
      issueNumber,
      userId,
    );

    const comment = await this.prisma.comment.create({
      data: {
        body: dto.body.trim(),
        issueId: issue.id,
        authorId: userId,
      },
      include: { author: { select: authorSelect } },
    });

    if (issue.assigneeId && issue.assigneeId !== userId) {
      const project = await this.prisma.project.findUnique({
        where: { id: projectId },
      });
      const org = await this.prisma.organization.findUnique({
        where: { id: orgId },
      });
      const issueKey = `${project?.identifier}-${issue.number}`;

      await this.notificationsService.createNotification({
        userId: issue.assigneeId,
        type: NotificationType.COMMENT_ADDED,
        title: 'New comment on your issue',
        body: `${comment.author.name ?? comment.author.email} commented on ${issueKey}: "${dto.body.slice(0, 80)}${dto.body.length > 80 ? '…' : ''}"`,
        payload: {
          issueId: issue.id,
          issueKey,
          issueTitle: issue.title,
          commentId: comment.id,
          commentSnippet: dto.body.slice(0, 120),
          projectId,
          orgSlug: org?.slug ?? '',
          projectIdentifier: project?.identifier ?? '',
          issueNumber: issue.number,
        },
      });
    }

    const canDeleteAny = await this.canDeleteAnyComment(
      orgId,
      projectId,
      userId,
    );
    const result = this.toCommentDto(comment, userId, canDeleteAny);

    // Broadcast without the per-viewer canEdit/canDelete flags baked in —
    // those are relative to who's looking, not universal. Frontend just
    // uses this to know a refetch is needed for this issue's comment thread.
    this.realtime.emitToProject(
      projectId,
      'comment:created',
      { ...result, issueNumber: issue.number },
      userId,
    );

    return result;
  }

  async findAllForIssue(
    orgId: string,
    projectId: string,
    issueNumber: number,
    userId: string,
  ): Promise<CommentDto[]> {
    const issue = await this.assertIssueAccess(
      orgId,
      projectId,
      issueNumber,
      userId,
    );
    const canDeleteAny = await this.canDeleteAnyComment(
      orgId,
      projectId,
      userId,
    );

    const comments = await this.prisma.comment.findMany({
      where: { issueId: issue.id },
      include: { author: { select: authorSelect } },
      orderBy: { createdAt: 'asc' },
    });

    return comments.map((c) => this.toCommentDto(c, userId, canDeleteAny));
  }

  async update(
    orgId: string,
    projectId: string,
    issueNumber: number,
    commentId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentDto> {
    await this.assertIssueAccess(orgId, projectId, issueNumber, userId);

    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing) throw new NotFoundException('Comment not found');

    if (existing.authorId !== userId)
      throw new ForbiddenException('You can only edit your own comments');

    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { body: dto.body.trim(), editedAt: new Date() },
      include: { author: { select: authorSelect } },
    });

    const result = this.toCommentDto(comment, userId, true);
    this.realtime.emitToProject(
      projectId,
      'comment:updated',
      { ...result, issueNumber },
      userId,
    );
    return result;
  }

  async delete(
    orgId: string,
    projectId: string,
    issueNumber: number,
    commentId: string,
    userId: string,
  ): Promise<void> {
    await this.assertIssueAccess(orgId, projectId, issueNumber, userId);

    const existing = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!existing) throw new NotFoundException('Comment not found');

    const isAuthor = existing.authorId === userId;
    if (!isAuthor) {
      const canDeleteAny = await this.canDeleteAnyComment(
        orgId,
        projectId,
        userId,
      );
      if (!canDeleteAny) {
        throw new ForbiddenException('You can only delete your own comments');
      }
    }

    await this.prisma.comment.delete({ where: { id: commentId } });

    this.realtime.emitToProject(
      projectId,
      'comment:deleted',
      { id: commentId, issueId: existing.issueId, issueNumber },
      userId,
    );
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

    const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);
    if (!isOrgAdmin) {
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

  private async canDeleteAnyComment(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<boolean> {
    const orgMembership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (orgMembership && ORG_ADMIN_ROLES.includes(orgMembership.role))
      return true;

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    return projectMember?.role === ProjectMemberRole.MANAGER;
  }

  private toCommentDto(
    comment: {
      id: string;
      body: string;
      issueId: string;
      authorId: string;
      editedAt: Date | null;
      createdAt: Date;
      author: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
      };
    },
    currentUserId: string,
    canDeleteAny: boolean,
  ): CommentDto {
    const isAuthor = comment.authorId === currentUserId;
    return {
      id: comment.id,
      body: comment.body,
      issueId: comment.issueId,
      authorId: comment.authorId,
      editedAt: comment.editedAt?.toISOString() ?? null,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
      canEdit: isAuthor,
      canDelete: isAuthor || canDeleteAny,
    };
  }
}
