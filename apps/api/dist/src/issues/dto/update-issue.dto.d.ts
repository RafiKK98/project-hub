import { IssuePriority, IssueStatus } from '@prisma/client';
export declare class UpdateIssueDto {
    title?: string;
    description?: string;
    status?: IssueStatus;
    priority?: IssuePriority;
    assigneeId?: string | null;
    dueDate?: string | null;
}
//# sourceMappingURL=update-issue.dto.d.ts.map