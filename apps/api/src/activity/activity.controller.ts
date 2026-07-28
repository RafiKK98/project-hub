import type { JwtPayload } from '@/auth/token.service';
import { CurrentUser } from '@/common';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ActivityDto } from '@projecthub/types';
import { ActivityService } from './activity.service';

@ApiTags('Activity')
@ApiBearerAuth()
@Controller('organizations/:orgId/projects/:projectId/issues/:number/activity')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  @ApiOperation({ summary: 'Get the activity timeline for an issue' })
  findAll(
    @Param('orgId') orgId: string,
    @Param('projectId') projectId: string,
    @Param('number', ParseIntPipe) number: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<ActivityDto[]> {
    return this.activityService.findAllForIssue(
      orgId,
      projectId,
      number,
      user.sub,
    );
  }
}
