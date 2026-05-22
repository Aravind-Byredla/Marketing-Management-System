"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import { RequestStatus } from "@prisma/client";

const FILTERS = ["ALL", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"];

export default function TeamTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url = filter === "ALL" ? "/api/requests" : `/api/requests?status=${filter}`;
    fetch(url).then(r => r.json()).then(data => {
      setTasks(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, [filter]);

  const overdue = tasks.filter(t =>
    t.deadline && new Date(t.deadline) < new Date() && !["COMPLETED", "CLOSED"].includes(t.status)
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">{tasks.length} tasks assigned to you</p>
      </div>

      {/* Overdue alert */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium text-red-800 text-sm">{overdue.length} overdue task{overdue.length > 1 ? "s" : ""}</p>
            <p className="text-xs text-red-700">Please update progress on overdue tasks</p>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
            }`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 text-sm">No tasks found</p>
          </div>
        ) : tasks.map(task => {
          const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !["COMPLETED", "CLOSED"].includes(task.status);
          return (
            <Link key={task.id} href={`/team/tasks/${task.id}`}
              className={`block bg-white rounded-xl border p-4 hover:shadow-sm transition-all ${isOverdue ? "border-red-200" : "border-gray-200"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{task.requestId}</span>
                    <PriorityBadge priority={task.priority} />
                    {isOverdue && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">Overdue</span>}
                  </div>
                  <p className="font-medium text-gray-900">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{task.company?.name} · {task.category?.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Requested by {task.createdBy?.name}</p>
                  {task.deadline && (
                    <p className={`text-xs mt-1 font-medium ${isOverdue ? "text-red-600" : "text-orange-600"}`}>
                      Due: {formatDate(task.deadline)}
                    </p>
                  )}
                </div>
                <StatusBadge status={task.status as RequestStatus} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
