"use client";

import { ApiClientError } from "@/lib/api-client";
import { labelsApi } from "@/lib/labels-api";
import { CreateLabelPayload, UpdateLabelPayload } from "@projecthub/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const labelKeys = {
  all: (orgId: string, projectId: string) =>
    ["labels", orgId, projectId] as const,
  lists: (orgId: string, projectId: string) =>
    [...labelKeys.all(orgId, projectId), "list"] as const,
  issueLabels: (orgId: string, projectId: string, issueNumber: number) =>
    [...labelKeys.all(orgId, projectId), "issue", issueNumber] as const,
};

export function useLabels(orgId: string, projectId: string) {
  return useQuery({
    queryKey: labelKeys.lists(orgId, projectId),
    queryFn: () => labelsApi.list(orgId, projectId),
    enabled: Boolean(orgId && projectId),
  });
}

export function useCreateLabel(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLabelPayload) =>
      labelsApi.create(orgId, projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.lists(orgId, projectId),
      });
      toast.success("Label created");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to create label";
      toast.error(message);
    },
  });
}

export function useUpdateLabel(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      labelId,
      payload,
    }: {
      labelId: string;
      payload: UpdateLabelPayload;
    }) => labelsApi.update(orgId, projectId, labelId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.lists(orgId, projectId),
      });
      toast.success("Label updated");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update label";
      toast.error(message);
    },
  });
}

export function useDeleteLabel(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelId: string) =>
      labelsApi.delete(orgId, projectId, labelId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: labelKeys.lists(orgId, projectId),
      });
      toast.success("Label deleted");
    },
    onError: () => toast.error("Failed to delete label"),
  });
}

export function useSetIssueLabels(
  orgId: string,
  projectId: string,
  issueNumber: number,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) =>
      labelsApi.setIssueLabels(orgId, projectId, issueNumber, labelIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues", orgId, projectId] });
    },
    onError: () => toast.error("Failed to update labels"),
  });
}
