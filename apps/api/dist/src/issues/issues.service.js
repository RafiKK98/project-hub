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
exports.IssuesService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const ORG_ADMIN_ROLES = [client_1.MemberRole.ADMIN, client_1.MemberRole.OWNER];
const userSelect = {
    id: true,
    name: true,
    email: true,
    avatarUrl: true,
};
const issueInclude = {
    createdBy: { select: userSelect },
    assignee: { select: userSelect },
    labels: {
        include: { label: { select: { id: true, name: true, color: true } } },
        orderBy: { label: { name: 'asc' } },
    },
};
let IssuesService = class IssuesService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(orgId, projectId, userId, dto) {
        const project = await this.assertProjectAccess(orgId, projectId, userId);
        if (dto.assigneeId) {
            await this.assertProjectMember(projectId, dto.assigneeId);
        }
        const issue = await this.prisma.$transaction(async (tx) => {
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
                },
                include: issueInclude,
            });
        }, { isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable });
        if (issue.assigneeId && issue.assigneeId !== userId) {
            const org = await this.prisma.organization.findFirst({
                where: { id: project.organizationId },
            });
            await this.notificationsService.createNotification({
                userId: issue.assigneeId,
                type: client_1.NotificationType.ISSUE_ASSIGNED,
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
        return this.toIssueDto(issue, project.identifier);
    }
    async findAllForProject(orgId, projectId, userId, filters) {
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
            include: issueInclude,
            orderBy: { boardOrder: 'asc' },
        });
        return issues.map((issue) => this.toIssueDto(issue, project.identifier));
    }
    async findByNumber(orgId, projectId, number, userId) {
        const project = await this.assertProjectAccess(orgId, projectId, userId);
        const issue = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number } },
            include: issueInclude,
        });
        if (!issue)
            throw new common_1.NotFoundException('Issue not found');
        return this.toIssueDto(issue, project.identifier);
    }
    async update(orgId, projectId, number, userId, dto) {
        const project = await this.assertProjectAccess(orgId, projectId, userId);
        const existing = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number } },
            include: {
                createdBy: { select: userSelect },
                assignee: { select: userSelect },
            },
        });
        if (!existing)
            throw new common_1.NotFoundException('Issue not found');
        if (dto.assigneeId)
            await this.assertProjectMember(projectId, dto.assigneeId);
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
        if (dto.assigneeId &&
            dto.assigneeId !== existing.assigneeId &&
            dto.assigneeId !== userId) {
            await this.notificationsService.createNotification({
                userId: dto.assigneeId,
                type: client_1.NotificationType.ISSUE_ASSIGNED,
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
        }
        if (dto.status &&
            dto.status !== existing.status &&
            existing.assigneeId &&
            existing.assigneeId !== userId) {
            await this.notificationsService.createNotification({
                userId: existing.assigneeId,
                type: client_1.NotificationType.ISSUE_STATUS_CHANGED,
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
        }
        return this.toIssueDto(issue, project.identifier);
    }
    async reorder(orgId, projectId, number, userId, dto) {
        const project = await this.assertProjectAccess(orgId, projectId, userId);
        const existing = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Issue not found');
        const issue = await this.prisma.issue.update({
            where: { id: existing.id },
            data: {
                boardOrder: dto.boardOrder,
                ...(dto.status !== undefined && { status: dto.status }),
            },
            include: issueInclude,
        });
        return this.toIssueDto(issue, project.identifier);
    }
    async delete(orgId, projectId, number, userId) {
        await this.assertProjectAccess(orgId, projectId, userId);
        const existing = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number } },
        });
        if (!existing)
            throw new common_1.NotFoundException('Issue not found');
        await this.prisma.issue.delete({ where: { id: existing.id } });
    }
    async assertProjectAccess(orgId, projectId, userId) {
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
        if (isOrgAdmin)
            return project;
        const projectMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!projectMember)
            throw new common_1.ForbiddenException('You are not a member of this project');
        return project;
    }
    async assertProjectMember(projectId, userId) {
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!member)
            throw new common_1.NotFoundException('Assignee must be a member of this project');
    }
    toIssueDto(issue, projectIdentifier) {
        return {
            id: issue.id,
            number: issue.number,
            key: `${projectIdentifier}-${issue.number}`,
            title: issue.title,
            description: issue.description,
            status: issue.status,
            priority: issue.priority,
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
};
exports.IssuesService = IssuesService;
exports.IssuesService = IssuesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], IssuesService);
//# sourceMappingURL=issues.service.js.map