"use client";

import { ApiClientError } from "@/lib/api-client";
import { projectsApi } from "@/lib/projects-api";
import type {
  AddProjectMemberPayload,
  CreateProjectPayload,
  UpdateProjectMemberRolePayload,
  UpdateProjectPayload,
} from "@projecthub/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const projectKeys = {
  all: (orgId: string) => ["projects", orgId] as const,
  lists: (orgId: string) => [...projectKeys.all(orgId), "list"] as const,
  detail: (orgId: string, projectId: string) =>
    [...projectKeys.all(orgId), "detail", projectId] as const,
  members: (orgId: string, projectId: string) =>
    [...projectKeys.all(orgId), projectId, "members"] as const,
};

export function useProjects(orgId: string) {
  return useQuery({
    queryKey: projectKeys.lists(orgId),
    queryFn: () => projectsApi.list(orgId),
    enabled: Boolean(orgId),
  });
}

/**
 * Resolves a project by its identifier (e.g. "WEB") using the cached list.
 * Avoids a dedicated backend lookup-by-identifier endpoint for this milestone.
 */
export function useProjectByIdentifier(orgId: string, identifier: string) {
  const { data: projects, ...rest } = useProjects(orgId);
  const project = projects?.find(
    (p) => p.identifier === identifier.toUpperCase(),
  );
  return { data: project, ...rest };
}

export function useProject(orgId: string, projectId: string) {
  return useQuery({
    queryKey: projectKeys.detail(orgId, projectId),
    queryFn: () => projectsApi.get(orgId, projectId),
    enabled: Boolean(orgId && projectId),
  });
}

export function useCreateProject(orgId: string, orgSlug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateProjectPayload) =>
      projectsApi.create(orgId, payload),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(orgId) });
      toast.success(`"${project.name}" created`);
      router.push(`/orgs/${orgSlug}/projects/${project.identifier}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to create project";
      toast.error(message);
    },
  });
}

export function useUpdateProject(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProjectPayload) =>
      projectsApi.update(orgId, projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(orgId) });
      queryClient.invalidateQueries({
        queryKey: projectKeys.detail(orgId, projectId),
      });
      toast.success("Project updated");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update project";
      toast.error(message);
    },
  });
}

export function useDeleteProject(orgId: string, orgSlug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.delete(orgId, projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists(orgId) });
      toast.success("Project deleted");
      router.push(`/orgs/${orgSlug}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to delete project";
      toast.error(message);
    },
  });
}

export function useProjectMembers(orgId: string, projectId: string) {
  return useQuery({
    queryKey: projectKeys.members(orgId, projectId),
    queryFn: () => projectsApi.getMembers(orgId, projectId),
    enabled: Boolean(orgId && projectId),
  });
}

export function useAddProjectMember(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddProjectMemberPayload) =>
      projectsApi.addMember(orgId, projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(orgId, projectId),
      });
      toast.success("Member added to project");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to add member";
      toast.error(message);
    },
  });
}

export function useUpdateProjectMemberRole(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateProjectMemberRolePayload;
    }) => projectsApi.updateMemberRole(orgId, projectId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(orgId, projectId),
      });
      toast.success("Role updated");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update role";
      toast.error(message);
    },
  });
}

export function useRemoveProjectMember(orgId: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) =>
      projectsApi.removeMember(orgId, projectId, userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({
        queryKey: projectKeys.members(orgId, projectId),
      });
      const previous = queryClient.getQueryData(
        projectKeys.members(orgId, projectId),
      );
      queryClient.setQueryData(
        projectKeys.members(orgId, projectId),
        (old: typeof previous) =>
          Array.isArray(old)
            ? old.filter((m: { user: { id: string } }) => m.user.id !== userId)
            : old,
      );
      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          projectKeys.members(orgId, projectId),
          context.previous,
        );
      }
      toast.error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: projectKeys.members(orgId, projectId),
      });
      toast.success("Member removed");
    },
  });
}
