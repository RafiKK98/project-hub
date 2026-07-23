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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const ORG_ADMIN_ROLES = [client_1.MemberRole.OWNER, client_1.MemberRole.ADMIN];
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
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(userId) {
        const accessibleProjectIds = await this.getAccessibleProjectIds(userId);
        const [assignedToMe, recentlyUpdated, projectBreakdowns] = await Promise.all([
            this.getAssignedToMe(userId, accessibleProjectIds),
            this.getRecentlyUpdated(userId, accessibleProjectIds),
            this.getProjectBreakdowns(userId, accessibleProjectIds),
        ]);
        return { assignedToMe, recentlyUpdated, projectBreakdowns };
    }
    async getAccessibleProjectIds(userId) {
        const adminMemberships = await this.prisma.membership.findMany({
            where: { userId, role: { in: ORG_ADMIN_ROLES } },
            select: { organizationId: true },
        });
        const adminOrgIds = adminMemberships.map((m) => m.organizationId);
        const adminProjects = await this.prisma.project.findMany({
            where: { organizationId: { in: adminOrgIds } },
            select: { id: true },
        });
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
    async getAssignedToMe(userId, projectIds) {
        if (projectIds.length === 0)
            return [];
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
    async getRecentlyUpdated(_userId, projectIds) {
        if (projectIds.length === 0)
            return [];
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
    async getProjectBreakdowns(_userId, projectIds) {
        if (projectIds.length === 0)
            return [];
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
                counts[issue.status]++;
            return {
                projectId: project.id,
                projectName: project.name,
                projectIdentifier: project.identifier,
                orgSlug: project.organization.slug,
                status: project.status,
                counts,
                total: project.issues.length,
            };
        });
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
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map