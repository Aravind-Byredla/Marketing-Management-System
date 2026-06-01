"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Megaphone } from "lucide-react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const { access, refresh, user } = await authService.login(data.email, data.password);
      setAuth(user, access, refresh);
      toast.success(`Welcome back, ${user.full_name}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <Megaphone className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Marketing & Branding</h1>
        <p className="text-slate-400 text-sm mt-1">Requirement Management System</p>
      </div>

      {/* Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-white mb-6">Sign in to your account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email address
            </label>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
