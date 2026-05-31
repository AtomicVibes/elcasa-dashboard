"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/auth");
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#131313]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-300 border-t-[#FFC107]" />
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
