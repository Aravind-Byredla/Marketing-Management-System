"use client";
import { Bell, Menu, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { useUnreadCount } from "@/hooks/useNotifications";
import { cn, getInitials } from "@/lib/utils";

function getBreadcrumb(pathname: string): string {
  const map: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/requests": "Requests",
    "/requests/new": "New Request",
    "/tasks": "Tasks",
    "/analytics": "Analytics",
    "/users": "Users",
    "/companies": "Companies",
    "/branches": "Branches",
    "/departments": "Departments",
    "/categories": "Categories",
    "/notifications": "Notifications",
    "/profile": "Profile",
    "/settings": "Settings",
  };
  for (const [path, label] of Object.entries(map)) {
    if (pathname.startsWith(path)) return label;
  }
  return "Marketing System";
}

export function Navbar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;
  const title = getBreadcrumb(pathname);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center gap-4 px-6 shrink-0">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-lg hover:bg-accent transition lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-muted-foreground text-sm w-48 cursor-pointer hover:bg-accent transition">
        <Search className="w-4 h-4" />
        <span>Search…</span>
        <kbd className="ml-auto text-xs font-mono bg-background px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
      </div>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative p-2 rounded-lg hover:bg-accent transition"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>

      {/* Avatar */}
      <Link href="/profile" className="flex items-center gap-2 rounded-lg p-1 hover:bg-accent transition">
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
          {user?.full_name ? getInitials(user.full_name) : "U"}
        </div>
        <div className="hidden sm:block text-sm">
          <p className="font-medium leading-none">{user?.full_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{user?.role?.replace(/_/g, " ")}</p>
        </div>
      </Link>
    </header>
  );
}
