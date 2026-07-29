import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import type { IssueDto, IssuePriority, IssueStatus } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  CreateIssueDto,
  ReorderIssueDto,
  SetParentDto,
  UpdateIssueDto,
} from './dto';
import { IssuesService } from './issues.service';

@ApiTags('Issues')
@ApiBearerAuth()
@Controller('organizations/:orgId/projects/:projectId/issues')
export class IssuesController {
  constructor(private readonly issuesService: IssuesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new issue (optionally as a subtask via parentId)',
  })
  create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateIssueDto,
  ): Promise<IssueDto> {
    return this.issuesService.create(orgId, projectId, user.sub, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List top-level issues in a project (subtasks excluded)',
  })
  @ApiQuery({ name: 'status', required: false, isArray: true })
  @ApiQuery({ name: 'priority', required: false, isArray: true })
  @ApiQuery({ name: 'assigneeId', required: false })
  findAll(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: IssueStatus | IssueStatus[],
    @Query('priority') priority?: IssuePriority | IssuePriority[],
    @Query('assigneeId') assigneeId?: string,
  ): Promise<IssueDto[]> {
    return this.issuesService.findAllForProject(orgId, projectId, user.sub, {
      status: status ? (Array.isArray(status) ? status : [status]) : undefined,
      priority: priority
        ? Array.isArray(priority)
          ? priority
          : [priority]
        : undefined,
      assigneeId,
    });
  }

  @Get(':number')
  @ApiOperation({ summary: 'Get an issue by its project-scoped number' })
  findOne(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<IssueDto> {
    return this.issuesService.findByNumber(orgId, projectId, number, user.sub);
  }

  @Patch(':number')
  @ApiOperation({ summary: 'Update an issue' })
  update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateIssueDto,
  ): Promise<IssueDto> {
    return this.issuesService.update(orgId, projectId, number, user.sub, dto);
  }

  @Patch(':number/parent')
  @ApiOperation({ summary: 'Link or unlink a subtask relationship' })
  setParent(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SetParentDto,
  ): Promise<IssueDto> {
    return this.issuesService.setParent(
      orgId,
      projectId,
      number,
      user.sub,
      dto,
    );
  }

  @Patch(':number/reorder')
  @ApiOperation({ summary: 'Reorder an issue within or across columns' })
  reorder(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReorderIssueDto,
  ): Promise<IssueDto> {
    return this.issuesService.reorder(orgId, projectId, number, user.sub, dto);
  }

  @Delete(':number')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an issue' })
  delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.issuesService.delete(orgId, projectId, number, user.sub);
  }
}
