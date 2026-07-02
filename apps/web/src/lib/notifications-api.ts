import { NotificationCountDto, NotificationDto } from "@projecthub/types";
import { apiClient } from "./api-client";

export const notificationsApi = {
  list: (includeRead = false): Promise<NotificationDto[]> =>
    apiClient.get<NotificationDto[]>(
      `/notifications${includeRead ? "?includeRead=true" : ""}`,
    ),

  unreadCount: (): Promise<NotificationCountDto> =>
    apiClient.get<NotificationCountDto>(`/notifications/unread-count`),

  markAsRead: (id: string): Promise<NotificationDto> =>
    apiClient.patch<NotificationDto>(`/notifications/${id}/read`),

  markAllAsRead: (): Promise<void> =>
    apiClient.patch<void>(`/notifications/read-all`),
};
