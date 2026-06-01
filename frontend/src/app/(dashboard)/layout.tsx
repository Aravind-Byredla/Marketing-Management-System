import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden bg-muted/30">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
