"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "@/lib/auth/client";

export type PermissionRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUPER_USER"
  | "USER";

type AuthContextValue = {
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  } | null;
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
  } | null;
  permissionRole: PermissionRole | null;
  loading: boolean;
  authError: string | null;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);



async function fetchPermissionRole(userId: string): Promise<PermissionRole> {
  try {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) return "USER";
    const data = await res.json();
    return (data.permissionRole as PermissionRole | undefined) ?? "USER";
  } catch {
    return "USER";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [session, setSession] = useState<AuthContextValue["session"]>(null);
  const [permissionRole, setPermissionRole] = useState<PermissionRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  async function loadSession() {
    setLoading(true);
    try {
      const { data, error } = await authClient.getSession();
      if (error) {
        setAuthError(`Session check failed: ${error.message}`);
        setSession(null);
        setUser(null);
        setPermissionRole(null);
        return;
      }
      if (!data) {
        setSession(null);
        setUser(null);
        setPermissionRole(null);
        return;
      }
      setSession(data.session);
      setUser(data.user);

      if (data.user?.id) {
        const role = await fetchPermissionRole(data.user.id);
        setPermissionRole(role);
      } else {
        setPermissionRole(null);
      }
    } catch {
      setAuthError("Could not verify authentication. Check your network connection.");
      setSession(null);
      setUser(null);
      setPermissionRole(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      permissionRole,
      loading,
      authError,
      refresh: loadSession,
    }),
    [user, session, permissionRole, loading, authError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
