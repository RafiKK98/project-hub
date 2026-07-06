import { ProjectDto, ProjectMemberDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { AddProjectMemberDto, CreateProjectDto, UpdateProjectDto, UpdateProjectMemberRoleDto } from './dto';
export declare class ProjectsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(orgId: string, userId: string, dto: CreateProjectDto): Promise<ProjectDto>;
    findAllForOrg(orgId: string, userId: string): Promise<ProjectDto[]>;
    findById(orgId: string, projectId: string, userId: string): Promise<ProjectDto>;
    update(orgId: string, projectId: string, userId: string, dto: UpdateProjectDto): Promise<ProjectDto>;
    delete(orgId: string, projectId: string, userId: string): Promise<void>;
    getMembers(orgId: string, projectId: string, userId: string): Promise<ProjectMemberDto[]>;
    addMember(orgId: string, projectId: string, requestingUserId: string, dto: AddProjectMemberDto): Promise<ProjectMemberDto>;
    updateMemberRole(orgId: string, projectId: string, requestingUserId: string, targetUserId: string, dto: UpdateProjectMemberRoleDto): Promise<ProjectMemberDto>;
    removeMember(orgId: string, projectId: string, requestingUserId: string, targetUserId: string): Promise<void>;
    private assertOrgMember;
    private assertProjectAccess;
    private assertProjectManager;
    private toProjectDto;
}
//# sourceMappingURL=projects.service.d.ts.map