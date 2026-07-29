"use client";

import { ApiClientError } from "@/lib/api-client";
import { issuesApi } from "@/lib/issues-api";
import type {
  CreateIssuePayload,
  IssueDto,
  IssueFilters,
  ReorderIssuePayload,
  UpdateIssuePayload,
} from "@projecthub/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const issueKeys = {
  all: (orgId: string, projectId: string) =>
    ["issues", orgId, projectId] as const,
  lists: (orgId: string, projectId: string, filters?: IssueFilters) =>
    [...issueKeys.all(orgId, projectId), "list", filters] as const,
  detail: (orgId: string, projectId: string, number: number) =>
    [...issueKeys.all(orgId, projectId), "detail", number] as const,
};

export function useIssues(
  orgId: string,
  projectId: string,
  filters?: IssueFilters,
) {
  return useQuery({
    queryKey: issueKeys.lists(orgId, projectId, filters),
    queryFn: () => issuesApi.list(orgId, projectId, filters),
    enabled: Boolean(orgId && projectId),
  });
}

export function useIssue(orgId: string, projectId: string, number: number) {
  return useQuery({
    queryKey: issueKeys.detail(orgId, projectId, number),
    queryFn: () => issuesApi.get(orgId, projectId, number),
    enabled: Boolean(orgId && projectId && number),
  });
}

export function useCreateIssue(
  orgId: string,
  projectId: string,
  orgSlug: string,
  projectIdentifier: string,
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateIssuePayload) =>
      issuesApi.create(orgId, projectId, payload),
    onSuccess: (issue) => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
      toast.success(`${issue.key} created`);
      router.push(
        `/orgs/${orgSlug}/projects/${projectIdentifier}/issues/${issue.number}`,
      );
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to create issue";
      toast.error(message);
    },
  });
}

export function useUpdateIssue(
  orgId: string,
  projectId: string,
  number: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateIssuePayload) =>
      issuesApi.update(orgId, projectId, number, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: issueKeys.detail(orgId, projectId, number),
      });
      const previous = queryClient.getQueryData(
        issueKeys.detail(orgId, projectId, number),
      );

      queryClient.setQueryData(
        issueKeys.detail(orgId, projectId, number),
        (old: IssueDto | undefined) => {
          if (!old) return old;

          // When assigneeId changes, resolve the full assignee object from the
          // project members cache so the UI updates without waiting for the server.
          let optimisticAssignee = old.assignee;
          if ("assigneeId" in payload) {
            if (!payload.assigneeId) optimisticAssignee = null;
            else if (payload.assigneeId !== old.assignee?.id) {
              const allCacheEntries = queryClient.getQueriesData<
                { user: IssueDto["assignee"] }[]
              >({
                queryKey: ["projects", orgId, projectId, "members"],
              });
              for (const [, data] of allCacheEntries) {
                if (!Array.isArray(data)) continue;
                const found = data.find(
                  (m) => m.user?.id === payload.assigneeId,
                );
                if (found?.user) {
                  optimisticAssignee = found.user;
                  break;
                }
              }
            }
          }

          return { ...old, ...payload, assignee: optimisticAssignee };
        },
      );

      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          issueKeys.detail(orgId, projectId, number),
          context.previous,
        );
      toast.error("Failed to update issue");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      }),
  });
}

export function useReorderIssue(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      number,
      payload,
    }: {
      number: number;
      payload: ReorderIssuePayload;
    }) => issuesApi.reorder(orgId, projectId, number, payload),
    onMutate: async ({ number, payload }) => {
      await queryClient.cancelQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
      const listKey = issueKeys.lists(orgId, projectId, undefined);
      const previous = queryClient.getQueryData(listKey);
      queryClient.setQueryData(listKey, (old: IssueDto[] | undefined) =>
        old
          ? old
              .map((i) =>
                i.number === number
                  ? {
                      ...i,
                      boardOrder: payload.boardOrder,
                      ...(payload.status && { status: payload.status }),
                    }
                  : i,
              )
              .sort((a, b) => a.boardOrder - b.boardOrder)
          : old,
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        queryClient.setQueryData(
          issueKeys.lists(orgId, projectId, undefined),
          context.previous,
        );
      toast.error("Failed to reorder issue");
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      }),
  });
}

/**
 * Links or unlinks a subtask relationship. Used both by the parent's
 * checklist ("remove this subtask") and the child's own detail page
 * ("remove from parent") — both just call this with a different `number`.
 */
export function useSetParent(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      number,
      parentId,
    }: {
      number: number;
      parentId: string | null;
    }) => issuesApi.setParent(orgId, projectId, number, { parentId }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      }),
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update subtask relationship";
      toast.error(message);
    },
  });
}

export function useDeleteIssue(
  orgId: string,
  projectId: string,
  orgSlug: string,
  projectIdentifier: string,
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (number: number) => issuesApi.delete(orgId, projectId, number),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
      toast.success("Issue deleted");
      router.push(`/orgs/${orgSlug}/projects/${projectIdentifier}`);
    },
    onError: () => toast.error("Failed to delete issue"),
  });
}
