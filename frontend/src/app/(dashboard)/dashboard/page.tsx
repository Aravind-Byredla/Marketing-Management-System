"use client";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BarChart3,
  CheckCircle,
  ClipboardList,
  Clock,
  Plus,
  RefreshCcw,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/common/StatsCard";
import { useDashboardStats, useMonthlyRequests } from "@/hooks/useAnalytics";
import { useRequests } from "@/hooks/useRequests";
import { useTasks } from "@/hooks/useTasks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { formatDate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: monthlyData } = useMonthlyRequests();
  const { data: recentRequests } = useRequests({ page_size: 5, ordering: "-created_at" });
  const { data: myTasks } = useTasks({ page_size: 5, status: "IN_PROGRESS" });

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">
          Good {getTimeOfDay()}, {user?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening today.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatsCard
          title="Total Requests"
          value={stats?.requests.total ?? 0}
          icon={ClipboardList}
          color="text-blue-600"
          index={0}
        />
        <StatsCard
          title="Pending"
          value={stats?.requests.pending ?? 0}
          icon={Clock}
          color="text-yellow-600"
          index={1}
        />
        <StatsCard
          title="In Progress"
          value={stats?.requests.in_progress ?? 0}
          icon={RefreshCcw}
          color="text-indigo-600"
          index={2}
        />
        <StatsCard
          title="Completed"
          value={stats?.requests.completed ?? 0}
          icon={CheckCircle}
          color="text-green-600"
          index={3}
        />
        <StatsCard
          title="Overdue Tasks"
          value={stats?.tasks.overdue ?? 0}
          icon={AlertCircle}
          color="text-red-600"
          index={4}
        />
        {isAdmin && (
          <>
            <StatsCard
              title="Under Review"
              value={stats?.requests.under_review ?? 0}
              icon={BarChart3}
              color="text-purple-600"
              index={5}
            />
            <StatsCard
              title="Rejected"
              value={stats?.requests.rejected ?? 0}
              icon={XCircle}
              color="text-red-600"
              index={6}
            />
            <StatsCard
              title="Total Users"
              value={stats?.users?.total ?? 0}
              icon={Users}
              color="text-teal-600"
              index={7}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Chart */}
        {isAdmin && monthlyData && monthlyData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Monthly Requests</h2>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5"
        >
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {(user?.role === "MANAGER" || user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") && (
              <Link
                href="/requests/new"
                className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium text-sm"
              >
                <Plus className="w-4 h-4" />
                New Request
              </Link>
            )}
            <Link
              href="/requests"
              className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg hover:bg-accent transition text-sm font-medium text-foreground"
            >
              <ClipboardList className="w-4 h-4" />
              View All Requests
            </Link>
            <Link
              href="/tasks"
              className="flex items-center gap-3 px-4 py-3 bg-muted rounded-lg hover:bg-accent transition text-sm font-medium text-foreground"
            >
              <CheckCircle className="w-4 h-4" />
              My Tasks
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Recent Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">Recent Requests</h2>
          <Link href="/requests" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {recentRequests?.results.slice(0, 5).map((req) => (
            <Link
              key={req.id}
              href={`/requests/${req.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition group"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition">
                  {req.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {req.request_id} · {req.category_detail.name} · {formatDate(req.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PriorityBadge priority={req.priority} />
                <StatusBadge status={req.status} />
              </div>
            </Link>
          ))}
          {!recentRequests?.results.length && (
            <p className="text-center text-muted-foreground text-sm py-8">No requests yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
