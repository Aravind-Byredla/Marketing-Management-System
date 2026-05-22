"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequestStatus, Priority } from "@prisma/client";
import { STATUS_LABELS } from "@/types";

const NEXT_STATUSES: Partial<Record<RequestStatus, RequestStatus[]>> = {
  PENDING: ["ASSIGNED", "CLOSED"],
  ASSIGNED: ["IN_PROGRESS", "PENDING"],
  IN_PROGRESS: ["UNDER_REVIEW", "ASSIGNED"],
  UNDER_REVIEW: ["COMPLETED", "IN_PROGRESS"],
  COMPLETED: ["CLOSED"],
};

interface Props {
  requestId: string;
  currentStatus: RequestStatus;
  currentPriority: Priority;
  currentAssigneeId?: string;
  currentDeadline?: string;
  teamMembers: { id: string; name: string; email: string }[];
}

export function AdminRequestActions({ requestId, currentStatus, currentPriority, currentAssigneeId, currentDeadline, teamMembers }: Props) {
  const router = useRouter();
  const [assigneeId, setAssigneeId] = useState(currentAssigneeId || "");
  const [priority, setPriority] = useState(currentPriority);
  const [deadline, setDeadline] = useState(currentDeadline || "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedToId: assigneeId || null, priority, deadline }),
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const handleStatusChange = async (newStatus: RequestStatus) => {
    setLoading(true);
    await fetch(`/api/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setLoading(false);
    router.refresh();
  };

  const nextStatuses = NEXT_STATUSES[currentStatus] || [];

  return (
    <div className="space-y-4">
      {/* Assignment */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="font-semibold text-gray-900 text-sm">Assignment</h3>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Assign To</label>
          <select
            value={assigneeId}
            onChange={e => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {teamMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Priority</label>
          <div className="flex gap-2">
            {(["LOW", "MEDIUM", "HIGH"] as Priority[]).map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  priority === p
                    ? p === "HIGH" ? "border-red-500 bg-red-50 text-red-700"
                      : p === "MEDIUM" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                      : "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-500"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1.5">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          }`}
        >
          {saved ? "✓ Saved!" : loading ? "Saving..." : "Save Assignment"}
        </button>
      </div>

      {/* Status Actions */}
      {nextStatuses.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <h3 className="font-semibold text-gray-900 text-sm">Move Status</h3>
          {nextStatuses.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              disabled={loading}
              className="w-full py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              → {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
