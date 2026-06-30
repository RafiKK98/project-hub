import {
  CreateIssuePayload,
  IssueDto,
  IssueFilters,
  UpdateIssuePayload,
} from "@projecthub/types";
import { apiClient } from "./api-client";

function buildQuery(filters?: IssueFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  filters.status?.forEach((s) => params.append("status", s));
  filters.priority?.forEach((p) => params.append("priority", p));
  if (filters.assigneeId) params.set("assigneeId", filters.assigneeId);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const issuesApi = {
  list: (
    orgId: string,
    projectId: string,
    filters?: IssueFilters,
  ): Promise<IssueDto[]> =>
    apiClient.get<IssueDto[]>(
      `/organizations/${orgId}/projects/${projectId}/issues${buildQuery(filters)}`,
    ),

  get: (orgId: string, projectId: string, number: number): Promise<IssueDto> =>
    apiClient.get<IssueDto>(
      `/organizations/${orgId}/projects/${projectId}/issues/${number}`,
    ),

  create: (
    orgId: string,
    projectId: string,
    payload: CreateIssuePayload,
  ): Promise<IssueDto> =>
    apiClient.post<IssueDto>(
      `/organizations/${orgId}/projects/${projectId}/issues`,
      payload,
    ),

  update: (
    orgId: string,
    projectId: string,
    number: number,
    payload: UpdateIssuePayload,
  ): Promise<IssueDto> =>
    apiClient.patch<IssueDto>(
      `/organizations/${orgId}/projects/${projectId}/issues/${number}`,
      payload,
    ),

  delete: (orgId: string, projectId: string, number: number): Promise<void> =>
    apiClient.delete<void>(
      `/organizations/${orgId}/projects/${projectId}/issues/${number}`,
    ),
};
