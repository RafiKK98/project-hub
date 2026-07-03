import { DashboardDto } from "@projecthub/types";
import { apiClient } from "./api-client";

export const dashboardApi = {
  get: (): Promise<DashboardDto> => apiClient.get<DashboardDto>("/dashboard"),
};
