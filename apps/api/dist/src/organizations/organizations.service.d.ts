import type { InvitationDto, MembershipDto, OrganizationDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrganizationDto, InviteMemberDto, UpdateMemberRoleDto, UpdateOrganizationDto } from './dto';
export declare class OrganizationsService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(userId: string, dto: CreateOrganizationDto): Promise<OrganizationDto>;
    findAllForUser(userId: string): Promise<OrganizationDto[]>;
    findBySlug(slug: string, userId: string): Promise<OrganizationDto>;
    update(orgId: string, userId: string, dto: UpdateOrganizationDto): Promise<OrganizationDto>;
    delete(orgId: string, userId: string): Promise<void>;
    getMembers(orgId: string, userId: string): Promise<MembershipDto[]>;
    updateMemberRole(orgId: string, requestingUserId: string, targetUserId: string, dto: UpdateMemberRoleDto): Promise<MembershipDto>;
    removeMember(orgId: string, requestingUserId: string, targetUserId: string): Promise<void>;
    inviteMember(orgId: string, invitedById: string, dto: InviteMemberDto): Promise<InvitationDto>;
    getInvitations(orgId: string, userId: string): Promise<InvitationDto[]>;
    cancelInvitation(orgId: string, userId: string, invitationId: string): Promise<void>;
    acceptInvitation(invitationId: string, userId: string): Promise<OrganizationDto>;
    getInvitationDetails(invitationId: string): Promise<{
        id: string;
        email: string;
        role: string;
        organizationName: string;
        orgSlug: string;
        expiresAt: string;
        status: string;
    }>;
    private assertMember;
    private assertRole;
    private assertNotLastOwner;
    private generateUniqueSlug;
    private toOrganizationDto;
}
//# sourceMappingURL=organizations.service.d.ts.map