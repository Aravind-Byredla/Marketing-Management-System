"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Tag,
  Users,
  GitBranch,
  CheckSquare,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { useUIStore } from "@/store/ui.store";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"] },
  { label: "Requests", href: "/requests", icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER"] },
  { label: "My Tasks", href: "/tasks", icon: CheckSquare, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"] },
  { label: "Analytics", href: "/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Users", href: "/users", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Companies", href: "/companies", icon: Building2, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Branches", href: "/branches", icon: GitBranch, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Departments", href: "/departments", icon: FolderOpen, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Categories", href: "/categories", icon: Tag, roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Notifications", href: "/notifications", icon: Bell, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"] },
  { label: "Profile", href: "/profile", icon: User, roles: ["SUPER_ADMIN", "ADMIN", "MANAGER", "TEAM_MEMBER"] },
  { label: "Settings", href: "/settings", icon: Settings, roles: ["SUPER_ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth, refreshToken } = useAuthStore((s) => ({
    user: s.user,
    clearAuth: s.clearAuth,
    refreshToken: s.refreshToken,
  }));
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const userRole = user?.role as UserRole | undefined;
  const visibleItems = navItems.filter((item) => !userRole || item.roles.includes(userRole));

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {}
    clearAuth();
    router.push("/login");
    toast.success("Logged out successfully.");
  };

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 72 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-full bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center justify-center w-9 h-9 bg-primary rounded-xl shrink-0">
          <Megaphone className="w-5 h-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="text-sidebar-foreground font-bold text-sm leading-tight whitespace-nowrap"
            >
              Marketing &<br />Branding
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-10 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto px-2">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-3">
        {sidebarOpen ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">
              {user?.full_name?.charAt(0) ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-xs font-medium truncate">{user?.full_name}</p>
              <p className="text-sidebar-foreground/50 text-xs truncate">{user?.role?.replace("_", " ")}</p>
            </div>
            <button onClick={handleLogout} className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full p-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.aside>
  );
}
