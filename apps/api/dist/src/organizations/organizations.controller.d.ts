import type { InvitationDto, MembershipDto, OrganizationDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CreateOrganizationDto, InviteMemberDto, UpdateMemberRoleDto, UpdateOrganizationDto } from './dto';
import { OrganizationsService } from './organizations.service';
export declare class OrganizationsController {
    private readonly organizationsService;
    constructor(organizationsService: OrganizationsService);
    create(user: JwtPayload, dto: CreateOrganizationDto): Promise<OrganizationDto>;
    findAll(user: JwtPayload): Promise<OrganizationDto[]>;
    findOne(slug: string, user: JwtPayload): Promise<OrganizationDto>;
    update(id: string, user: JwtPayload, dto: UpdateOrganizationDto): Promise<OrganizationDto>;
    delete(id: string, user: JwtPayload): Promise<void>;
    getMembers(id: string, user: JwtPayload): Promise<MembershipDto[]>;
    updateMemberRole(id: string, targetUserId: string, user: JwtPayload, dto: UpdateMemberRoleDto): Promise<MembershipDto>;
    removeMember(id: string, targetUserId: string, user: JwtPayload): Promise<void>;
    inviteMember(id: string, user: JwtPayload, dto: InviteMemberDto): Promise<InvitationDto>;
    getInvitations(id: string, user: JwtPayload): Promise<InvitationDto[]>;
    cancelInvitation(id: string, invitationId: string, user: JwtPayload): Promise<void>;
    getInvitationDetails(invitationId: string): Promise<{
        id: string;
        email: string;
        role: string;
        organizationName: string;
        orgSlug: string;
        expiresAt: string;
        status: string;
    }>;
    acceptInvitation(invitationId: string, user: JwtPayload): Promise<OrganizationDto>;
}
//# sourceMappingURL=organizations.controller.d.ts.map