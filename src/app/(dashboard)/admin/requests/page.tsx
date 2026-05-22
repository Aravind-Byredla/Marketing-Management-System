"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import { RequestStatus } from "@prisma/client";

const STATUS_FILTERS = ["ALL", "PENDING", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED", "CLOSED"];
const PRIORITY_FILTERS = ["ALL", "HIGH", "MEDIUM", "LOW"];

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const url = statusFilter === "ALL" ? "/api/requests" : `/api/requests?status=${statusFilter}`;
    fetch(url).then(r => r.json()).then(data => {
      setRequests(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [statusFilter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filtered = requests.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.requestId.toLowerCase().includes(search.toLowerCase()) ||
      r.createdBy?.name.toLowerCase().includes(search.toLowerCase());
    const matchPriority = priorityFilter === "ALL" || r.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            {s.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Search + priority */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search requests, managers..."
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
          {PRIORITY_FILTERS.map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Request</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Company</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Manager</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Assigned To</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No requests found</td></tr>
              ) : filtered.map(req => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/requests/${req.id}`} className="hover:text-blue-600">
                      <p className="font-medium text-gray-900 truncate max-w-xs">{req.title}</p>
                      <p className="text-xs text-gray-400 font-mono">{req.requestId}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{req.company?.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{req.createdBy?.name}</td>
                  <td className="px-4 py-3 text-xs">
                    {req.assignedTo
                      ? <span className="text-gray-700">{req.assignedTo.name}</span>
                      : <span className="text-orange-500">Unassigned</span>}
                  </td>
                  <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={req.status as RequestStatus} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400">{formatDate(req.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
