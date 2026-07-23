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
exports.LabelsService = void 0;
const prisma_service_1 = require("../database/prisma.service");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const ORG_ADMIN_ROLES = [client_1.MemberRole.OWNER, client_1.MemberRole.ADMIN];
const PROJECT_MANAGER_ROLES = [client_1.ProjectMemberRole.MANAGER];
let LabelsService = class LabelsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAllForProject(orgId, projectId, userId) {
        await this.assertProjectAccess(orgId, projectId, userId);
        const labels = await this.prisma.label.findMany({
            where: { projectId },
            orderBy: { name: 'asc' },
        });
        return labels.map(this.toDto);
    }
    async create(orgId, projectId, userId, dto) {
        await this.assertProjectManager(orgId, projectId, userId);
        const existing = await this.prisma.label.findUnique({
            where: { projectId_name: { projectId, name: dto.name.trim() } },
        });
        if (existing)
            throw new common_1.ConflictException(`A label named "${dto.name}" already exists in this project`);
        const label = await this.prisma.label.create({
            data: { name: dto.name.trim(), color: dto.color, projectId },
        });
        return this.toDto(label);
    }
    async update(orgId, projectId, labelId, userId, dto) {
        await this.assertProjectManager(orgId, projectId, userId);
        const existing = await this.prisma.label.findFirst({
            where: { id: labelId, projectId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Label not found');
        const label = await this.prisma.label.update({
            where: { id: labelId },
            data: {
                ...(dto.name && { name: dto.name.trim() }),
                ...(dto.color && { color: dto.color }),
            },
        });
        return this.toDto(label);
    }
    async delete(orgId, projectId, labelId, userId) {
        await this.assertProjectManager(orgId, projectId, userId);
        const existing = await this.prisma.label.findFirst({
            where: { id: labelId, projectId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Label not found');
        await this.prisma.label.delete({ where: { id: labelId } });
    }
    async setIssueLabels(orgId, projectId, issueNumber, userId, dto) {
        await this.assertProjectAccess(orgId, projectId, userId);
        const issue = await this.prisma.issue.findUnique({
            where: { projectId_number: { projectId, number: issueNumber } },
        });
        if (!issue)
            throw new common_1.NotFoundException('Issue not found');
        if (dto.labelIds.length > 0) {
            const labels = await this.prisma.label.findMany({
                where: { id: { in: dto.labelIds }, projectId },
            });
            if (labels.length !== dto.labelIds.length)
                throw new common_1.NotFoundException('One or more labels not found in this project');
        }
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
        return labels.map(this.toDto);
    }
    async getIssueLabels(orgId, projectId, issueNumber, userId) {
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
        if (!issue)
            throw new common_1.NotFoundException('Issue not found');
        return issue.labels.map((il) => this.toDto(il.label));
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
        if (ORG_ADMIN_ROLES.includes(orgMembership.role))
            return;
        const projectMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!projectMember)
            throw new common_1.ForbiddenException('You are not a member of this project');
    }
    async assertProjectManager(orgId, projectId, userId) {
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
        if (ORG_ADMIN_ROLES.includes(orgMembership.role))
            return;
        const projectMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!projectMember || !PROJECT_MANAGER_ROLES.includes(projectMember.role))
            throw new common_1.ForbiddenException('Only project managers can manage labels');
    }
    toDto(label) {
        return {
            id: label.id,
            name: label.name,
            color: label.color,
            projectId: label.projectId,
            createdAt: label.createdAt.toISOString(),
        };
    }
};
exports.LabelsService = LabelsService;
exports.LabelsService = LabelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LabelsService);
//# sourceMappingURL=labels.service.js.map