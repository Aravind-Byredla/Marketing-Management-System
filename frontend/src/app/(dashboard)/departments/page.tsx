"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Loader2, Plus, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useDepartments, useCompanies } from "@/hooks/useMasterData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { masterDataService } from "@/services/master-data.service";
import { DataTable, Column } from "@/components/common/DataTable";
import { formatDate } from "@/lib/utils";
import { Department } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  company: z.coerce.number().min(1, "Select a company"),
  name: z.string().min(2, "Name required"),
});
type Form = z.infer<typeof schema>;

export default function DepartmentsPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<number | undefined>();
  const { data: depts, isLoading } = useDepartments(companyFilter);
  const { data: companies } = useCompanies();

  const createDept = useMutation({
    mutationFn: masterDataService.createDepartment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["departments"] }); toast.success("Department created."); setShowCreate(false); reset(); },
    onError: () => toast.error("Failed to create department."),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const columns: Column<Department>[] = [
    { header: "Name", accessor: "name" },
    { header: "Company", accessor: "company_name" },
    { header: "Created", accessor: (d) => formatDate(d.created_at) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Departments"
        description="Manage departments per company"
        actions={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Add Department
          </button>
        }
      />
      <div className="bg-card rounded-xl border border-border p-4">
        <select
          value={companyFilter ?? ""}
          onChange={(e) => setCompanyFilter(e.target.value ? Number(e.target.value) : undefined)}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 outline-none text-foreground"
        >
          <option value="">All Companies</option>
          {companies?.results.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <DataTable
        columns={columns}
        data={depts?.results ?? []}
        isLoading={isLoading}
        rowKey={(d) => String(d.id)}
        emptyMessage="No departments yet."
      />
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Department</h2>
                <button onClick={() => { setShowCreate(false); reset(); }} className="p-1.5 hover:bg-accent rounded-lg transition"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => createDept.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <select {...register("company")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Select company…</option>
                    {companies?.results.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.company && <p className="text-xs text-destructive mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                  <button type="submit" disabled={createDept.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                    {createDept.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
