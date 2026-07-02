export type NotificationType =
  | "ISSUE_ASSIGNED"
  | "ISSUE_STATUS_CHANGED"
  | "COMMENT_ADDED"
  | "MEMBER_INVITED"
  | "MEMBER_JOINED";

// ── Typed payloads ────────────────────────────────────────────────────────────

export interface IssueAssignedPayload {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  projectId: string;
  orgSlug: string;
  projectIdentifier: string;
}

export interface IssueStatusChangedPayload {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  oldStatus: string;
  newStatus: string;
  projectId: string;
  orgSlug: string;
  projectIdentifier: string;
}

export interface CommentAddedPayload {
  issueId: string;
  issueKey: string;
  issueTitle: string;
  commentId: string;
  commentSnippet: string;
  projectId: string;
  orgSlug: string;
  projectIdentifier: string;
  issueNumber: number;
}

export interface MemberInvitedPayload {
  invitationId: string;
  organizationId: string;
  organizationName: string;
  orgSlug: string;
  invitedByName: string;
}

export interface MemberJoinedPayload {
  organizationId: string;
  organizationName: string;
  orgSlug: string;
  memberName: string;
}

export type NotificationPayload =
  | IssueAssignedPayload
  | IssueStatusChangedPayload
  | CommentAddedPayload
  | MemberInvitedPayload
  | MemberJoinedPayload;

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: NotificationPayload;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationCountDto {
  unread: number;
}
