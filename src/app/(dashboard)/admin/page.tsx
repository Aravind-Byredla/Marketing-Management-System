import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const [total, pending, assigned, inProgress, users, recent] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: "PENDING" } }),
    prisma.request.count({ where: { status: "ASSIGNED" } }),
    prisma.request.count({ where: { status: "IN_PROGRESS" } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: true, company: true, createdBy: true, assignedTo: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Manage all requests and assignments</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={total} icon="📋" color="bg-blue-50" />
        <StatCard label="Pending Review" value={pending} icon="⏳" color="bg-yellow-50" />
        <StatCard label="Assigned" value={assigned} icon="👤" color="bg-purple-50" />
        <StatCard label="Active Users" value={users} icon="👥" color="bg-green-50" />
      </div>

      {/* Requests needing attention */}
      {pending > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-yellow-800">{pending} request{pending > 1 ? "s" : ""} waiting for assignment</p>
              <p className="text-sm text-yellow-700">Review and assign to team members</p>
            </div>
          </div>
          <Link href="/admin/requests?status=PENDING" className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
            Review Now
          </Link>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">All Recent Requests</h2>
          <Link href="/admin/requests" className="text-sm text-blue-600 hover:text-blue-700">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No requests yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((req) => (
              <Link key={req.id} href={`/admin/requests/${req.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{req.requestId}</span>
                    <PriorityBadge priority={req.priority} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {req.company.name} · By {req.createdBy.name}
                    {req.assignedTo && ` · Assigned to ${req.assignedTo.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <StatusBadge status={req.status} />
                  <span className="text-xs text-gray-400">{formatDate(req.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
