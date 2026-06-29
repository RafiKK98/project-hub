import {
  CreateOrganizationPayload,
  InvitationDto,
  InviteMemberPayload,
  MembershipDto,
  OrganizationDto,
  UpdateMemberRolePayload,
  UpdateOrganizationPayload,
} from "@projecthub/types";
import { apiClient } from "./api-client";

export const orgsApi = {
  // Orgs
  list: (): Promise<OrganizationDto[]> =>
    apiClient.get<OrganizationDto[]>("/organizations"),

  get: (slug: string): Promise<OrganizationDto> =>
    apiClient.get<OrganizationDto>(`/organizations/${slug}`),

  create: (payload: CreateOrganizationPayload): Promise<OrganizationDto> =>
    apiClient.post<OrganizationDto>("/organizations", payload),

  update: (
    id: string,
    payload: UpdateOrganizationPayload,
  ): Promise<OrganizationDto> =>
    apiClient.patch<OrganizationDto>(`/organizations/${id}`, payload),

  delete: (id: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${id}`),

  // Members
  getMembers: (id: string): Promise<MembershipDto[]> =>
    apiClient.get<MembershipDto[]>(`/organizations/${id}/members`),

  updateMemberRole: (
    id: string,
    userId: string,
    payload: UpdateMemberRolePayload,
  ): Promise<MembershipDto> =>
    apiClient.patch<MembershipDto>(
      `/organizations/${id}/members/${userId}`,
      payload,
    ),

  removeMember: (id: string, userId: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${id}/members/${userId}`),

  // Invitations
  getInvitations: (id: string): Promise<InvitationDto[]> =>
    apiClient.get<InvitationDto[]>(`/organizations/${id}/invitations`),

  invite: (id: string, payload: InviteMemberPayload): Promise<InvitationDto> =>
    apiClient.post<InvitationDto>(`/organizations/${id}/invitations`, payload),

  cancelInvitation: (id: string, invitationId: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${id}/invitations/${invitationId}`),
};
