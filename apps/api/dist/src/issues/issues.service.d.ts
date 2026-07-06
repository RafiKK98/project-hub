import { IssueDto, IssueFilters } from '@projecthub/types';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateIssueDto, ReorderIssueDto, UpdateIssueDto } from './dto';
export declare class IssuesService {
    private readonly prisma;
    private readonly notificationsService;
    constructor(prisma: PrismaService, notificationsService: NotificationsService);
    create(orgId: string, projectId: string, userId: string, dto: CreateIssueDto): Promise<IssueDto>;
    findAllForProject(orgId: string, projectId: string, userId: string, filters?: IssueFilters): Promise<IssueDto[]>;
    findByNumber(orgId: string, projectId: string, number: number, userId: string): Promise<IssueDto>;
    update(orgId: string, projectId: string, number: number, userId: string, dto: UpdateIssueDto): Promise<IssueDto>;
    reorder(orgId: string, projectId: string, number: number, userId: string, dto: ReorderIssueDto): Promise<IssueDto>;
    delete(orgId: string, projectId: string, number: number, userId: string): Promise<void>;
    private assertProjectAccess;
    private assertProjectMember;
    private toIssueDto;
}
//# sourceMappingURL=issues.service.d.ts.map