import { HealthCheckResult } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
export declare class HealthService {
    private readonly prisma;
    private readonly logger;
    private readonly startTime;
    constructor(prisma: PrismaService);
    check(): Promise<HealthCheckResult>;
    private checkDatabase;
}
//# sourceMappingURL=health.service.d.ts.map