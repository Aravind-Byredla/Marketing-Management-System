"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Film,
  Loader2,
  LucideIcon,
  Megaphone,
  Package,
  Palette,
  Plus,
  Printer,
  Search,
  Smartphone,
  Sparkles,
  Star,
  Store,
  Tag,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useCategories, useCreateCategory } from "@/hooks/useMasterData";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  icon: z.string().optional(),
  description: z.string().optional(),
});
type Form = z.infer<typeof schema>;

type IconPreset = {
  key: string;
  label: string;
  Icon: LucideIcon;
  bg: string;
  text: string;
};

const iconPresets: IconPreset[] = [
  { key: "Smartphone", label: "Digital", Icon: Smartphone, bg: "bg-sky-500/10", text: "text-sky-600" },
  { key: "Palette", label: "Design", Icon: Palette, bg: "bg-fuchsia-500/10", text: "text-fuchsia-600" },
  { key: "Printer", label: "Print", Icon: Printer, bg: "bg-orange-500/10", text: "text-orange-600" },
  { key: "Camera", label: "Photo", Icon: Camera, bg: "bg-emerald-500/10", text: "text-emerald-600" },
  { key: "Film", label: "Video", Icon: Film, bg: "bg-violet-500/10", text: "text-violet-600" },
  { key: "Store", label: "Store", Icon: Store, bg: "bg-amber-500/10", text: "text-amber-600" },
  { key: "Star", label: "Influencer", Icon: Star, bg: "bg-yellow-500/10", text: "text-yellow-600" },
  { key: "Package", label: "Package", Icon: Package, bg: "bg-teal-500/10", text: "text-teal-600" },
  { key: "Megaphone", label: "Campaign", Icon: Megaphone, bg: "bg-rose-500/10", text: "text-rose-600" },
  { key: "Sparkles", label: "Branding", Icon: Sparkles, bg: "bg-indigo-500/10", text: "text-indigo-600" },
];

const iconAliases: Record<string, string> = {
  advertisingcampaigns: "Megaphone",
  camera: "Camera",
  digitalmarketing: "Smartphone",
  film: "Film",
  influencermarketing: "Star",
  megaphone: "Megaphone",
  packagedesign: "Package",
  packagingdesign: "Package",
  palette: "Palette",
  photography: "Camera",
  printer: "Printer",
  printingbranding: "Printer",
  search: "Search",
  shopbranding: "Store",
  smartphone: "Smartphone",
  socialmediadesigns: "Palette",
  store: "Store",
  videography: "Film",
};

function normalizeIconKey(value?: string) {
  return value?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
}

function getCategoryIcon(name: string, icon?: string): IconPreset {
  const normalizedIcon = normalizeIconKey(icon);
  const normalizedName = normalizeIconKey(name);
  const matchedKey =
    iconPresets.find((preset) => normalizeIconKey(preset.key) === normalizedIcon)?.key ??
    iconAliases[normalizedIcon] ??
    iconAliases[normalizedName];

  if (matchedKey === "Search") {
    return { key: "Search", label: "Search", Icon: Search, bg: "bg-blue-500/10", text: "text-blue-600" };
  }

  return (
    iconPresets.find((preset) => preset.key === matchedKey) ?? {
      key: "Tag",
      label: "Category",
      Icon: Tag,
      bg: "bg-indigo-500/10",
      text: "text-indigo-600",
    }
  );
}

export default function CategoriesPage() {
  const { data, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const [showCreate, setShowCreate] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { icon: "Sparkles" },
  });
  const selectedIcon = watch("icon");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Service Categories"
        description="Manage marketing service categories and subcategories"
        actions={
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.results.map((cat, i) => {
            const { Icon, bg, text, label } = getCategoryIcon(cat.name, cat.icon);

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group bg-card rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`h-11 w-11 shrink-0 ${bg} ${text} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-3`}
                    title={`${cat.name} icon: ${label}`}
                    aria-label={`${cat.name} icon`}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground leading-tight">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.subcategories.length} subcategories</p>
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
            );
          })}
          {!data?.results.length && (
            <p className="text-muted-foreground text-sm col-span-3 text-center py-16">No categories yet.</p>
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-2xl border border-border p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Add Category</h2>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    reset({ icon: "Sparkles" });
                  }}
                  className="p-1.5 hover:bg-accent rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form
                onSubmit={handleSubmit((d) => {
                  createCategory.mutate(d, {
                    onSuccess: () => {
                      setShowCreate(false);
                      reset({ icon: "Sparkles" });
                    },
                  });
                })}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name</label>
                  <input
                    {...register("name")}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Icon</label>
                  <input type="hidden" {...register("icon")} />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {iconPresets.map(({ key, label, Icon, bg, text }) => {
                      const isSelected = selectedIcon === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setValue("icon", key, { shouldDirty: true })}
                          className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-xs transition hover:border-primary/50 hover:bg-accent ${
                            isSelected ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                          }`}
                          title={label}
                          aria-pressed={isSelected}
                        >
                          <span className={`h-8 w-8 shrink-0 rounded-lg ${bg} ${text} flex items-center justify-center`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      reset({ icon: "Sparkles" });
                    }}
                    className="flex-1 px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCategory.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
                  >
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
