"use client";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { useDashboardStats, useMonthlyRequests, useRequestsByCategory, useRequestsByStatus } from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { BarChart3, CheckCircle, ClipboardList, Clock, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING: "#f59e0b",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#6366f1",
  UNDER_REVIEW: "#a855f7",
  COMPLETED: "#22c55e",
  CLOSED: "#64748b",
  REJECTED: "#ef4444",
};

export default function AnalyticsPage() {
  const { data: stats } = useDashboardStats();
  const { data: monthly } = useMonthlyRequests();
  const { data: byCategory } = useRequestsByCategory();
  const { data: byStatus } = useRequestsByStatus();

  const pieData = byStatus?.map((s) => ({
    name: s.status.replace(/_/g, " "),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  })) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Platform-wide metrics and trends" />

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard title="Total Requests" value={stats?.requests.total ?? 0} icon={ClipboardList} color="text-blue-600" index={0} />
        <StatsCard title="Completed" value={stats?.requests.completed ?? 0} icon={CheckCircle} color="text-green-600" index={1} />
        <StatsCard title="Pending" value={stats?.requests.pending ?? 0} icon={Clock} color="text-yellow-600" index={2} />
        <StatsCard title="Overdue Tasks" value={stats?.tasks.overdue ?? 0} icon={AlertCircle} color="text-red-600" index={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly bar chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Monthly Requests ({new Date().getFullYear()})
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthly ?? []}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" name="Requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status pie chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4">Requests by Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name">
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* By Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card rounded-xl border border-border p-5 lg:col-span-2"
        >
          <h2 className="font-semibold text-foreground mb-4">Requests by Category</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byCategory ?? []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="category__name" type="category" tick={{ fontSize: 11 }} width={150} />
              <Tooltip />
              <Bar dataKey="count" name="Requests" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
