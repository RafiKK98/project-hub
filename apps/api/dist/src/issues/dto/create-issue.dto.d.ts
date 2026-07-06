import { IssuePriority } from '@prisma/client';
export declare class CreateIssueDto {
    title: string;
    description?: string;
    priority?: IssuePriority;
    assigneeId?: string;
    dueDate?: string;
}
//# sourceMappingURL=create-issue.dto.d.ts.map