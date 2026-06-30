import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole, ProjectMemberRole } from '@prisma/client';
import { ProjectDto, ProjectMemberDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectMemberRoleDto,
} from './dto';

// Org roles that have implicit full access to all projects
const ORG_ADMIN_ROLES: MemberRole[] = [MemberRole.OWNER, MemberRole.ADMIN];
// Project roles that can manage the project
const PROJECT_MANAGER_ROLES: ProjectMemberRole[] = [ProjectMemberRole.MANAGER];

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(
    orgId: string,
    userId: string,
    dto: CreateProjectDto,
  ): Promise<ProjectDto> {
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
      throw new ConflictException(
        `Identifier "${dto.identifier}" is already used by another project in this organization`,
      );

    const project = await this.prisma.project.create({
      data: {
        name: dto.name,
        identifier: dto.identifier.toUpperCase(),
        description: dto.description?.trim() || null,
        organizationId: orgId,
        createdById: userId,
        members: {
          create: { userId, role: ProjectMemberRole.MANAGER },
        },
      },
      include: { _count: { select: { members: true } } },
    });

    return this.toProjectDto(
      project,
      project._count.members,
      ProjectMemberRole.MANAGER,
    );
  }

  // ── Read ────────────────────────────────────────────────────────────────────

  async findAllForOrg(orgId: string, userId: string): Promise<ProjectDto[]> {
    const orgMembership = await this.assertOrgMember(orgId, userId);
    const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);

    const projects = await this.prisma.project.findMany({
      where: {
        organizationId: orgId,
        // Org admins see all projects; others only see projects they're a member of
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
        ? ProjectMemberRole.MANAGER
        : (project.members[0]?.role ?? null);
      return this.toProjectDto(project, project._count.members, userRole);
    });
  }

  async findById(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<ProjectDto> {
    const { project, userRole } = await this.assertProjectAccess(
      orgId,
      projectId,
      userId,
    );
    const count = await this.prisma.projectMember.count({
      where: { projectId },
    });
    return this.toProjectDto(project, count, userRole);
  }

  // ── Update ──────────────────────────────────────────────────────────────────

  async update(
    orgId: string,
    projectId: string,
    userId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
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

    return this.toProjectDto(
      project,
      project._count.members,
      member?.role ?? ProjectMemberRole.MANAGER,
    );
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  async delete(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<void> {
    await this.assertProjectManager(orgId, projectId, userId);
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  // ── Members ─────────────────────────────────────────────────────────────────

  async getMembers(
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<ProjectMemberDto[]> {
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
      role: m.role as ProjectMemberDto['role'],
      createdAt: m.createdAt.toISOString(),
      user: m.user,
    }));
  }

  async addMember(
    orgId: string,
    projectId: string,
    requestingUserId: string,
    dto: AddProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    await this.assertProjectManager(orgId, projectId, requestingUserId);

    // Target user must be an org member
    await this.assertOrgMember(orgId, dto.userId);

    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: dto.userId } },
    });
    if (existing)
      throw new ConflictException('User is already a member of this project');

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
      role: member.role as ProjectMemberDto['role'],
      createdAt: member.createdAt.toISOString(),
      user: member.user,
    };
  }

  async updateMemberRole(
    orgId: string,
    projectId: string,
    requestingUserId: string,
    targetUserId: string,
    dto: UpdateProjectMemberRoleDto,
  ): Promise<ProjectMemberDto> {
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
      role: member.role as ProjectMemberDto['role'],
      createdAt: member.createdAt.toISOString(),
      user: member.user,
    };
  }

  async removeMember(
    orgId: string,
    projectId: string,
    requestingUserId: string,
    targetUserId: string,
  ): Promise<void> {
    const isRemovingSelf = requestingUserId === targetUserId;
    if (!isRemovingSelf) {
      await this.assertProjectManager(orgId, projectId, requestingUserId);
    }

    // Prevent removing the last manager
    if (isRemovingSelf) {
      const targetMember = await this.prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: targetUserId } },
      });
      if (targetMember?.role === ProjectMemberRole.MANAGER) {
        const managerCount = await this.prisma.projectMember.count({
          where: { projectId, role: ProjectMemberRole.MANAGER },
        });
        if (managerCount <= 1) {
          throw new BadRequestException(
            'Cannot remove the last manager. Assign another manager first.',
          );
        }
      }
    }

    await this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId: targetUserId } },
    });
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private async assertOrgMember(orgId: string, userId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!membership) throw new NotFoundException('Organization not found');
    return membership;
  }

  private async assertProjectAccess(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, organizationId: orgId },
    });
    if (!project) throw new NotFoundException('Project not found');

    const orgMembership = await this.assertOrgMember(orgId, userId);
    const isOrgAdmin = ORG_ADMIN_ROLES.includes(orgMembership.role);

    if (isOrgAdmin) return { project, userRole: ProjectMemberRole.MANAGER };

    const projectMember = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    if (!projectMember)
      throw new ForbiddenException('You are not a member of this project');

    return { project, userRole: projectMember.role };
  }

  private async assertProjectManager(
    orgId: string,
    projectId: string,
    userId: string,
  ) {
    const { userRole } = await this.assertProjectAccess(
      orgId,
      projectId,
      userId,
    );
    if (!PROJECT_MANAGER_ROLES.includes(userRole))
      throw new ForbiddenException(
        'Only project managers can perform this action.',
      );
  }

  private toProjectDto(
    project: {
      id: string;
      name: string;
      identifier: string;
      description: string | null;
      status: string;
      organizationId: string;
      createdById: string;
      createdAt: Date;
    },
    memberCount: number,
    currentUserRole: ProjectMemberRole | null,
  ): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      identifier: project.identifier,
      description: project.description,
      status: project.status as ProjectDto['status'],
      organizationId: project.organizationId,
      createdById: project.createdById,
      createdAt: project.createdAt.toISOString(),
      memberCount,
      currentUserRole,
    };
  }
}
