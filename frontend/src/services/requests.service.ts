import apiClient from "@/lib/axios";
import { MarketingRequestDetail, MarketingRequestList, PaginatedResponse, RequestFormValues } from "@/types";
import { buildQueryString } from "@/lib/utils";

export interface RequestFilters {
  page?: number;
  page_size?: number;
  status?: string | string[];
  priority?: string | string[];
  category?: number;
  company?: number;
  branch?: number;
  search?: string;
  ordering?: string;
}

export const requestsService = {
  async list(filters: RequestFilters = {}): Promise<PaginatedResponse<MarketingRequestList>> {
    const qs = buildQueryString(filters);
    const { data } = await apiClient.get<PaginatedResponse<MarketingRequestList>>(`/requests/?${qs}`);
    return data;
  },

  async get(id: string): Promise<MarketingRequestDetail> {
    const { data } = await apiClient.get<MarketingRequestDetail>(`/requests/${id}/`);
    return data;
  },

  async create(payload: RequestFormValues): Promise<MarketingRequestDetail> {
    const { data } = await apiClient.post<MarketingRequestDetail>("/requests/", payload);
    return data;
  },

  async update(id: string, payload: Partial<RequestFormValues>): Promise<MarketingRequestDetail> {
    const { data } = await apiClient.patch<MarketingRequestDetail>(`/requests/${id}/`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/requests/${id}/`);
  },

  async transition(id: string, status: string, reason?: string): Promise<MarketingRequestDetail> {
    const { data } = await apiClient.post<MarketingRequestDetail>(`/requests/${id}/transition/`, {
      status,
      reason: reason || "",
    });
    return data;
  },

  async uploadFiles(id: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    await apiClient.post(`/requests/${id}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async addComment(requestId: string, message: string): Promise<void> {
    await apiClient.post(`/requests/${requestId}/comments/`, { message, request: requestId });
  },

  async getComments(requestId: string) {
    const { data } = await apiClient.get(`/requests/${requestId}/comments/`);
    return data;
  },
};
