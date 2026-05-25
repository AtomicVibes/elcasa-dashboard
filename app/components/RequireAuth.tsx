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

  if (loading) return null;
  if (!session) return null;

  return <>{children}</>;
}

