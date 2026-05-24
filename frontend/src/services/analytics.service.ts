import apiClient from "@/lib/axios";
import { DashboardStats } from "@/types";

export const analyticsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await apiClient.get<DashboardStats>("/analytics/dashboard/");
    return data;
  },

  async getRequestsByStatus(): Promise<{ status: string; count: number }[]> {
    const { data } = await apiClient.get("/analytics/requests/by-status/");
    return data;
  },

  async getRequestsByCategory(): Promise<{ category__name: string; count: number }[]> {
    const { data } = await apiClient.get("/analytics/requests/by-category/");
    return data;
  },

  async getRequestsByBranch(): Promise<{ branch__name: string; branch__company__name: string; count: number }[]> {
    const { data } = await apiClient.get("/analytics/requests/by-branch/");
    return data;
  },

  async getMonthlyRequests(): Promise<{ month: string; count: number }[]> {
    const { data } = await apiClient.get("/analytics/requests/monthly/");
    return data;
  },
};
