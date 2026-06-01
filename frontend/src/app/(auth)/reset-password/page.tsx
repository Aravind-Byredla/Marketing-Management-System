"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { CheckCircle, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useState } from "react";

const schema = z
  .object({
    new_password: z.string().min(8, "Minimum 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type Form = z.infer<typeof schema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    if (!token) { toast.error("Invalid reset link."); return; }
    try {
      await authService.confirmPasswordReset(token, data.new_password, data.confirm_password);
      setDone(true);
    } catch {
      toast.error("Reset link is invalid or has expired.");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
      {done ? (
        <div className="text-center py-4">
          <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">Password reset successfully</h3>
          <p className="text-slate-400 text-sm mb-6">You can now sign in with your new password.</p>
          <Link href="/login" className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition">
            Sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
            <input
              {...register("new_password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.new_password && <p className="mt-1 text-xs text-red-400">{errors.new_password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
            <input
              {...register("confirm_password")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {errors.confirm_password && <p className="mt-1 text-xs text-red-400">{errors.confirm_password.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold rounded-lg transition"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Set new password
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <Megaphone className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">New Password</h1>
        <p className="text-slate-400 text-sm mt-1">Choose a strong password</p>
      </div>
      <Suspense fallback={<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl h-48 animate-pulse" />}>
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
