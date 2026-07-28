export type ActivityType =
  | "ISSUE_CREATED"
  | "TITLE_CHANGED"
  | "DESCRIPTION_CHANGED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNEE_CHANGED"
  | "DUE_DATE_CHANGED"
  | "LABELS_CHANGED";

export interface IssueCreatedPayload {
  title: string;
}

export interface TitleChangedPayload {
  oldTitle: string;
  newTitle: string;
}

export type DescriptionChangedPayload = Record<string, never>;

export interface StatusChangedPayload {
  oldStatus: string;
  newStatus: string;
}

export interface PriorityChangedPayload {
  oldPriority: string;
  newPriority: string;
}

export interface AssigneeChangedPayload {
  oldAssigneeName: string | null;
  newAssigneeName: string | null;
}

export interface DueDateChangedPayload {
  oldDueDate: string | null;
  newDueDate: string | null;
}

export interface LabelsChangedPayload {
  added: { name: string; color: string }[];
  removed: { name: string; color: string }[];
}

export type ActivityPayload =
  | IssueCreatedPayload
  | TitleChangedPayload
  | DescriptionChangedPayload
  | StatusChangedPayload
  | PriorityChangedPayload
  | AssigneeChangedPayload
  | DueDateChangedPayload
  | LabelsChangedPayload;

export interface ActivityDto {
  id: string;
  type: ActivityType;
  payload: ActivityPayload;
  createdAt: string;
  actor: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
}
