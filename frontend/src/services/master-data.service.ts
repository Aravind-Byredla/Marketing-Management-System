import apiClient from "@/lib/axios";
import { Branch, Category, Company, Department, PaginatedResponse } from "@/types";

export const masterDataService = {
  // Companies
  async getCompanies(): Promise<PaginatedResponse<Company>> {
    const { data } = await apiClient.get<PaginatedResponse<Company>>("/master/companies/?page_size=100");
    return data;
  },
  async createCompany(payload: { name: string; description?: string }): Promise<Company> {
    const { data } = await apiClient.post<Company>("/master/companies/", payload);
    return data;
  },
  async updateCompany(id: number, payload: Partial<Company>): Promise<Company> {
    const { data } = await apiClient.patch<Company>(`/master/companies/${id}/`, payload);
    return data;
  },
  async deleteCompany(id: number): Promise<void> {
    await apiClient.delete(`/master/companies/${id}/`);
  },

  // Branches
  async getBranches(companyId?: number): Promise<PaginatedResponse<Branch>> {
    const qs = companyId ? `?company=${companyId}&page_size=100` : "?page_size=100";
    const { data } = await apiClient.get<PaginatedResponse<Branch>>(`/master/branches/${qs}`);
    return data;
  },
  async createBranch(payload: { company: number; name: string; location?: string }): Promise<Branch> {
    const { data } = await apiClient.post<Branch>("/master/branches/", payload);
    return data;
  },
  async updateBranch(id: number, payload: Partial<Branch>): Promise<Branch> {
    const { data } = await apiClient.patch<Branch>(`/master/branches/${id}/`, payload);
    return data;
  },
  async deleteBranch(id: number): Promise<void> {
    await apiClient.delete(`/master/branches/${id}/`);
  },

  // Departments
  async getDepartments(companyId?: number): Promise<PaginatedResponse<Department>> {
    const qs = companyId ? `?company=${companyId}&page_size=100` : "?page_size=100";
    const { data } = await apiClient.get<PaginatedResponse<Department>>(`/master/departments/${qs}`);
    return data;
  },
  async createDepartment(payload: { company: number; name: string }): Promise<Department> {
    const { data } = await apiClient.post<Department>("/master/departments/", payload);
    return data;
  },

  // Categories
  async getCategories(): Promise<PaginatedResponse<Category>> {
    const { data } = await apiClient.get<PaginatedResponse<Category>>("/master/categories/?page_size=100");
    return data;
  },
  async createCategory(payload: { name: string; icon?: string; description?: string }): Promise<Category> {
    const { data } = await apiClient.post<Category>("/master/categories/", payload);
    return data;
  },
  async updateCategory(id: number, payload: Partial<Category>): Promise<Category> {
    const { data } = await apiClient.patch<Category>(`/master/categories/${id}/`, payload);
    return data;
  },
};
