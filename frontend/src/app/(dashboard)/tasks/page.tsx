"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useTasks } from "@/hooks/useTasks";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { formatDate, cn } from "@/lib/utils";
import { Task } from "@/types";

const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function TasksPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, isLoading } = useTasks({ page, status: status || undefined });

  const columns: Column<Task>[] = [
    {
      header: "Task",
      accessor: (t) => (
        <div>
          <p className="font-medium text-sm">{t.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{t.request_detail?.request_id}</p>
        </div>
      ),
    },
    {
      header: "Assigned To",
      accessor: (t) => t.assigned_to_detail?.full_name ?? "—",
    },
    {
      header: "Progress",
      accessor: (t) => (
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full", t.progress_percentage >= 100 ? "bg-green-500" : "bg-primary")}
              style={{ width: `${t.progress_percentage}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{t.progress_percentage}%</span>
        </div>
      ),
    },
    { header: "Status", accessor: (t) => <StatusBadge status={t.status} /> },
    { header: "Deadline", accessor: (t) => formatDate(t.deadline) },
    { header: "Created", accessor: (t) => formatDate(t.created_at) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Tasks" description="Track all assigned tasks" />

      {/* Filters */}
      <div className="flex gap-3 bg-card rounded-xl border border-border p-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 outline-none text-foreground"
        >
          <option value="">All Statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading}
          rowKey={(t) => t.id}
          onRowClick={(t) => router.push(`/tasks/${t.id}`)}
          emptyMessage="No tasks found."
        />
        {data && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.count} total tasks</span>
            <Pagination currentPage={page} totalPages={data.total_pages} onPageChange={setPage} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
