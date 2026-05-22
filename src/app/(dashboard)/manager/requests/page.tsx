"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import { RequestStatus } from "@prisma/client";

const STATUS_FILTERS = ["ALL", "DRAFT", "PENDING", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "CLOSED"];

export default function ManagerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/requests" : `/api/requests?status=${filter}`;
    fetch(url).then(r => r.json()).then(data => {
      setRequests(data);
      setLoading(false);
    });
  }, [filter]);

  const filtered = requests.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.requestId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total requests</p>
        </div>
        <Link
          href="/manager/requests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + New Request
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}
          >
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by title or request ID..."
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 text-sm">No requests found</p>
            <Link href="/manager/requests/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
              Create your first request
            </Link>
          </div>
        ) : (
          filtered.map(req => (
            <Link key={req.id} href={`/manager/requests/${req.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{req.requestId}</span>
                  <PriorityBadge priority={req.priority} />
                </div>
                <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {req.company.name} · {req.category.name}
                  {req.assignedTo && ` · Assigned to ${req.assignedTo.name}`}
                </p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <StatusBadge status={req.status as RequestStatus} />
                <span className="text-xs text-gray-400 hidden sm:block">{formatDate(req.createdAt)}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
