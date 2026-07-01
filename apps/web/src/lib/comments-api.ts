import {
  CommentDto,
  CreateCommentPayload,
  UpdateCommentPayload,
} from "@projecthub/types";
import { apiClient } from "./api-client";

export const commentsApi = {
  list: (
    orgId: string,
    projectId: string,
    issueNumber: number,
  ): Promise<CommentDto[]> =>
    apiClient.get<CommentDto[]>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/comments`,
    ),

  create: (
    orgId: string,
    projectId: string,
    issueNumber: number,
    payload: CreateCommentPayload,
  ): Promise<CommentDto> =>
    apiClient.post<CommentDto>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/comments`,
      payload,
    ),

  update: (
    orgId: string,
    projectId: string,
    issueNumber: number,
    commentId: string,
    payload: UpdateCommentPayload,
  ): Promise<CommentDto> =>
    apiClient.patch<CommentDto>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/comments/${commentId}`,
      payload,
    ),

  delete: (
    orgId: string,
    projectId: string,
    issueNumber: number,
    commentId: string,
  ): Promise<void> =>
    apiClient.delete<void>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/comments/${commentId}`,
    ),
};
