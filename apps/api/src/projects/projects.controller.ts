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
import { ProjectDto, ProjectMemberDto } from '@projecthub/types';
import { type JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  UpdateProjectDto,
  UpdateProjectMemberRoleDto,
} from './dto';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiBearerAuth()
@Controller('organizations/:orgId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // ── Project CRUD ─────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Create a new project in an organization' })
  create(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectsService.create(orgId, user.sub, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all accessible projects in an organization' })
  findAll(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectDto[]> {
    return this.projectsService.findAllForOrg(orgId, user.sub);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get a project by ID ' })
  findOne(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectDto> {
    return this.projectsService.findById(orgId, projectId, user.sub);
  }

  @Patch(':projectId')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectsService.update(orgId, projectId, user.sub, dto);
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a project' })
  delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.projectsService.delete(orgId, projectId, user.sub);
  }

  // ── Project Members ───────────────────────────────────────────────────────────

  @Get(':projectId/members')
  @ApiOperation({ summary: 'List project members' })
  getMembers(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ProjectMemberDto[]> {
    return this.projectsService.getMembers(orgId, projectId, user.sub);
  }

  @Post(':projectId/members')
  @ApiOperation({ summary: 'Add a member to the project' })
  addMember(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: AddProjectMemberDto,
  ): Promise<ProjectMemberDto> {
    return this.projectsService.addMember(orgId, projectId, user.sub, dto);
  }

  @Patch(':projectId/members/:userId')
  @ApiOperation({ summary: 'Update a project member role' })
  updateMemberRole(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProjectMemberRoleDto,
  ): Promise<ProjectMemberDto> {
    return this.projectsService.updateMemberRole(
      orgId,
      projectId,
      user.sub,
      targetUserId,
      dto,
    );
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the project' })
  removeMember(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.projectsService.removeMember(
      orgId,
      projectId,
      user.sub,
      targetUserId,
    );
  }
}
