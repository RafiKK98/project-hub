import type { IssueDto, IssuePriority, IssueStatus } from '@projecthub/types';
import type { JwtPayload } from '../auth/token.service';
import { CreateIssueDto, ReorderIssueDto, UpdateIssueDto } from './dto';
import { IssuesService } from './issues.service';
export declare class IssuesController {
    private readonly issuesService;
    constructor(issuesService: IssuesService);
    create(orgId: string, projectId: string, user: JwtPayload, dto: CreateIssueDto): Promise<IssueDto>;
    findAll(orgId: string, projectId: string, user: JwtPayload, status?: IssueStatus | IssueStatus[], priority?: IssuePriority | IssuePriority[], assigneeId?: string): Promise<IssueDto[]>;
    findOne(orgId: string, projectId: string, number: number, user: JwtPayload): Promise<IssueDto>;
    update(orgId: string, projectId: string, number: number, user: JwtPayload, dto: UpdateIssueDto): Promise<IssueDto>;
    reorder(orgId: string, projectId: string, number: number, user: JwtPayload, dto: ReorderIssueDto): Promise<IssueDto>;
    delete(orgId: string, projectId: string, number: number, user: JwtPayload): Promise<void>;
}
//# sourceMappingURL=issues.controller.d.ts.map