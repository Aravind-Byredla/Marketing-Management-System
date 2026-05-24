"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Loader2, MapPin, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useBranches, useCompanies, useCreateBranch } from "@/hooks/useMasterData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { masterDataService } from "@/services/master-data.service";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  company: z.coerce.number().min(1, "Select a company"),
  name: z.string().min(2, "Branch name required"),
  location: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function BranchesPage() {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [companyFilter, setCompanyFilter] = useState<number | undefined>();
  const { data: branches, isLoading } = useBranches(companyFilter);
  const { data: companies } = useCompanies();
  const createBranch = useCreateBranch();
  const deleteBranch = useMutation({
    mutationFn: masterDataService.deleteBranch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["branches"] }); toast.success("Branch deleted."); },
    onError: () => toast.error("Cannot delete branch."),
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Branches"
        description="Manage company branches"
        actions={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Add Branch
          </button>
        }
      />

      {/* Filter */}
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

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches?.results.map((branch, i) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-blue-600" />
                </div>
                <button onClick={() => deleteBranch.mutate(branch.id)} className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold text-foreground">{branch.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{branch.company_name}</p>
              {branch.location && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />{branch.location}
                </p>
              )}
            </motion.div>
          ))}
          {!branches?.results.length && (
            <p className="text-muted-foreground text-sm col-span-3 text-center py-16">No branches yet.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Branch</h2>
                <button onClick={() => { setShowCreate(false); reset(); }} className="p-1.5 hover:bg-accent rounded-lg transition"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => {
                createBranch.mutate(d, { onSuccess: () => { setShowCreate(false); reset(); } });
              })} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <select {...register("company")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50">
                    <option value="">Select company…</option>
                    {companies?.results.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.company && <p className="text-xs text-destructive mt-1">{errors.company.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Branch Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location (optional)</label>
                  <input {...register("location")} placeholder="City, Country" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                  <button type="submit" disabled={createBranch.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                    {createBranch.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
