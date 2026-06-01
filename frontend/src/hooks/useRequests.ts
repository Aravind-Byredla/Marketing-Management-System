"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestsService, RequestFilters } from "@/services/requests.service";
import { RequestFormValues } from "@/types";
import { toast } from "sonner";

export const requestKeys = {
  all: ["requests"] as const,
  list: (filters: RequestFilters) => ["requests", "list", filters] as const,
  detail: (id: string) => ["requests", "detail", id] as const,
};

export function useRequests(filters: RequestFilters = {}) {
  return useQuery({
    queryKey: requestKeys.list(filters),
    queryFn: () => requestsService.list(filters),
  });
}

export function useRequest(id: string) {
  return useQuery({
    queryKey: requestKeys.detail(id),
    queryFn: () => requestsService.get(id),
    enabled: !!id,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RequestFormValues) => requestsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      toast.success("Request submitted successfully.");
    },
    onError: () => toast.error("Failed to submit request."),
  });
}

export function useTransitionRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      requestsService.transition(id, status, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: requestKeys.all });
      toast.success(`Status updated to ${data.status}.`);
    },
    onError: () => toast.error("Status transition failed."),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, message }: { requestId: string; message: string }) =>
      requestsService.addComment(requestId, message),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.detail(requestId) });
    },
    onError: () => toast.error("Failed to add comment."),
  });
}
