"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tasksService, TaskFilters } from "@/services/tasks.service";
import { toast } from "sonner";

export const taskKeys = {
  all: ["tasks"] as const,
  list: (filters: TaskFilters) => ["tasks", "list", filters] as const,
  detail: (id: string) => ["tasks", "detail", id] as const,
};

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: taskKeys.list(filters),
    queryFn: () => tasksService.list(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => tasksService.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tasksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task created and assigned.");
    },
    onError: () => toast.error("Failed to create task."),
  });
}

export function useUpdateTaskProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, progress_percentage, status }: { id: string; progress_percentage: number; status?: string }) =>
      tasksService.updateProgress(id, progress_percentage, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Progress updated.");
    },
    onError: () => toast.error("Failed to update progress."),
  });
}
