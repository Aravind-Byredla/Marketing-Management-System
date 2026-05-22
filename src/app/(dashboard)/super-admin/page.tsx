import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import Link from "next/link";

export default async function SuperAdminDashboard() {
  const [totalUsers, managers, admins, teamMembers, totalRequests, companies] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "MANAGER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "TEAM_MEMBER" } }),
    prisma.request.count(),
    prisma.company.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-red-100 text-red-700",
    ADMIN: "bg-purple-100 text-purple-700",
    MANAGER: "bg-blue-100 text-blue-700",
    TEAM_MEMBER: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Full platform overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={totalUsers} icon="👥" color="bg-blue-50" />
        <StatCard label="Total Requests" value={totalRequests} icon="📋" color="bg-purple-50" />
        <StatCard label="Companies" value={companies} icon="🏢" color="bg-yellow-50" />
        <StatCard label="Team Members" value={teamMembers} icon="🛠️" color="bg-green-50" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-blue-600">{managers}</p>
          <p className="text-sm text-gray-500 mt-1">Managers</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-purple-600">{admins}</p>
          <p className="text-sm text-gray-500 mt-1">Admins</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <p className="text-3xl font-bold text-green-600">{teamMembers}</p>
          <p className="text-sm text-gray-500 mt-1">Team Members</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Users</h2>
          <Link href="/super-admin/users" className="text-sm text-blue-600 hover:text-blue-700">Manage all →</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-medium text-sm">{user.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${roleColors[user.role]}`}>
                {user.role.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
