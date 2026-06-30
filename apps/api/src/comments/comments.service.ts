import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole, Prisma, ProjectMemberRole } from '@prisma/client';
import type { CommentDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

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

    return this.toCommentDto(comment, userId, true);
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

    // Only the author can edit — no manager override for edits, only deletes
    if (existing.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    const comment = await this.prisma.comment.update({
      where: { id: commentId },
      data: { body: dto.body.trim(), editedAt: new Date() },
      include: { author: { select: authorSelect } },
    });

    return this.toCommentDto(comment, userId, true);
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
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

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
