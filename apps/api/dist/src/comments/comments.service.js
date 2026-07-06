"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const ORG_ADMIN_ROLES = [client_1.MemberRole.OWNER, client_1.MemberRole.ADMIN];
const authorSelect = {
    id: true,
    name: true,
    email: true,
    avatarUrl: true,
};
let CommentsService = class CommentsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(orgId, projectId, issueNumber, userId, dto) {
        const issue = await this.assertIssueAccess(orgId, projectId, issueNumber, userId);
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
                type: client_1.NotificationType.COMMENT_ADDED,
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
        const canDeleteAny = await this.canDeleteAnyComment(orgId, projectId, userId);
        return this.toCommentDto(comment, userId, canDeleteAny);
    }
    async findAllForIssue(orgId, projectId, issueNumber, userId) {
        const issue = await this.assertIssueAccess(orgId, projectId, issueNumber, userId);
        const canDeleteAny = await this.canDeleteAnyComment(orgId, projectId, userId);
        const comments = await this.prisma.comment.findMany({
            where: { issueId: issue.id },
            include: { author: { select: authorSelect } },
            orderBy: { createdAt: 'asc' },
        });
        return comments.map((c) => this.toCommentDto(c, userId, canDeleteAny));
    }
    async update(orgId, projectId, issueNumber, commentId, userId, dto) {
        await this.assertIssueAccess(orgId, projectId, issueNumber, userId);
        const existing = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Comment not found');
        if (existing.authorId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own comments');
        }
        const comment = await this.prisma.comment.update({
            where: { id: commentId },
            data: { body: dto.body.trim(), editedAt: new Date() },
            include: { author: { select: authorSelect } },
        });
        return this.toCommentDto(comment, userId, true);
    }
    async delete(orgId, projectId, issueNumber, commentId, userId) {
        await this.assertIssueAccess(orgId, projectId, issueNumber, userId);
        const existing = await this.prisma.comment.findUnique({
            where: { id: commentId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Comment not found');
        const isAuthor = existing.authorId === userId;
        if (!isAuthor) {
            const canDeleteAny = await this.canDeleteAnyComment(orgId, projectId, userId);
            if (!canDeleteAny) {
                throw new common_1.ForbiddenException('You can only delete your own comments');
            }
        }
        await this.prisma.comment.delete({ where: { id: commentId } });
    }
    async assertIssueAccess(orgId, projectId, issueNumber, userId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: orgId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const orgMembership = await this.prisma.membership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        if (!orgMembership)
            throw new common_1.NotFoundException('Organization not found');
        const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);
        if (!isOrgAdmin) {
            const projectMember = await this.prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId, userId } },
            });
            if (!projectMember)
                throw new common_1.ForbiddenException('You are not a member of this project');
        }
        const issue = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number: issueNumber } },
        });
        if (!issue)
            throw new common_1.NotFoundException('Issue not found');
        return issue;
    }
    async canDeleteAnyComment(orgId, projectId, userId) {
        const orgMembership = await this.prisma.membership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        if (orgMembership && ORG_ADMIN_ROLES.includes(orgMembership.role))
            return true;
        const projectMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        return projectMember?.role === client_1.ProjectMemberRole.MANAGER;
    }
    toCommentDto(comment, currentUserId, canDeleteAny) {
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
};
exports.CommentsService = CommentsService;
exports.CommentsService = CommentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], CommentsService);
//# sourceMappingURL=comments.service.js.map