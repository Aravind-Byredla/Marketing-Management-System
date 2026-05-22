import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [total, pending, inProgress, completed, recent] = await Promise.all([
    prisma.request.count({ where: { createdById: userId } }),
    prisma.request.count({ where: { createdById: userId, status: "PENDING" } }),
    prisma.request.count({ where: { createdById: userId, status: "IN_PROGRESS" } }),
    prisma.request.count({ where: { createdById: userId, status: "COMPLETED" } }),
    prisma.request.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, company: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {session!.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your requests</p>
        </div>
        <Link
          href="/manager/requests/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          + New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Requests" value={total} icon="📋" color="bg-blue-50" />
        <StatCard label="Pending" value={pending} icon="⏳" color="bg-yellow-50" />
        <StatCard label="In Progress" value={inProgress} icon="🔄" color="bg-purple-50" />
        <StatCard label="Completed" value={completed} icon="✅" color="bg-green-50" />
      </div>

      {/* Recent requests */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Requests</h2>
          <Link href="/manager/requests" className="text-sm text-blue-600 hover:text-blue-700">
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500 text-sm">No requests yet.</p>
            <Link href="/manager/requests/new" className="text-blue-600 text-sm hover:underline mt-1 inline-block">
              Create your first request
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recent.map((req) => (
              <Link key={req.id} href={`/manager/requests/${req.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{req.requestId}</span>
                    <PriorityBadge priority={req.priority} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{req.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{req.company.name} · {req.category.name}</p>
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
