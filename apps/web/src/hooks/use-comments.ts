"use client";

import { ApiClientError } from "@/lib/api-client";
import { commentsApi } from "@/lib/comments-api";
import { CreateCommentPayload, UpdateCommentPayload } from "@projecthub/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const commentKeys = {
  all: (orgId: string, projectId: string, issueNumber: number) =>
    ["comments", orgId, projectId, issueNumber] as const,
};

export function useComments(
  orgId: string,
  projectId: string,
  issueNumber: number,
) {
  return useQuery({
    queryKey: commentKeys.all(orgId, projectId, issueNumber),
    queryFn: () => commentsApi.list(orgId, projectId, issueNumber),
    enabled: Boolean(orgId && projectId && issueNumber),
  });
}

export function useCreateComment(
  orgId: string,
  projectId: string,
  issueNumber: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCommentPayload) =>
      commentsApi.create(orgId, projectId, issueNumber, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: commentKeys.all(orgId, projectId, issueNumber),
      }),
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to post comment";
      toast.error(message);
    },
  });
}

export function useUpdateComment(
  orgId: string,
  projectId: string,
  issueNumber: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateCommentPayload;
    }) => commentsApi.update(orgId, projectId, issueNumber, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.all(orgId, projectId, issueNumber),
      });
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update comment";
      toast.error(message);
    },
  });
}

export function useDeleteComment(
  orgId: string,
  projectId: string,
  issueNumber: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: string) =>
      commentsApi.delete(orgId, projectId, issueNumber, commentId),
    onMutate: async (commentId) => {
      await queryClient.cancelQueries({
        queryKey: commentKeys.all(orgId, projectId, issueNumber),
      });
      const previous = queryClient.getQueryData(
        commentKeys.all(orgId, projectId, issueNumber),
      );
      queryClient.setQueryData(
        commentKeys.all(orgId, projectId, issueNumber),
        (old: typeof previous) =>
          Array.isArray(old)
            ? old.filter((c: { id: string }) => c.id !== commentId)
            : old,
      );
      return { previous };
    },
    onError: (_err, _commentId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          commentKeys.all(orgId, projectId, issueNumber),
          context.previous,
        );
      }
      toast.error("Failed to delete comment");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.all(orgId, projectId, issueNumber),
      });
    },
  });
}
