"use client";

import { notificationsApi } from "@/lib/notifications-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (includeRead: boolean) =>
    [...notificationKeys.all, "list", includeRead] as const,
  count: () => [...notificationKeys.all, "count"] as const,
};

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.count(),
    queryFn: notificationsApi.unreadCount,
    refetchInterval: 30_000, // poll every 30s
    refetchIntervalInBackground: false, // pause when tab hidden
  });
}

export function useNotifications(includeRead = false) {
  return useQuery({
    queryKey: notificationKeys.list(includeRead),
    queryFn: () => notificationsApi.list(includeRead),
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}
