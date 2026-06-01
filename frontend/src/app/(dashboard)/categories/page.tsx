"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Tag, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useCategories, useCreateCategory } from "@/hooks/useMasterData";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  icon: z.string().optional(),
  description: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service Categories"
        description="Manage marketing service categories and subcategories"
        actions={
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition">
            <Plus className="w-4 h-4" /> Add Category
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-2xl">
                  {cat.icon || "📁"}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground">{cat.subcategories.length} subcategories</p>
                </div>
              </div>
              {cat.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cat.description}</p>}
              {cat.subcategories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {cat.subcategories.slice(0, 5).map((sc) => (
                    <span key={sc.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {sc.name}
                    </span>
                  ))}
                  {cat.subcategories.length > 5 && (
                    <span className="text-xs text-muted-foreground">+{cat.subcategories.length - 5} more</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          {!data?.results.length && (
            <p className="text-muted-foreground text-sm col-span-3 text-center py-16">No categories yet.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Category</h2>
                <button onClick={() => { setShowCreate(false); reset(); }} className="p-1.5 hover:bg-accent rounded-lg transition"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleSubmit((d) => {
                createCategory.mutate(d, { onSuccess: () => { setShowCreate(false); reset(); } });
              })} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input {...register("name")} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Icon (emoji or Lucide name)</label>
                  <input {...register("icon")} placeholder="📣 or megaphone" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea {...register("description")} rows={2} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowCreate(false); reset(); }} className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition">Cancel</button>
                  <button type="submit" disabled={createCategory.isPending} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60">
                    {createCategory.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
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
