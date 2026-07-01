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
        (old: typeof previous) => (old ? { ...old, ...payload } : old),
      );
      return { previous };
    },
    onError: (_err, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          issueKeys.detail(orgId, projectId, number),
          context.previous,
        );
      }
      toast.error("Failed to update issue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
    },
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
      if (context?.previous) {
        queryClient.setQueryData(
          issueKeys.lists(orgId, projectId, undefined),
          context.previous,
        );
      }
      toast.error("Failed to reorder issue");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: issueKeys.all(orgId, projectId),
      });
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
