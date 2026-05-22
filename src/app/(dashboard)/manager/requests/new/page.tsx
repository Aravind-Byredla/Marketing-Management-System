"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  companyId: z.string().min(1, "Select a company"),
  branchId: z.string().optional(),
  title: z.string().min(3, "Title is required"),
  objective: z.string().min(10, "Objective is required"),
  summary: z.string().optional(),
  quantity: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  deadline: z.string().optional(),
  categoryId: z.string().min(1, "Select a category"),
  subcategoryId: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING"]),
});

type FormData = z.infer<typeof schema>;

interface Company { id: string; name: string; branches: { id: string; name: string }[] }
interface Category { id: string; name: string; icon: string; subcategories: { id: string; name: string }[] }

const STEPS = ["Company & Branch", "Request Details", "Category", "Review & Submit"];

export default function NewRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, setValue, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "MEDIUM", status: "PENDING" },
  });

  const watchCompanyId = watch("companyId");
  const watchCategoryId = watch("categoryId");

  useEffect(() => {
    fetch("/api/companies").then(r => r.json()).then(setCompanies);
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  const selectedCompany = companies.find(c => c.id === watchCompanyId);
  const selectedCategory = categories.find(c => c.id === watchCategoryId);

  const stepFields: Record<number, (keyof FormData)[]> = {
    0: ["companyId"],
    1: ["title", "objective"],
    2: ["categoryId"],
    3: [],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep(s => s + 1);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit");
      }
      const req = await res.json();
      router.push(`/manager/requests/${req.id}?success=true`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Request</h1>
        <p className="text-gray-500 text-sm mt-1">Submit a new marketing or branding requirement</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                i < step ? "bg-blue-600 text-white" :
                i === step ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                "bg-gray-100 text-gray-400"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-blue-600" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 ${i < step ? "bg-blue-600" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* STEP 0 — Company & Branch */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Select Company & Branch</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <div className="grid grid-cols-2 gap-3">
                  {companies.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { setValue("companyId", c.id); setValue("branchId", ""); }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        watchCompanyId === c.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{c.branches.length} branch{c.branches.length !== 1 ? "es" : ""}</p>
                    </button>
                  ))}
                </div>
                {errors.companyId && <p className="text-red-500 text-xs mt-2">{errors.companyId.message}</p>}
              </div>

              {selectedCompany && selectedCompany.branches.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCompany.branches.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setValue("branchId", b.id)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          watch("branchId") === b.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1 — Request Details */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Request Details</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Request Title *</label>
                <input
                  {...register("title")}
                  placeholder="e.g. Ramadan Campaign Posters"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objective *</label>
                <textarea
                  {...register("objective")}
                  rows={3}
                  placeholder="What is the goal of this request?"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                {errors.objective && <p className="text-red-500 text-xs mt-1">{errors.objective.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary / Requirements</label>
                <textarea
                  {...register("summary")}
                  rows={3}
                  placeholder="Detailed description of what you need..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    {...register("quantity")}
                    placeholder="e.g. 500 copies"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    {...register("deadline")}
                    type="date"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex gap-3">
                  {(["LOW", "MEDIUM", "HIGH"] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setValue("priority", p)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        watch("priority") === p
                          ? p === "HIGH" ? "border-red-500 bg-red-50 text-red-700"
                            : p === "MEDIUM" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                            : "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  placeholder="Any extra information..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2 — Category */}
          {step === 2 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Select Service Category</h2>

              <div className="grid grid-cols-2 gap-3">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => { setValue("categoryId", cat.id); setValue("subcategoryId", ""); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      watchCategoryId === cat.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-medium text-sm text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.subcategories.length} options</p>
                  </button>
                ))}
              </div>
              {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}

              {selectedCategory && selectedCategory.subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategory.subcategories.map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setValue("subcategoryId", sub.id)}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          watch("subcategoryId") === sub.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-semibold text-gray-900 text-lg">Review & Submit</h2>

              <div className="bg-gray-50 rounded-xl p-5 space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Company</p>
                    <p className="font-medium text-gray-900">{selectedCompany?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Category</p>
                    <p className="font-medium text-gray-900">{selectedCategory?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Priority</p>
                    <p className="font-medium text-gray-900">{watch("priority")}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Deadline</p>
                    <p className="font-medium text-gray-900">{watch("deadline") || "Not set"}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-500 text-xs mb-1">Title</p>
                  <p className="font-medium text-gray-900">{watch("title")}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Objective</p>
                  <p className="text-gray-700">{watch("objective")}</p>
                </div>
                {watch("summary") && (
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Summary</p>
                    <p className="text-gray-700">{watch("summary")}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Submit as</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("status", "DRAFT")}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      watch("status") === "DRAFT"
                        ? "border-gray-500 bg-gray-50 text-gray-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    💾 Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("status", "PENDING")}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                      watch("status") === "PENDING"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    🚀 Submit for Review
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Back
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/manager")}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
