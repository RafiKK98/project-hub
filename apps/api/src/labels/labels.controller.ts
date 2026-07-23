import type { JwtPayload } from '@/auth/token.service';
import { CurrentUser } from '@/common';
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
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LabelDto } from '@projecthub/types';
import { CreateLabelDto, SetIssueLabelsDto, UpdateLabelDto } from './dto';
import { LabelsService } from './labels.service';

@ApiTags('Labels')
@ApiBearerAuth()
@Controller('organizations/:orgId/projects/:projectId')
export class LabelsController {
  constructor(private readonly labelsService: LabelsService) {}

  // ── Project labels ────────────────────────────────────────────────────────

  @Get('labels')
  @ApiOperation({ summary: 'List all labels in a project' })
  findAll(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<LabelDto[]> {
    return this.labelsService.findAllForProject(orgId, projectId, user.sub);
  }

  @Post('labels')
  @ApiOperation({ summary: 'Create a label in a project' })
  create(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateLabelDto,
  ): Promise<LabelDto> {
    return this.labelsService.create(orgId, projectId, user.sub, dto);
  }

  @Patch('labels/:labelId')
  @ApiOperation({ summary: 'Update a label' })
  update(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLabelDto,
  ): Promise<LabelDto> {
    return this.labelsService.update(orgId, projectId, labelId, user.sub, dto);
  }

  @Delete('labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a label' })
  delete(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('labelId') labelId: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    return this.labelsService.delete(orgId, projectId, labelId, user.sub);
  }

  // ── Issue labels ──────────────────────────────────────────────────────────

  @Get('issues/:number/labels')
  @ApiOperation({ summary: 'Get labels on an issue' })
  getIssueLabels(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<LabelDto[]> {
    return this.labelsService.getIssueLabels(
      orgId,
      projectId,
      number,
      user.sub,
    );
  }

  @Put('issues/:number/labels')
  @ApiOperation({ summary: 'Set labels on an issue (replaces all existing)' })
  setIssueLabels(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SetIssueLabelsDto,
  ): Promise<LabelDto[]> {
    return this.labelsService.setIssueLabels(
      orgId,
      projectId,
      number,
      user.sub,
      dto,
    );
  }
}
