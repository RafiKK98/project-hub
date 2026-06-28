import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckResult } from '@projecthub/types';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and database health' })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}
