"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "@/services/notifications.service";

export const notifKeys = {
  all: ["notifications"] as const,
  list: (is_read?: boolean) => ["notifications", "list", is_read] as const,
  count: ["notifications", "count"] as const,
};

export function useNotifications(is_read?: boolean) {
  return useQuery({
    queryKey: notifKeys.list(is_read),
    queryFn: () => notificationsService.list(is_read),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notifKeys.count,
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 30000,
  });
}

export function useMarkRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.all });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notifKeys.all });
    },
  });
}
