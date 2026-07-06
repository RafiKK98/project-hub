import { DashboardDto } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(user: JwtPayload): Promise<DashboardDto>;
}
//# sourceMappingURL=dashboard.controller.d.ts.map