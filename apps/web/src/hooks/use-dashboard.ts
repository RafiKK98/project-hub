"use client";

import { dashboardApi } from "@/lib/dashboard-api";
import { useQuery } from "@tanstack/react-query";

export const dashboardKeys = {
  all: ["dashboard"] as const,
};

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.all,
    queryFn: dashboardApi.get,
    staleTime: 60 * 1000, // 1 min — dashboard data doesn't need to be real-time
  });
}
