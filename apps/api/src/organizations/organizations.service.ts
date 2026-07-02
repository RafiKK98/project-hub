import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole, NotificationType } from '@prisma/client';
import type {
  InvitationDto,
  MembershipDto,
  OrganizationDto,
} from '@projecthub/types';
import { slugify } from '@projecthub/utils';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateOrganizationDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  UpdateOrganizationDto,
} from './dto';

// Roles that are allowed to manage the organization
const MANAGER_ROLES: MemberRole[] = [
  MemberRole.OWNER,
  MemberRole.ADMIN,
  MemberRole.MANAGER,
];
const ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(
    userId: string,
    dto: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    const slug = await this.generateUniqueSlug(dto.name);

    const org = await this.prisma.organization.create({
      data: {
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        memberships: {
          create: {
            userId,
            role: MemberRole.OWNER,
          },
        },
      },
      include: { _count: { select: { memberships: true } } },
    });

    return this.toOrganizationDto(
      org,
      org._count.memberships,
      MemberRole.OWNER,
    );
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAllForUser(userId: string): Promise<OrganizationDto[]> {
    const memberships = await this.prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: { _count: { select: { memberships: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return memberships.map((m) =>
      this.toOrganizationDto(
        m.organization,
        m.organization._count.memberships,
        m.role,
      ),
    );
  }

  async findBySlug(slug: string, userId: string): Promise<OrganizationDto> {
    const membership = await this.prisma.membership.findFirst({
      where: { userId, organization: { slug } },
      include: {
        organization: {
          include: { _count: { select: { memberships: true } } },
        },
      },
    });

    if (!membership) throw new NotFoundException('Organization not found');

    return this.toOrganizationDto(
      membership.organization,
      membership.organization._count.memberships,
      membership.role,
    );
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(
    orgId: string,
    userId: string,
    dto: UpdateOrganizationDto,
  ): Promise<OrganizationDto> {
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

  // ── Delete ──────────────────────────────────────────────────────────────────

  async delete(orgId: string, userId: string): Promise<void> {
    await this.assertRole(orgId, userId, [MemberRole.OWNER]);
    await this.prisma.organization.delete({ where: { id: orgId } });
  }

  // ── Members ─────────────────────────────────────────────────────────────────

  async getMembers(orgId: string, userId: string): Promise<MembershipDto[]> {
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

  async updateMemberRole(
    orgId: string,
    requestingUserId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<MembershipDto> {
    await this.assertRole(orgId, requestingUserId, ADMIN_ROLES);

    // Prevent demoting the last owner
    if (dto.role !== MemberRole.OWNER) {
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

  async removeMember(
    orgId: string,
    requestingUserId: string,
    targetUserId: string,
  ): Promise<void> {
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

  // ── Invitations ─────────────────────────────────────────────────────────────

  async inviteMember(
    orgId: string,
    invitedById: string,
    dto: InviteMemberDto,
  ): Promise<InvitationDto> {
    await this.assertRole(orgId, invitedById, MANAGER_ROLES);

    // Check if user is already a member
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
        throw new ConflictException(
          'This user is already a member of this organization',
        );
    }

    // Check for existing pending invitation
    const existingInvite = await this.prisma.invitation.findUnique({
      where: {
        email_organizationId: { email: dto.email, organizationId: orgId },
      },
    });
    if (existingInvite && existingInvite.status === 'PENDING')
      throw new ConflictException(
        'A pending invitation already exists for this email',
      );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

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

    // If the invited email belongs to an existing user, send them an in-app notification
    const invitedUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (invitedUser) {
      await this.notificationsService.createNotification({
        userId: invitedUser.id,
        type: NotificationType.MEMBER_INVITED,
        title: 'You have been invited to an organization',
        body: `${invitation.invitedBy.name ?? invitation.invitedBy.email} invited you to join ${invitation.organization.name}`,
        payload: {
          organizationId: orgId,
          organizationName: invitation.organization.name,
          orgSlug: invitation.organization.slug,
          invitedByName:
            invitation.invitedBy.name ?? invitation.invitedBy.email,
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

  async getInvitations(
    orgId: string,
    userId: string,
  ): Promise<InvitationDto[]> {
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

  async cancelInvitation(
    orgId: string,
    userId: string,
    invitationId: string,
  ): Promise<void> {
    await this.assertRole(orgId, userId, MANAGER_ROLES);

    const invitation = await this.prisma.invitation.findFirst({
      where: { id: invitationId, organizationId: orgId },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

    await this.prisma.invitation.delete({ where: { id: invitationId } });
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
  ): Promise<OrganizationDto> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: {
        organization: {
          include: { _count: { select: { memberships: true } } },
        },
      },
    });

    if (!invitation) throw new NotFoundException('Invitation not found');
    if (invitation.status !== 'PENDING')
      throw new BadRequestException(
        'This invitation has already been used or expired',
      );

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitationId },
        data: { status: 'EXPIRED' },
      });
      throw new BadRequestException('This invitation has expired');
    }

    // Check the accepting user's email matches the invitation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.email.toLowerCase() !== invitation.email.toLowerCase())
      throw new ForbiddenException(
        'This invitation was sent to a different email address',
      );

    // Check not already a member
    const existing = await this.prisma.membership.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invitation.organizationId,
        },
      },
    });
    if (existing)
      throw new ConflictException(
        'You are already a member of this organization',
      );

    // Accept: create membership and update invitation status
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
    return this.toOrganizationDto(
      org,
      org._count.memberships + 1,
      invitation.role,
    );
  }

  async getInvitationDetails(invitationId: string): Promise<{
    id: string;
    email: string;
    role: string;
    organizationName: string;
    orgSlug: string;
    expiresAt: string;
    status: string;
  }> {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { organization: true },
    });
    if (!invitation) throw new NotFoundException('Invitation not found');

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

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async assertMember(orgId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });
    if (!membership) throw new NotFoundException('Organization not found');
    return membership;
  }

  private async assertRole(
    orgId: string,
    userId: string,
    allowedRoles: MemberRole[],
  ) {
    const membership = await this.assertMember(orgId, userId);
    if (!allowedRoles.includes(membership.role))
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );

    return membership;
  }

  private async assertNotLastOwner(orgId: string, userId: string) {
    const ownerCount = await this.prisma.membership.count({
      where: { organizationId: orgId, role: MemberRole.OWNER },
    });
    const isOwner = await this.prisma.membership.findFirst({
      where: { organizationId: orgId, userId, role: MemberRole.OWNER },
    });
    if (isOwner && ownerCount <= 1)
      throw new BadRequestException(
        'Cannot remove the last owner. Transfer ownership before leaving.',
      );
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    const base = slugify(name);
    let slug = base;
    let attempt = 0;

    while (true) {
      const existing = await this.prisma.organization.findUnique({
        where: { slug },
      });
      if (!existing) return slug;
      attempt++;
      slug = `${base}-${attempt}`;
    }
  }

  private toOrganizationDto(
    org: {
      id: string;
      name: string;
      slug: string;
      description: string | null;
      avatarUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    memberCount: number,
    currentUserRole: MemberRole,
  ): OrganizationDto {
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      description: org.description,
      avatarUrl: org.avatarUrl,
      createdAt: org.createdAt.toISOString(),
      memberCount,
      currentUserRole,
    };
  }
}
