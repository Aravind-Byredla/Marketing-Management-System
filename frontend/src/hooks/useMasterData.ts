"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { masterDataService } from "@/services/master-data.service";
import { toast } from "sonner";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: masterDataService.getCompanies,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBranches(companyId?: number) {
  return useQuery({
    queryKey: ["branches", companyId],
    queryFn: () => masterDataService.getBranches(companyId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDepartments(companyId?: number) {
  return useQuery({
    queryKey: ["departments", companyId],
    queryFn: () => masterDataService.getDepartments(companyId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: masterDataService.getCategories,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: masterDataService.createCompany,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); toast.success("Company created."); },
    onError: () => toast.error("Failed to create company."),
  });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: masterDataService.createBranch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); toast.success("Branch created."); },
    onError: () => toast.error("Failed to create branch."),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: masterDataService.createCategory,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["categories"] }); toast.success("Category created."); },
    onError: () => toast.error("Failed to create category."),
  });
}
