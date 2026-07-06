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
exports.OrganizationsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const utils_1 = require("@projecthub/utils");
const prisma_service_1 = require("../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const MANAGER_ROLES = [
    client_1.MemberRole.OWNER,
    client_1.MemberRole.ADMIN,
    client_1.MemberRole.MANAGER,
];
const ADMIN_ROLES = [client_1.MemberRole.OWNER, client_1.MemberRole.ADMIN];
let OrganizationsService = class OrganizationsService {
    prisma;
    notificationsService;
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async create(userId, dto) {
        const slug = await this.generateUniqueSlug(dto.name);
        const org = await this.prisma.organization.create({
            data: {
                name: dto.name.trim(),
                slug,
                description: dto.description?.trim(),
                memberships: {
                    create: {
                        userId,
                        role: client_1.MemberRole.OWNER,
                    },
                },
            },
            include: { _count: { select: { memberships: true } } },
        });
        return this.toOrganizationDto(org, org._count.memberships, client_1.MemberRole.OWNER);
    }
    async findAllForUser(userId) {
        const memberships = await this.prisma.membership.findMany({
            where: { userId },
            include: {
                organization: {
                    include: { _count: { select: { memberships: true } } },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return memberships.map((m) => this.toOrganizationDto(m.organization, m.organization._count.memberships, m.role));
    }
    async findBySlug(slug, userId) {
        const membership = await this.prisma.membership.findFirst({
            where: { userId, organization: { slug } },
            include: {
                organization: {
                    include: { _count: { select: { memberships: true } } },
                },
            },
        });
        if (!membership)
            throw new common_1.NotFoundException('Organization not found');
        return this.toOrganizationDto(membership.organization, membership.organization._count.memberships, membership.role);
    }
    async update(orgId, userId, dto) {
        await this.assertRole(orgId, userId, ADMIN_ROLES);
        const org = await this.prisma.organization.update({
            where: { id: orgId },
            data: {
                ...(dto.name && { name: dto.name.trim() }),
                ...(dto.description !== undefined && {
                    description: dto.description?.trim(),
                }),
            },
            include: { _count: { select: { memberships: true } } },
        });
        const membership = await this.prisma.membership.findUniqueOrThrow({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        return this.toOrganizationDto(org, org._count.memberships, membership.role);
    }
    async delete(orgId, userId) {
        await this.assertRole(orgId, userId, [client_1.MemberRole.OWNER]);
        await this.prisma.organization.delete({ where: { id: orgId } });
    }
    async getMembers(orgId, userId) {
        await this.assertMember(orgId, userId);
        const memberships = await this.prisma.membership.findMany({
            where: { organizationId: orgId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
        return memberships.map((m) => ({
            id: m.id,
            role: m.role,
            createdAt: m.createdAt.toISOString(),
            user: m.user,
        }));
    }
    async updateMemberRole(orgId, requestingUserId, targetUserId, dto) {
        await this.assertRole(orgId, requestingUserId, ADMIN_ROLES);
        if (dto.role !== client_1.MemberRole.OWNER) {
            await this.assertNotLastOwner(orgId, targetUserId);
        }
        const membership = await this.prisma.membership.update({
            where: {
                userId_organizationId: { userId: targetUserId, organizationId: orgId },
            },
            data: { role: dto.role },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatarUrl: true },
                },
            },
        });
        return {
            id: membership.id,
            role: membership.role,
            createdAt: membership.createdAt.toISOString(),
            user: membership.user,
        };
    }
    async removeMember(orgId, requestingUserId, targetUserId) {
        const isRemovingSelf = requestingUserId === targetUserId;
        if (!isRemovingSelf) {
            await this.assertRole(orgId, requestingUserId, ADMIN_ROLES);
        }
        await this.assertNotLastOwner(orgId, targetUserId);
        await this.prisma.membership.delete({
            where: {
                userId_organizationId: { userId: targetUserId, organizationId: orgId },
            },
        });
    }
    async inviteMember(orgId, invitedById, dto) {
        await this.assertRole(orgId, invitedById, MANAGER_ROLES);
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            const alreadyMember = await this.prisma.membership.findUnique({
                where: {
                    userId_organizationId: {
                        userId: existingUser.id,
                        organizationId: orgId,
                    },
                },
            });
            if (alreadyMember)
                throw new common_1.ConflictException('This user is already a member of this organization');
        }
        const existingInvite = await this.prisma.invitation.findUnique({
            where: {
                email_organizationId: { email: dto.email, organizationId: orgId },
            },
        });
        if (existingInvite && existingInvite.status === 'PENDING') {
            throw new common_1.ConflictException('A pending invitation already exists for this email');
        }
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        const invitation = await this.prisma.invitation.upsert({
            where: {
                email_organizationId: { email: dto.email, organizationId: orgId },
            },
            create: {
                email: dto.email.toLowerCase().trim(),
                organizationId: orgId,
                invitedById,
                role: dto.role,
                expiresAt,
            },
            update: {
                role: dto.role,
                status: 'PENDING',
                expiresAt,
                invitedById,
            },
            include: {
                invitedBy: { select: { id: true, name: true, email: true } },
                organization: true,
            },
        });
        const invitedUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase().trim() },
        });
        if (invitedUser) {
            await this.notificationsService.createNotification({
                userId: invitedUser.id,
                type: client_1.NotificationType.MEMBER_INVITED,
                title: 'You have been invited to an organization',
                body: `${invitation.invitedBy.name ?? invitation.invitedBy.email} invited you to join ${invitation.organization.name}`,
                payload: {
                    invitationId: invitation.id,
                    organizationId: orgId,
                    organizationName: invitation.organization.name,
                    orgSlug: invitation.organization.slug,
                    invitedByName: invitation.invitedBy.name ?? invitation.invitedBy.email,
                },
            });
        }
        return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            status: invitation.status,
            expiresAt: invitation.expiresAt.toISOString(),
            createdAt: invitation.createdAt.toISOString(),
            invitedBy: invitation.invitedBy,
        };
    }
    async getInvitations(orgId, userId) {
        await this.assertRole(orgId, userId, MANAGER_ROLES);
        const invitations = await this.prisma.invitation.findMany({
            where: { organizationId: orgId, status: 'PENDING' },
            include: { invitedBy: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return invitations.map((inv) => ({
            id: inv.id,
            email: inv.email,
            role: inv.role,
            status: inv.status,
            expiresAt: inv.expiresAt.toISOString(),
            createdAt: inv.createdAt.toISOString(),
            invitedBy: inv.invitedBy,
        }));
    }
    async cancelInvitation(orgId, userId, invitationId) {
        await this.assertRole(orgId, userId, MANAGER_ROLES);
        const invitation = await this.prisma.invitation.findFirst({
            where: { id: invitationId, organizationId: orgId },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        await this.prisma.invitation.delete({ where: { id: invitationId } });
    }
    async acceptInvitation(invitationId, userId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
            include: {
                organization: {
                    include: { _count: { select: { memberships: true } } },
                },
            },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        if (invitation.status !== 'PENDING') {
            throw new common_1.BadRequestException('This invitation has already been used or expired');
        }
        if (invitation.expiresAt < new Date()) {
            await this.prisma.invitation.update({
                where: { id: invitationId },
                data: { status: 'EXPIRED' },
            });
            throw new common_1.BadRequestException('This invitation has expired');
        }
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
            throw new common_1.ForbiddenException('This invitation was sent to a different email address');
        }
        const existing = await this.prisma.membership.findUnique({
            where: {
                userId_organizationId: {
                    userId,
                    organizationId: invitation.organizationId,
                },
            },
        });
        if (existing)
            throw new common_1.ConflictException('You are already a member of this organization');
        await this.prisma.$transaction([
            this.prisma.membership.create({
                data: {
                    userId,
                    organizationId: invitation.organizationId,
                    role: invitation.role,
                },
            }),
            this.prisma.invitation.update({
                where: { id: invitationId },
                data: { status: 'ACCEPTED' },
            }),
        ]);
        const org = invitation.organization;
        return this.toOrganizationDto(org, org._count.memberships + 1, invitation.role);
    }
    async getInvitationDetails(invitationId) {
        const invitation = await this.prisma.invitation.findUnique({
            where: { id: invitationId },
            include: { organization: true },
        });
        if (!invitation)
            throw new common_1.NotFoundException('Invitation not found');
        return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            organizationName: invitation.organization.name,
            orgSlug: invitation.organization.slug,
            expiresAt: invitation.expiresAt.toISOString(),
            status: invitation.status,
        };
    }
    async assertMember(orgId, userId) {
        const membership = await this.prisma.membership.findUnique({
            where: { userId_organizationId: { userId, organizationId: orgId } },
        });
        if (!membership)
            throw new common_1.NotFoundException('Organization not found');
        return membership;
    }
    async assertRole(orgId, userId, allowedRoles) {
        const membership = await this.assertMember(orgId, userId);
        if (!allowedRoles.includes(membership.role)) {
            throw new common_1.ForbiddenException('You do not have permission to perform this action');
        }
        return membership;
    }
    async assertNotLastOwner(orgId, userId) {
        const ownerCount = await this.prisma.membership.count({
            where: { organizationId: orgId, role: client_1.MemberRole.OWNER },
        });
        const isOwner = await this.prisma.membership.findFirst({
            where: { organizationId: orgId, userId, role: client_1.MemberRole.OWNER },
        });
        if (isOwner && ownerCount <= 1) {
            throw new common_1.BadRequestException('Cannot remove the last owner. Transfer ownership before leaving.');
        }
    }
    async generateUniqueSlug(name) {
        const base = (0, utils_1.slugify)(name);
        let slug = base;
        let attempt = 0;
        while (true) {
            const existing = await this.prisma.organization.findUnique({
                where: { slug },
            });
            if (!existing)
                return slug;
            attempt++;
            slug = `${base}-${attempt}`;
        }
    }
    toOrganizationDto(org, memberCount, currentUserRole) {
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            description: org.description,
            avatarUrl: org.avatarUrl,
            createdAt: org.createdAt.toISOString(),
            memberCount,
            currentUserRole: currentUserRole,
        };
    }
};
exports.OrganizationsService = OrganizationsService;
exports.OrganizationsService = OrganizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], OrganizationsService);
//# sourceMappingURL=organizations.service.js.map