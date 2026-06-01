"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, Upload, X } from "lucide-react";
import { useCompanies, useBranches, useDepartments, useCategories } from "@/hooks/useMasterData";
import { useCreateRequest } from "@/hooks/useRequests";
import { requestsService } from "@/services/requests.service";
import { PageHeader } from "@/components/common/PageHeader";
import { cn } from "@/lib/utils";
import { RequestFormValues } from "@/types";

// ─── Validation ────────────────────────────────────────────
const step1Schema = z.object({
  company: z.coerce.number().min(1, "Select a company"),
  branch: z.coerce.number().min(1, "Select a branch"),
  department: z.coerce.number().min(1, "Select a department"),
});
const step2Schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  objective: z.string().min(10, "Describe the objective"),
  summary: z.string().min(10, "Provide a summary"),
  quantity: z.coerce.number().min(1, "Minimum 1"),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  deadline: z.string().optional(),
});
const step3Schema = z.object({
  category: z.coerce.number().min(1, "Select a category"),
  subcategory: z.coerce.number().optional(),
});

const STEPS = ["Organisation", "Details", "Category", "Attachments", "Review"];

export default function NewRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [videoLinks, setVideoLinks] = useState<string[]>([]);
  const [videoInput, setVideoInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const createRequest = useCreateRequest();

  const { data: companies } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<number>(0);
  const { data: branches } = useBranches(selectedCompany || undefined);
  const { data: departments } = useDepartments(selectedCompany || undefined);
  const { data: categories } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<number>(0);

  const { register, control, handleSubmit, watch, getValues, trigger, formState: { errors } } = useForm<RequestFormValues>({
    defaultValues: { quantity: 1, priority: "MEDIUM", video_references: [] },
  });

  const watchedCompany = watch("company");
  const watchedCategory = watch("category");

  const selectedCategoryData = categories?.results.find((c) => c.id === Number(watchedCategory));

  const nextStep = async () => {
    let valid = true;
    if (step === 0) valid = await trigger(["company", "branch", "department"]);
    if (step === 1) valid = await trigger(["title", "objective", "summary", "quantity", "priority"]);
    if (step === 2) valid = await trigger(["category"]);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const onSubmit = async (data: RequestFormValues) => {
    setSubmitting(true);
    try {
      const payload = { ...data, video_references: videoLinks };
      const created = await requestsService.create(payload);
      if (files.length > 0) {
        await requestsService.uploadFiles(created.id, files);
      }
      router.push(`/requests/${created.id}`);
    } catch {
      setSubmitting(false);
    }
  };

  const addVideo = () => {
    if (videoInput.trim()) {
      setVideoLinks((v) => [...v, videoInput.trim()]);
      setVideoInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="New Request" description="Submit a new marketing or branding requirement" />

      {/* Progress Steps */}
      <div className="flex items-center gap-0">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors",
                i < step ? "bg-green-500 border-green-500 text-white"
                  : i === step ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              )}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs mt-1 font-medium hidden sm:block", i === step ? "text-primary" : "text-muted-foreground")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("h-0.5 flex-1 mx-2 transition-colors", i < step ? "bg-green-500" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-card rounded-xl border border-border p-6 min-h-[350px]">
          <AnimatePresence mode="wait">
            {/* Step 1: Organisation */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-semibold text-foreground text-lg">Organisation</h2>
                <Field label="Company" error={errors.company?.message}>
                  <select {...register("company")} onChange={(e) => { register("company").onChange(e); setSelectedCompany(Number(e.target.value)); }} className={inputCls}>
                    <option value="">Select company…</option>
                    {companies?.results.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Branch" error={errors.branch?.message}>
                  <select {...register("branch")} className={inputCls} disabled={!watchedCompany}>
                    <option value="">Select branch…</option>
                    {branches?.results.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>
                <Field label="Department" error={errors.department?.message}>
                  <select {...register("department")} className={inputCls} disabled={!watchedCompany}>
                    <option value="">Select department…</option>
                    {departments?.results.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </Field>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-semibold text-foreground text-lg">Request Details</h2>
                <Field label="Title" error={errors.title?.message}>
                  <input {...register("title")} placeholder="Brief title for this request" className={inputCls} />
                </Field>
                <Field label="Objective" error={errors.objective?.message}>
                  <textarea {...register("objective")} rows={3} placeholder="What do you want to achieve?" className={inputCls} />
                </Field>
                <Field label="Summary" error={errors.summary?.message}>
                  <textarea {...register("summary")} rows={3} placeholder="More details about the requirement…" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Quantity" error={errors.quantity?.message}>
                    <input {...register("quantity")} type="number" min={1} className={inputCls} />
                  </Field>
                  <Field label="Priority">
                    <select {...register("priority")} className={inputCls}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </Field>
                </div>
                <Field label="Deadline (optional)">
                  <input {...register("deadline")} type="date" className={inputCls} />
                </Field>
                <Field label="Notes (optional)">
                  <textarea {...register("notes")} rows={2} placeholder="Any additional notes…" className={inputCls} />
                </Field>
              </motion.div>
            )}

            {/* Step 3: Category */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-semibold text-foreground text-lg">Service Category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories?.results.map((cat) => (
                    <label
                      key={cat.id}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all",
                        Number(watchedCategory) === cat.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <input {...register("category")} type="radio" value={cat.id} className="sr-only" />
                      <span className="text-2xl">{cat.icon || "📁"}</span>
                      <span className="text-xs font-medium text-center">{cat.name}</span>
                    </label>
                  ))}
                </div>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}

                {selectedCategoryData && selectedCategoryData.subcategories.length > 0 && (
                  <Field label="Sub-Category">
                    <select {...register("subcategory")} className={inputCls}>
                      <option value="">Select sub-category…</option>
                      {selectedCategoryData.subcategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </motion.div>
            )}

            {/* Step 4: Attachments */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="font-semibold text-foreground text-lg">Attachments</h2>
                {/* File upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Files (images, documents, videos)</label>
                  <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Click to upload or drag & drop</span>
                    <input type="file" multiple className="sr-only" onChange={(e) => {
                      if (e.target.files) setFiles((f) => [...f, ...Array.from(e.target.files!)]);
                    }} />
                  </label>
                  {files.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      {files.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm bg-muted rounded-lg px-3 py-2">
                          <span className="flex-1 truncate">{f.name}</span>
                          <span className="text-muted-foreground text-xs">{(f.size / 1024).toFixed(0)} KB</span>
                          <button type="button" onClick={() => setFiles((fl) => fl.filter((_, j) => j !== i))}>
                            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Video links */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Video Reference Links</label>
                  <div className="flex gap-2">
                    <input
                      value={videoInput}
                      onChange={(e) => setVideoInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideo())}
                      placeholder="https://youtube.com/…"
                      className={cn(inputCls, "flex-1")}
                    />
                    <button type="button" onClick={addVideo} className="px-4 py-2 bg-muted border border-border rounded-lg text-sm hover:bg-accent transition">
                      Add
                    </button>
                  </div>
                  {videoLinks.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <span className="flex-1 truncate">{v}</span>
                      <button type="button" onClick={() => setVideoLinks((vl) => vl.filter((_, j) => j !== i))}>
                        <X className="w-3.5 h-3.5 hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 5: Review */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="font-semibold text-foreground text-lg">Review & Submit</h2>
                <ReviewRow label="Title" value={getValues("title")} />
                <ReviewRow label="Objective" value={getValues("objective")} />
                <ReviewRow label="Priority" value={getValues("priority")} />
                <ReviewRow label="Deadline" value={getValues("deadline") || "Not set"} />
                <ReviewRow label="Files" value={files.length > 0 ? `${files.length} file(s)` : "None"} />
                <ReviewRow label="Video links" value={videoLinks.length > 0 ? `${videoLinks.length} link(s)` : "None"} />
                <p className="text-sm text-muted-foreground mt-4">
                  Review your request above. Click <strong>Submit</strong> to send it for review.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-500 transition disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border text-sm">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-foreground max-w-xs text-right">{value}</span>
    </div>
  );
}
