import { prisma } from "@/lib/prisma";

export default async function AnalyticsPage() {
  const [
    totalRequests, draftCount, pendingCount, assignedCount,
    inProgressCount, underReviewCount, completedCount, closedCount,
    highPriority, mediumPriority, lowPriority,
    requestsByCompany, requestsByCategory, recentActivity
  ] = await Promise.all([
    prisma.request.count(),
    prisma.request.count({ where: { status: "DRAFT" } }),
    prisma.request.count({ where: { status: "PENDING" } }),
    prisma.request.count({ where: { status: "ASSIGNED" } }),
    prisma.request.count({ where: { status: "IN_PROGRESS" } }),
    prisma.request.count({ where: { status: "UNDER_REVIEW" } }),
    prisma.request.count({ where: { status: "COMPLETED" } }),
    prisma.request.count({ where: { status: "CLOSED" } }),
    prisma.request.count({ where: { priority: "HIGH" } }),
    prisma.request.count({ where: { priority: "MEDIUM" } }),
    prisma.request.count({ where: { priority: "LOW" } }),
    prisma.company.findMany({
      include: { _count: { select: { requests: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      include: { _count: { select: { requests: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.request.findMany({
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: { company: true, createdBy: { select: { name: true } } },
    }),
  ]);

  const statusData = [
    { label: "Draft", count: draftCount, color: "bg-gray-400" },
    { label: "Pending", count: pendingCount, color: "bg-yellow-400" },
    { label: "Assigned", count: assignedCount, color: "bg-blue-400" },
    { label: "In Progress", count: inProgressCount, color: "bg-purple-400" },
    { label: "Under Review", count: underReviewCount, color: "bg-orange-400" },
    { label: "Completed", count: completedCount, color: "bg-green-400" },
    { label: "Closed", count: closedCount, color: "bg-slate-400" },
  ];

  const completionRate = totalRequests > 0
    ? Math.round(((completedCount + closedCount) / totalRequests) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide metrics and insights</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: totalRequests, icon: "📋", color: "bg-blue-50" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: "✅", color: "bg-green-50" },
          { label: "High Priority", value: highPriority, icon: "🔴", color: "bg-red-50" },
          { label: "In Progress", value: inProgressCount, icon: "🔄", color: "bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-500 text-sm">{s.label}</p>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5">Requests by Status</h2>
        <div className="space-y-3">
          {statusData.map(s => (
            <div key={s.label} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-28 shrink-0">{s.label}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.color}`}
                  style={{ width: totalRequests > 0 ? `${(s.count / totalRequests) * 100}%` : "0%" }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-8 text-right">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* By company */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Requests by Company</h2>
          <div className="space-y-3">
            {requestsByCompany.map(c => (
              <div key={c.id} className="flex items-center justify-between">
                <p className="text-sm text-gray-700 truncate flex-1">{c.name}</p>
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div className="h-full bg-blue-400 rounded-full"
                      style={{ width: totalRequests > 0 ? `${(c._count.requests / totalRequests) * 100}%` : "0%" }} />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-6 text-right">{c._count.requests}</span>
                </div>
              </div>
            ))}
            {requestsByCompany.every(c => c._count.requests === 0) && (
              <p className="text-sm text-gray-400">No requests yet</p>
            )}
          </div>
        </div>

        {/* Priority split */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Priority Distribution</h2>
          <div className="space-y-4">
            {[
              { label: "High", count: highPriority, color: "bg-red-400", textColor: "text-red-700", bg: "bg-red-50" },
              { label: "Medium", count: mediumPriority, color: "bg-yellow-400", textColor: "text-yellow-700", bg: "bg-yellow-50" },
              { label: "Low", count: lowPriority, color: "bg-green-400", textColor: "text-green-700", bg: "bg-green-50" },
            ].map(p => (
              <div key={p.label} className={`flex items-center justify-between p-3 rounded-xl ${p.bg}`}>
                <span className={`text-sm font-medium ${p.textColor}`}>{p.label} Priority</span>
                <span className={`text-2xl font-bold ${p.textColor}`}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {recentActivity.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No activity yet</p>
          ) : recentActivity.map(r => (
            <div key={r.id} className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">{r.title}</p>
                <p className="text-xs text-gray-500">{r.company.name} · By {r.createdBy.name}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400">{r.requestId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
