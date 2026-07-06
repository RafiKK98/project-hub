import { HealthCheckResult } from '@projecthub/types';
import { HealthService } from './health.service';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    check(): Promise<HealthCheckResult>;
}
//# sourceMappingURL=health.controller.d.ts.map