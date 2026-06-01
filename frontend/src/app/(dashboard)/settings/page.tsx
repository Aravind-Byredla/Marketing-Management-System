"use client";
import { motion } from "framer-motion";
import { Settings, Shield, Bell, Database } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  if (user?.role !== "SUPER_ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Shield className="w-12 h-12 opacity-30" />
        <p>You do not have permission to access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Settings" description="Platform-wide configuration" />
      <div className="grid grid-cols-1 gap-4">
        {[
          { icon: Shield, title: "Security", description: "JWT expiry, rate limits, password policy", color: "text-blue-600 bg-blue-50" },
          { icon: Bell, title: "Notifications", description: "Email templates, WebSocket settings", color: "text-purple-600 bg-purple-50" },
          { icon: Database, title: "Data Management", description: "Backup, export, and data retention", color: "text-green-600 bg-green-50" },
        ].map(({ icon: Icon, title, description, color }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-2">Platform Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>1.0.0</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Environment</span><span>{process.env.NODE_ENV}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">API</span><span>{process.env.NEXT_PUBLIC_API_URL}</span></div>
        </div>
      </div>
    </div>
  );
}
