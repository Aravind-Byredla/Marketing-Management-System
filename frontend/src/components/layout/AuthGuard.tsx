"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Loader2 } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
