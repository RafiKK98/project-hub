import type { ActivityDto } from "@projecthub/types";
import { apiClient } from "./api-client";

export const activityApi = {
  list: (orgId: string, projectId: string, issueNumber: number) =>
    apiClient.get<ActivityDto[]>(
      `/organizations/${orgId}/projects/${projectId}/issues/${issueNumber}/activity`,
    ),
};
