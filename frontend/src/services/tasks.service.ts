import apiClient from "@/lib/axios";
import { PaginatedResponse, Task } from "@/types";
import { buildQueryString } from "@/lib/utils";

export interface TaskFilters {
  page?: number;
  page_size?: number;
  status?: string;
  assigned_to?: string;
  request?: string;
  search?: string;
}

export const tasksService = {
  async list(filters: TaskFilters = {}): Promise<PaginatedResponse<Task>> {
    const qs = buildQueryString(filters);
    const { data } = await apiClient.get<PaginatedResponse<Task>>(`/tasks/?${qs}`);
    return data;
  },

  async get(id: string): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/tasks/${id}/`);
    return data;
  },

  async create(payload: { request: string; assigned_to: string; title: string; description?: string; deadline?: string }): Promise<Task> {
    const { data } = await apiClient.post<Task>("/tasks/", payload);
    return data;
  },

  async updateProgress(id: string, progress_percentage: number, status?: string): Promise<Task> {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}/update_progress/`, { progress_percentage, status });
    return data;
  },

  async uploadDeliverables(id: string, files: File[]): Promise<void> {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    await apiClient.post(`/tasks/${id}/upload_deliverables/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
