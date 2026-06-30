export interface CommentDto {
  id: string;
  body: string;
  issueId: string;
  authorId: string;
  editedAt: string | null;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  canEdit: boolean;
  canDelete: boolean;
}

export interface CreateCommentPayload {
  body: string;
}

export interface UpdateCommentPayload {
  body: string;
}
