"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Search, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRequests } from "@/hooks/useRequests";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { Pagination } from "@/components/common/Pagination";
import { formatDate, truncate } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { MarketingRequestList } from "@/types";

const STATUS_OPTIONS = ["DRAFT", "PENDING", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "CLOSED", "REJECTED"];
const PRIORITY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function RequestsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const { data, isLoading } = useRequests({
    page,
    page_size: 20,
    search: search || undefined,
    status: status || undefined,
    priority: priority || undefined,
  });

  const canCreate = user?.role !== "TEAM_MEMBER";

  const columns: Column<MarketingRequestList>[] = [
    { header: "ID", accessor: (r) => <span className="font-mono text-xs text-muted-foreground">{r.request_id}</span> },
    {
      header: "Title",
      accessor: (r) => (
        <div>
          <p className="font-medium text-sm">{truncate(r.title, 60)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{r.category_detail.name}</p>
        </div>
      ),
    },
    { header: "Company", accessor: (r) => r.company_detail.name },
    { header: "Branch", accessor: (r) => r.branch_detail.name },
    { header: "Priority", accessor: (r) => <PriorityBadge priority={r.priority} /> },
    { header: "Status", accessor: (r) => <StatusBadge status={r.status} /> },
    { header: "Deadline", accessor: (r) => formatDate(r.deadline) },
    { header: "Created", accessor: (r) => formatDate(r.created_at) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Requests"
        description="Manage all marketing and branding requests"
        actions={
          canCreate ? (
            <Link
              href="/requests/new"
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition"
            >
              <Plus className="w-4 h-4" />
              New Request
            </Link>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search requests…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 outline-none text-foreground"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 outline-none text-foreground"
        >
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <DataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading}
          rowKey={(r) => r.id}
          onRowClick={(r) => router.push(`/requests/${r.id}`)}
          emptyMessage="No requests found matching your filters."
        />
        {data && (
          <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.count} total results</span>
            <Pagination currentPage={page} totalPages={data.total_pages} onPageChange={setPage} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
