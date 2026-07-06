import { DashboardDto } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getDashboard(userId: string): Promise<DashboardDto>;
    private getAccessibleProjectIds;
    private getAssignedToMe;
    private getRecentlyUpdated;
    private getProjectBreakdowns;
    private toIssueDto;
}
//# sourceMappingURL=dashboard.service.d.ts.map