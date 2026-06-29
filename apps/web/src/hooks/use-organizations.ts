import { ApiClientError } from "@/lib/api-client";
import { orgsApi } from "@/lib/orgs-api";
import {
  CreateOrganizationPayload,
  InviteMemberPayload,
  UpdateMemberRolePayload,
  UpdateOrganizationPayload,
} from "@projecthub/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const orgKeys = {
  all: ["organizations"] as const,
  lists: () => [...orgKeys.all, "list"] as const,
  detail: (slug: string) => [...orgKeys.all, "detail", slug] as const,
  members: (id: string) => [...orgKeys.all, id, "members"] as const,
  invitations: (id: string) => [...orgKeys.all, id, "invitations"] as const,
};

export function useOrganizations() {
  return useQuery({
    queryKey: orgKeys.lists(),
    queryFn: orgsApi.list,
  });
}

export function useOrganization(slug: string) {
  return useQuery({
    queryKey: orgKeys.detail(slug),
    queryFn: () => orgsApi.get(slug),
    enabled: Boolean(slug),
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) => orgsApi.create(payload),
    onSuccess: (org) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      toast.success(`"${org.name}" created successfully`);
      router.push(`/orgs/${org.slug}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to create organization";
      toast.error(message);
    },
  });
}

export function useUpdateOrganization(id: string, slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrganizationPayload) =>
      orgsApi.update(id, payload),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(slug) });
      toast.success("Organization updated");
      return updated;
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to update organization";
      toast.error(message);
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => orgsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
      toast.success("Organization deleted");
      router.push("/orgs");
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to delete organization";
      toast.error(message);
    },
  });
}

export function useOrgMembers(id: string) {
  return useQuery({
    queryKey: orgKeys.members(id),
    queryFn: () => orgsApi.getMembers(id),
    enabled: Boolean(id),
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => orgsApi.removeMember(orgId, userId),
    onMutate: async (userId) => {
      await queryClient.cancelQueries({ queryKey: orgKeys.members(orgId) });
      const previous = queryClient.getQueryData(orgKeys.members(orgId));
      queryClient.setQueryData(
        orgKeys.members(orgId),
        (old: typeof previous) =>
          Array.isArray(old)
            ? old.filter((m: { user: { id: string } }) => m.user.id !== userId)
            : old,
      );
      return { previous };
    },
    onError: (_err, _userId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orgKeys.members(orgId), context.previous);
      }
      toast.error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
      toast.success("Member removed");
    },
  });
}

export function useUpdateMemberRole(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: UpdateMemberRolePayload;
    }) => orgsApi.updateMemberRole(orgId, userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.members(orgId) });
      toast.success("Member role updated");
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

export function useOrgInvitations(id: string) {
  return useQuery({
    queryKey: orgKeys.invitations(id),
    queryFn: () => orgsApi.getInvitations(id),
    enabled: Boolean(id),
  });
}

export function useInviteMember(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberPayload) =>
      orgsApi.invite(orgId, payload),
    onSuccess: (inv) => {
      queryClient.invalidateQueries({ queryKey: orgKeys.invitations(orgId) });
      toast.success(`Invitation sent to ${inv.email}`);
    },
    onError: (error) => {
      const message =
        error instanceof ApiClientError
          ? error.body.message
          : "Failed to send invitation";
      toast.error(message);
    },
  });
}

export function useCancelInvitation(orgId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      orgsApi.cancelInvitation(orgId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgKeys.invitations(orgId) });
      toast.success("Invitation cancelled");
    },
    onError: () => toast.error("Failed to cancel invitation"),
  });
}
