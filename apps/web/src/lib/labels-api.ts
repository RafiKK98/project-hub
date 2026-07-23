import { apiClient } from "@/lib/api-client";
import {
  CreateLabelPayload,
  LabelDto,
  UpdateLabelPayload,
} from "@projecthub/types";

export const labelsApi = {
  list: (orgId: string, projectId: string): Promise<LabelDto[]> =>
    apiClient.get<LabelDto[]>(
      `/organizations/${orgId}/projects/${projectId}/labels`,
    ),

  create: (
    orgId: string,
    projectId: string,
    payload: CreateLabelPayload,
  ): Promise<LabelDto> =>
    apiClient.post<LabelDto>(
      `/organizations/${orgId}/projects/${projectId}/labels`,
      payload,
    ),

  update: (
    orgId: string,
    projectId: string,
    labelId: string,
    payload: UpdateLabelPayload,
  ): Promise<LabelDto> =>
    apiClient.patch<LabelDto>(
      `/organizations/${orgId}/projects/${projectId}/labels/${labelId}`,
      payload,
    ),

  delete: (orgId: string, projectId: string, labelId: string): Promise<void> =>
    apiClient.delete<void>(
      `/organizations/${orgId}/projects/${projectId}/labels/${labelId}`,
    ),

  getIssueLabels: (
    orgId: string,
    projectId: string,
    issueNumber: number,
  ): Promise<LabelDto[]> =>
    apiClient.get<LabelDto[]>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/labels`,
    ),

  setIssueLabels: (
    orgId: string,
    projectId: string,
    issueNumber: number,
    labelIds: string[],
  ): Promise<LabelDto[]> =>
    apiClient.put<LabelDto[]>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/labels`,
      { labelIds },
    ),
};
