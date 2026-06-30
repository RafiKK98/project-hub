export type IssueStatus =
  "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type IssuePriority =
  "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IssueDto {
  id: string;
  number: number;
  key: string; // e.g. "WEB-1" — projectIdentifier + number
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  projectId: string;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  assignee: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
}

// ── Request payloads ─────────────────────────────────────────────────────────

export interface CreateIssuePayload {
  title: string;
  description?: string;
  priority?: IssuePriority;
  assigneeId?: string;
  dueDate?: string;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string;
}
