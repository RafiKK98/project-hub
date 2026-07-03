import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CurrentUser } from '../common';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get dashboard data for the current user' })
  getDashboard(@CurrentUser() user: JwtPayload): Promise<DashboardDto> {
    return this.dashboardService.getDashboard(user.sub);
  }
}
