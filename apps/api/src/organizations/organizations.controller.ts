import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  InvitationDto,
  MembershipDto,
  OrganizationDto,
} from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common';
import {
  CreateOrganizationDto,
  InviteMemberDto,
  UpdateMemberRoleDto,
  UpdateOrganizationDto,
} from './dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  // ── Org CRUD ─────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationDto> {
    return this.organizationsService.create(user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all organizations the current user belongs to',
  })
  findAll(@CurrentUser() user: JwtPayload): Promise<OrganizationDto[]> {
    return this.organizationsService.findAllForUser(user.sub);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get an organization by slug' })
  findOne(
    @Param('slug') slug: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<OrganizationDto> {
    return this.organizationsService.findBySlug(slug, user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization details' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationDto> {
    return this.organizationsService.update(id, user.sub, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an organization (owner only)' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.organizationsService.delete(id, user.sub);
  }

  // ── Members ──────────────────────────────────────────────────────────────────

  @Get(':id/members')
  @ApiOperation({ summary: 'List all members of an organization' })
  getMembers(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<MembershipDto[]> {
    return this.organizationsService.getMembers(id, user.sub);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update a member role' })
  updateMemberRole(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMemberRoleDto,
  ): Promise<MembershipDto> {
    return this.organizationsService.updateMemberRole(
      id,
      user.sub,
      targetUserId,
      dto,
    );
  }

  @Delete(':id/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the organization' })
  removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.organizationsService.removeMember(id, user.sub, targetUserId);
  }

  // ── Invitations ───────────────────────────────────────────────────────────────

  @Post(':id/invitations')
  @ApiOperation({ summary: 'Invite a user to the organization' })
  inviteMember(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: InviteMemberDto,
  ): Promise<InvitationDto> {
    return this.organizationsService.inviteMember(id, user.sub, dto);
  }

  @Get(':id/invitations')
  @ApiOperation({ summary: 'List pending invitations' })
  getInvitations(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<InvitationDto[]> {
    return this.organizationsService.getInvitations(id, user.sub);
  }

  @Delete(':id/invitations/:invitationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel a pending invitation' })
  cancelInvitation(
    @Param('id') id: string,
    @Param('invitationId') invitationId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.organizationsService.cancelInvitation(
      id,
      user.sub,
      invitationId,
    );
  }
}
