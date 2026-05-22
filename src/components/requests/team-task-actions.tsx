"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RequestStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/types";

const TEAM_TRANSITIONS: Partial<Record<RequestStatus, RequestStatus>> = {
  ASSIGNED: "IN_PROGRESS",
  IN_PROGRESS: "UNDER_REVIEW",
};

const ACTION_LABELS: Partial<Record<RequestStatus, string>> = {
  ASSIGNED: "🚀 Start Working",
  IN_PROGRESS: "📤 Submit for Review",
};

const ACTION_COLORS: Partial<Record<RequestStatus, string>> = {
  ASSIGNED: "bg-blue-600 hover:bg-blue-700 text-white",
  IN_PROGRESS: "bg-purple-600 hover:bg-purple-700 text-white",
};

export function TeamTaskActions({ taskId, currentStatus }: { taskId: string; currentStatus: RequestStatus }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const nextStatus = TEAM_TRANSITIONS[currentStatus];

  const handleAction = async () => {
    if (!nextStatus) return;
    setLoading(true);
    await fetch(`/api/requests/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setDone(true);
    setLoading(false);
    setTimeout(() => router.refresh(), 500);
  };

  return (
    <div className="space-y-4">
      {/* Current status */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-3">Current Status</h3>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-sm font-medium text-gray-700">{STATUS_LABELS[currentStatus]}</p>
        </div>
      </div>

      {/* Action button */}
      {nextStatus && ACTION_LABELS[currentStatus] && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">Update Progress</h3>
          <button
            onClick={handleAction}
            disabled={loading || done}
            className={`w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 ${
              done ? "bg-green-600 text-white" : ACTION_COLORS[currentStatus]
            }`}
          >
            {done ? "✓ Updated!" : loading ? "Updating..." : ACTION_LABELS[currentStatus]}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            → Will move to <strong>{STATUS_LABELS[nextStatus]}</strong>
          </p>
        </div>
      )}

      {/* Completed state */}
      {currentStatus === "UNDER_REVIEW" && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-medium text-purple-800">Under Review</p>
          <p className="text-xs text-purple-600 mt-1">Waiting for manager verification</p>
        </div>
      )}

      {currentStatus === "COMPLETED" && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-2xl mb-2">✅</p>
          <p className="text-sm font-medium text-green-800">Task Completed!</p>
          <p className="text-xs text-green-600 mt-1">Great work!</p>
        </div>
      )}

      {currentStatus === "CLOSED" && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
          <p className="text-2xl mb-2">🔒</p>
          <p className="text-sm font-medium text-gray-700">Request Closed</p>
        </div>
      )}
    </div>
  );
}
