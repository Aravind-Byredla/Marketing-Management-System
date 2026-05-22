import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/requests/status-badge";
import { PriorityBadge } from "@/components/requests/priority-badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function TeamDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [assigned, inProgress, completed, tasks] = await Promise.all([
    prisma.request.count({ where: { assignedToId: userId, status: "ASSIGNED" } }),
    prisma.request.count({ where: { assignedToId: userId, status: "IN_PROGRESS" } }),
    prisma.request.count({ where: { assignedToId: userId, status: "COMPLETED" } }),
    prisma.request.findMany({
      where: { assignedToId: userId, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
      orderBy: { deadline: "asc" },
      take: 8,
      include: { category: true, company: true, createdBy: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="text-gray-500 text-sm mt-1">Tasks assigned to you</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Assigned" value={assigned} icon="📥" color="bg-blue-50" />
        <StatCard label="In Progress" value={inProgress} icon="🔄" color="bg-purple-50" />
        <StatCard label="Completed" value={completed} icon="✅" color="bg-green-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Active Tasks</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🎉</p>
            <p className="text-gray-500 text-sm">No active tasks. You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <Link key={task.id} href={`/team/tasks/${task.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{task.requestId}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{task.company.name} · {task.category.name}</p>
                  {task.deadline && (
                    <p className="text-xs text-orange-600 mt-0.5">Due: {formatDate(task.deadline)}</p>
                  )}
                </div>
                <div className="ml-4">
                  <StatusBadge status={task.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
