"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@prisma/client";

const managerLinks = [
  { href: "/manager", label: "Dashboard", icon: "📊" },
  { href: "/manager/requests", label: "My Requests", icon: "📋" },
  { href: "/manager/requests/new", label: "New Request", icon: "➕" },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/requests", label: "All Requests", icon: "📋" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

const teamLinks = [
  { href: "/team", label: "Dashboard", icon: "📊" },
  { href: "/team/tasks", label: "My Tasks", icon: "✅" },
];

const superAdminLinks = [
  { href: "/super-admin", label: "Dashboard", icon: "📊" },
  { href: "/super-admin/users", label: "All Users", icon: "👥" },
  { href: "/super-admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/requests", label: "All Requests", icon: "📋" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function getLinks(role: Role) {
  if (role === "MANAGER") return managerLinks;
  if (role === "ADMIN") return adminLinks;
  if (role === "TEAM_MEMBER") return teamLinks;
  if (role === "SUPER_ADMIN") return superAdminLinks;
  return [];
}

const roleLabels: Record<Role, string> = {
  MANAGER: "Manager",
  ADMIN: "Admin",
  TEAM_MEMBER: "Team Member",
  SUPER_ADMIN: "Super Admin",
};

const roleBadgeColors: Record<Role, string> = {
  MANAGER: "bg-blue-100 text-blue-700",
  ADMIN: "bg-purple-100 text-purple-700",
  TEAM_MEMBER: "bg-green-100 text-green-700",
  SUPER_ADMIN: "bg-red-100 text-red-700",
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const links = getLinks(role);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">MBRMS</p>
            <p className="text-xs text-gray-500">Marketing & Branding</p>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3 border-b border-gray-100">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleBadgeColors[role]}`}>
          {roleLabels[role]}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
        >
          <span>🚪</span>
          Sign Out
        </Link>
      </div>
    </aside>
  );
}
