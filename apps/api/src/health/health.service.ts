import { Injectable, Logger } from '@nestjs/common';
import { HealthCheckResult, HealthStatus } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    const databaseStatus = await this.checkDatabase();

    const overallStatus: HealthStatus =
      databaseStatus === 'ok' ? 'ok' : 'degraded';

    return {
      status: overallStatus,
      version: process.env['npm_package_version'] ?? '0.0.1',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
      services: {
        database: databaseStatus,
      },
    };
  }

  private async checkDatabase(): Promise<HealthStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return 'down';
    }
  }
}
