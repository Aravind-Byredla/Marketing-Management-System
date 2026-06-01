"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Loader2, Lock, Save, User } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useMutation } from "@tanstack/react-query";
import { usersService } from "@/services/users.service";
import { authService } from "@/services/auth.service";
import { PageHeader } from "@/components/common/PageHeader";
import { getInitials, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  full_name: z.string().min(2, "Name required"),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  old_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Minimum 8 characters"),
  confirm_new_password: z.string(),
}).refine((d) => d.new_password === d.confirm_new_password, { message: "Passwords do not match", path: ["confirm_new_password"] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { full_name: user?.full_name ?? "", phone: user?.phone ?? "" },
  });

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const updateProfile = useMutation({
    mutationFn: (data: ProfileForm) => usersService.updateProfile(data),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profile updated.");
    },
    onError: () => toast.error("Failed to update profile."),
  });

  const changePassword = useMutation({
    mutationFn: (data: PasswordForm) =>
      authService.changePassword(data.old_password, data.new_password, data.confirm_new_password),
    onSuccess: () => {
      toast.success("Password changed successfully.");
      passwordForm.reset();
    },
    onError: () => toast.error("Incorrect current password."),
  });

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Profile" description="Manage your account information" />

      {/* Avatar & Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl border border-border p-6 flex items-center gap-5"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold">
            {getInitials(user.full_name)}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent transition">
            <Camera className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{user.full_name}</h2>
          <p className="text-muted-foreground text-sm">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {user.role.replace(/_/g, " ")}
            </span>
            {user.company_detail && (
              <span className="text-xs text-muted-foreground">{user.company_detail.name}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Member since {formatDate(user.created_at)}</p>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        {(["profile", "security"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
              activeTab === tab ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "profile" ? <span className="flex items-center gap-1.5"><User className="w-4 h-4" />Profile</span> : <span className="flex items-center gap-1.5"><Lock className="w-4 h-4" />Security</span>}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {activeTab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={profileForm.handleSubmit((d) => updateProfile.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                {...profileForm.register("full_name")}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
              {profileForm.formState.errors.full_name && (
                <p className="text-xs text-destructive mt-1">{profileForm.formState.errors.full_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                {...profileForm.register("phone")}
                placeholder="+1 555 000 0000"
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={user.email}
                disabled
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
            >
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Security Form */}
      {activeTab === "security" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={passwordForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
            {[
              { name: "old_password" as const, label: "Current Password" },
              { name: "new_password" as const, label: "New Password" },
              { name: "confirm_new_password" as const, label: "Confirm New Password" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <input
                  {...passwordForm.register(name)}
                  type="password"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50"
                />
                {passwordForm.formState.errors[name] && (
                  <p className="text-xs text-destructive mt-1">{passwordForm.formState.errors[name]?.message}</p>
                )}
              </div>
            ))}
            <button
              type="submit"
              disabled={changePassword.isPending}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition disabled:opacity-60"
            >
              {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
}
