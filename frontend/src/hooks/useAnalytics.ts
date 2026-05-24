"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: analyticsService.getDashboardStats,
    staleTime: 60 * 1000,
  });
}

export function useRequestsByStatus() {
  return useQuery({
    queryKey: ["analytics", "by-status"],
    queryFn: analyticsService.getRequestsByStatus,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRequestsByCategory() {
  return useQuery({
    queryKey: ["analytics", "by-category"],
    queryFn: analyticsService.getRequestsByCategory,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMonthlyRequests() {
  return useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: analyticsService.getMonthlyRequests,
    staleTime: 5 * 60 * 1000,
  });
}
