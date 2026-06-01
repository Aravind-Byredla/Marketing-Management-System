import apiClient from "@/lib/axios";
import { PaginatedResponse, User } from "@/types";
import { buildQueryString } from "@/lib/utils";

export interface UserFilters {
  page?: number;
  page_size?: number;
  role?: string;
  is_active?: boolean;
  company?: number;
  branch?: number;
  search?: string;
}

export const usersService = {
  async list(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const qs = buildQueryString(filters);
    const { data } = await apiClient.get<PaginatedResponse<User>>(`/users/?${qs}`);
    return data;
  },

  async get(id: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${id}/`);
    return data;
  },

  async create(payload: {
    email: string;
    full_name: string;
    role: string;
    password: string;
    confirm_password: string;
    company?: number;
    branch?: number;
    department?: number;
  }): Promise<User> {
    const { data } = await apiClient.post<User>("/users/", payload);
    return data;
  },

  async update(id: string, payload: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<User>(`/users/${id}/`, payload);
    return data;
  },

  async toggleActive(id: string): Promise<{ is_active: boolean }> {
    const { data } = await apiClient.post<{ is_active: boolean }>(`/users/${id}/toggle_active/`);
    return data;
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await apiClient.patch<User>("/users/update_profile/", payload);
    return data;
  },
};
