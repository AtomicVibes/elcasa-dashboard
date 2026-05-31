"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session, loading, authError } = useAuth();

  useEffect(() => {
    console.log("[REQUIRE_AUTH_TRACE] useEffect", { loading, hasSession: !!session, authError });
    if (loading) return;
    if (!session && !authError) {
      console.log("[REQUIRE_AUTH_TRACE] No session — redirecting to /auth");
      router.replace("/auth");
    }
  }, [loading, session, authError, router]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#131313]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-4">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            {authError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-[#FFC107] text-zinc-950 rounded-xl text-sm font-bold hover:bg-[#e5a500] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
