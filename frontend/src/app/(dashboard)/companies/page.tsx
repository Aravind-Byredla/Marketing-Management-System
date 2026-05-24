"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Loader2, Plus, Pencil, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useCompanies, useCreateCompany } from "@/hooks/useMasterData";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { masterDataService } from "@/services/master-data.service";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({ name: z.string().min(2, "Name required"), description: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function CompaniesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useCompanies();
  const createCompany = useCreateCompany();
  const [showCreate, setShowCreate] = useState(false);

  const deleteCompany = useMutation({
    mutationFn: masterDataService.deleteCompany,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["companies"] }); toast.success("Company deleted."); },
    onError: () => toast.error("Cannot delete — company may have active users or requests."),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Companies"
        description="Manage companies on the platform"
        actions={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Add Company
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((company, i) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <button
                  onClick={() => deleteCompany.mutate(company.id)}
                  className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-foreground">{company.name}</h3>
              {company.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{company.description}</p>}
              <div className="flex gap-4 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                <span>{company.branch_count} branch{company.branch_count !== 1 ? "es" : ""}</span>
                <span>{company.department_count} dept{company.department_count !== 1 ? "s" : ""}</span>
                <span className="ml-auto">{formatDate(company.created_at)}</span>
              </div>
            </motion.div>
          ))}
          {!data?.results.length && (
            <p className="text-muted-foreground text-sm col-span-3 text-center py-16">No companies yet.</p>
          )}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Company</h2>
                <button onClick={() => { setShowCreate(false); reset(); }} className="p-1.5 hover:bg-accent rounded-lg transition"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => {
                createCompany.mutate(d, { onSuccess: () => { setShowCreate(false); reset(); } });
              })} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea {...register("description")} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                  <button type="submit" disabled={createCompany.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                    {createCompany.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
