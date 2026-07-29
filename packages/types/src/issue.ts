export type IssueStatus =
  "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type IssuePriority =
  "NO_PRIORITY" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

/** Lightweight issue reference used for parent/subtask relationships. */
export interface IssueSummary {
  id: string;
  number: number;
  key: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  } | null;
}

export interface SubtaskStats {
  total: number;
  done: number;
}

export interface IssueDto {
  id: string;
  number: number;
  key: string; // e.g. "WEB-1" — projectIdentifier + number
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  boardOrder: number;
  projectId: string;
  createdById: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  labels: IssueLabel[];
  parentId: string | null;
  parent: IssueSummary | null;
  subtasks: IssueSummary[];
  subtaskStats: SubtaskStats;
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
  /** Creates this issue directly as a subtask of the given parent issue ID. */
  parentId?: string;
}

export interface UpdateIssuePayload {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export interface ReorderIssuePayload {
  boardOrder: number;
  status?: IssueStatus;
}

export interface SetParentPayload {
  parentId: string | null;
}

export interface IssueFilters {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assigneeId?: string;
}
