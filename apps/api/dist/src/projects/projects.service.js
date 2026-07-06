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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const ORG_ADMIN_ROLES = [client_1.MemberRole.OWNER, client_1.MemberRole.ADMIN];
const PROJECT_MANAGER_ROLES = [client_1.ProjectMemberRole.MANAGER];
let ProjectsService = class ProjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(orgId, userId, dto) {
        await this.assertOrgMember(orgId, userId);
        const existing = await this.prisma.project.findUnique({
            where: {
                organizationId_identifier: {
                    organizationId: orgId,
                    identifier: dto.identifier,
                },
            },
        });
        if (existing)
            throw new common_1.ConflictException(`Identifier "${dto.identifier}" is already used by another project in this organization`);
        const project = await this.prisma.project.create({
            data: {
                name: dto.name,
                identifier: dto.identifier.toUpperCase(),
                description: dto.description?.trim() || null,
                organizationId: orgId,
                createdById: userId,
                members: {
                    create: { userId, role: client_1.ProjectMemberRole.MANAGER },
                },
            },
            include: { _count: { select: { members: true } } },
        });
        return this.toProjectDto(project, project._count.members, client_1.ProjectMemberRole.MANAGER);
    }
    async findAllForOrg(orgId, userId) {
        const orgMembership = await this.assertOrgMember(orgId, userId);
        const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);
        const projects = await this.prisma.project.findMany({
            where: {
                organizationId: orgId,
                ...(!isOrgAdmin && {
                    members: { some: { userId } },
                }),
            },
            include: {
                _count: { select: { members: true } },
                members: { where: { userId }, select: { role: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        return projects.map((project) => {
            const userRole = isOrgAdmin
                ? client_1.ProjectMemberRole.MANAGER
                : (project.members[0]?.role ?? null);
            return this.toProjectDto(project, project._count.members, userRole);
        });
    }
    async findById(orgId, projectId, userId) {
        const { project, userRole } = await this.assertProjectAccess(orgId, projectId, userId);
        const count = await this.prisma.projectMember.count({
            where: { projectId },
        });
        return this.toProjectDto(project, count, userRole);
    }
    async update(orgId, projectId, userId, dto) {
        await this.assertProjectManager(orgId, projectId, userId);
        const project = await this.prisma.project.update({
            where: { id: projectId },
            data: {
                ...(dto.name && { name: dto.name.trim() }),
                ...(dto.description !== undefined && {
                    description: dto.description.trim(),
                }),
                ...(dto.status && { status: dto.status }),
            },
            include: { _count: { select: { members: true } } },
        });
        const member = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        return this.toProjectDto(project, project._count.members, member?.role ?? client_1.ProjectMemberRole.MANAGER);
    }
    async delete(orgId, projectId, userId) {
        await this.assertProjectManager(orgId, projectId, userId);
        await this.prisma.project.delete({ where: { id: projectId } });
    }
    async getMembers(orgId, projectId, userId) {
        await this.assertProjectAccess(orgId, projectId, userId);
        const members = await this.prisma.projectMember.findMany({
            where: { projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return members.map((m) => ({
            id: m.id,
            role: m.role,
            createdAt: m.createdAt.toISOString(),
            user: m.user,
        }));
    }
    async addMember(orgId, projectId, requestingUserId, dto) {
        await this.assertProjectManager(orgId, projectId, requestingUserId);
        await this.assertOrgMember(orgId, dto.userId);
        const existing = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId: dto.userId } },
        });
        if (existing)
            throw new common_1.ConflictException('User is already a member of this project');
        const member = await this.prisma.projectMember.create({
            data: { projectId, userId: dto.userId, role: dto.role },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });
        return {
            id: member.id,
            role: member.role,
            createdAt: member.createdAt.toISOString(),
            user: member.user,
        };
    }
    async updateMemberRole(orgId, projectId, requestingUserId, targetUserId, dto) {
        await this.assertProjectManager(orgId, projectId, requestingUserId);
        const member = await this.prisma.projectMember.update({
            where: { projectId_userId: { projectId, userId: targetUserId } },
            data: { role: dto.role },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });
        return {
            id: member.id,
            role: member.role,
            createdAt: member.createdAt.toISOString(),
            user: member.user,
        };
    }
    async removeMember(orgId, projectId, requestingUserId, targetUserId) {
        const isRemovingSelf = requestingUserId === targetUserId;
        if (!isRemovingSelf) {
            await this.assertProjectManager(orgId, projectId, requestingUserId);
        }
        if (isRemovingSelf) {
            const targetMember = await this.prisma.projectMember.findUnique({
                where: { projectId_userId: { projectId, userId: targetUserId } },
            });
            if (targetMember?.role === client_1.ProjectMemberRole.MANAGER) {
                const managerCount = await this.prisma.projectMember.count({
                    where: { projectId, role: client_1.ProjectMemberRole.MANAGER },
                });
                if (managerCount <= 1) {
                    throw new common_1.BadRequestException('Cannot remove the last manager. Assign another manager first.');
                }
            }
        }
        await this.prisma.projectMember.delete({
            where: { projectId_userId: { projectId, userId: targetUserId } },
        });
    }
    async assertOrgMember(orgId, userId) {
        const membership = await this.prisma.membership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        if (!membership)
            throw new common_1.NotFoundException('Organization not found');
        return membership;
    }
    async assertProjectAccess(orgId, projectId, userId) {
        const project = await this.prisma.project.findFirst({
            where: { id: projectId, organizationId: orgId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        const orgMembership = await this.assertOrgMember(orgId, userId);
        const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);
        if (isOrgAdmin)
            return { project, userRole: client_1.ProjectMemberRole.MANAGER };
        const projectMember = await this.prisma.projectMember.findUnique({
            where: { projectId_userId: { projectId, userId } },
        });
        if (!projectMember)
            throw new common_1.ForbiddenException('You are not a member of this project');
        return { project, userRole: projectMember.role };
    }
    async assertProjectManager(orgId, projectId, userId) {
        const { userRole } = await this.assertProjectAccess(orgId, projectId, userId);
        if (!PROJECT_MANAGER_ROLES.includes(userRole))
            throw new common_1.ForbiddenException('Only project managers can perform this action.');
    }
    toProjectDto(project, memberCount, currentUserRole) {
        return {
            id: project.id,
            name: project.name,
            identifier: project.identifier,
            description: project.description,
            status: project.status,
            organizationId: project.organizationId,
            createdById: project.createdById,
            createdAt: project.createdAt.toISOString(),
            memberCount,
            currentUserRole,
        };
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map