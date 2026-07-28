import { activityApi } from "@/lib/activity-api";
import { useQuery } from "@tanstack/react-query";

export const activityKeys = {
  all: (orgId: string, projectId: string, issueNumber: number) =>
    ["activity", orgId, projectId, issueNumber] as const,
};

export const useActivity = (
  orgId: string,
  projectId: string,
  issueNumber: number,
) =>
  useQuery({
    queryKey: activityKeys.all(orgId, projectId, issueNumber),
    queryFn: () => activityApi.list(orgId, projectId, issueNumber),
    enabled: Boolean(orgId && projectId && issueNumber),
  });
