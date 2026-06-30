import type {
  AddProjectMemberPayload,
  CreateProjectPayload,
  ProjectDto,
  ProjectMemberDto,
  UpdateProjectMemberRolePayload,
  UpdateProjectPayload,
} from "@projecthub/types";
import { apiClient } from "./api-client";

export const projectsApi = {
  list: (orgId: string): Promise<ProjectDto[]> =>
    apiClient.get<ProjectDto[]>(`/organizations/${orgId}/projects`),

  get: (orgId: string, projectId: string): Promise<ProjectDto> =>
    apiClient.get<ProjectDto>(`/organizations/${orgId}/projects/${projectId}`),

  create: (orgId: string, payload: CreateProjectPayload): Promise<ProjectDto> =>
    apiClient.post<ProjectDto>(`/organizations/${orgId}/projects`, payload),

  update: (
    orgId: string,
    projectId: string,
    payload: UpdateProjectPayload,
  ): Promise<ProjectDto> =>
    apiClient.patch<ProjectDto>(
      `/organizations/${orgId}/projects/${projectId}`,
      payload,
    ),

  delete: (orgId: string, projectId: string): Promise<void> =>
    apiClient.delete<void>(`/organizations/${orgId}/projects/${projectId}`),

  getMembers: (orgId: string, projectId: string): Promise<ProjectMemberDto[]> =>
    apiClient.get<ProjectMemberDto[]>(
      `/organizations/${orgId}/projects/${projectId}/members`,
    ),

  addMember: (
    orgId: string,
    projectId: string,
    payload: AddProjectMemberPayload,
  ): Promise<ProjectMemberDto> =>
    apiClient.post<ProjectMemberDto>(
      `/organizations/${orgId}/projects/${projectId}/members`,
      payload,
    ),

  updateMemberRole: (
    orgId: string,
    projectId: string,
    userId: string,
    payload: UpdateProjectMemberRolePayload,
  ): Promise<ProjectMemberDto> =>
    apiClient.patch<ProjectMemberDto>(
      `/organizations/${orgId}/projects/${projectId}/members/${userId}`,
      payload,
    ),

  removeMember: (
    orgId: string,
    projectId: string,
    userId: string,
  ): Promise<void> =>
    apiClient.delete<void>(
      `/organizations/${orgId}/projects/${projectId}/members/${userId}`,
    ),
};
