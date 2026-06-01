import apiClient from "@/lib/axios";
import { Notification, PaginatedResponse } from "@/types";

export const notificationsService = {
  async list(is_read?: boolean): Promise<PaginatedResponse<Notification>> {
    const qs = is_read !== undefined ? `?is_read=${is_read}` : "";
    const { data } = await apiClient.get<PaginatedResponse<Notification>>(`/notifications/${qs}`);
    return data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const { data } = await apiClient.get<{ count: number }>("/notifications/unread_count/");
    return data;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/mark_read/`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.post("/notifications/mark_all_read/");
  },
};
