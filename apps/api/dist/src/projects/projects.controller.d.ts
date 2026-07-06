import { ProjectDto, ProjectMemberDto } from '@projecthub/types';
import { type JwtPayload } from '../auth/token.service';
import { AddProjectMemberDto, CreateProjectDto, UpdateProjectDto, UpdateProjectMemberRoleDto } from './dto';
import { ProjectsService } from './projects.service';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(orgId: string, user: JwtPayload, dto: CreateProjectDto): Promise<ProjectDto>;
    findAll(orgId: string, user: JwtPayload): Promise<ProjectDto[]>;
    findOne(orgId: string, projectId: string, user: JwtPayload): Promise<ProjectDto>;
    update(orgId: string, projectId: string, user: JwtPayload, dto: UpdateProjectDto): Promise<ProjectDto>;
    delete(orgId: string, projectId: string, user: JwtPayload): Promise<void>;
    getMembers(orgId: string, projectId: string, user: JwtPayload): Promise<ProjectMemberDto[]>;
    addMember(orgId: string, projectId: string, user: JwtPayload, dto: AddProjectMemberDto): Promise<ProjectMemberDto>;
    updateMemberRole(orgId: string, projectId: string, targetUserId: string, user: JwtPayload, dto: UpdateProjectMemberRoleDto): Promise<ProjectMemberDto>;
    removeMember(orgId: string, projectId: string, targetUserId: string, user: JwtPayload): Promise<void>;
}
//# sourceMappingURL=projects.controller.d.ts.map