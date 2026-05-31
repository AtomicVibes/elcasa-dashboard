"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/app/lib/supabase";
import { authManager } from "@/lib/auth/auth-manager";

export type PermissionRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "SUPER_USER"
  | "USER";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  permissionRole: PermissionRole | null;
  loading: boolean;
  authError: string | null;
  supabase: SupabaseClient;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signUp: (params: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<{ userId: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AUTH_PROFILES_TABLE = "profiles";

async function fetchPermissionRole(userId: string): Promise<PermissionRole> {
  try {
    const { data, error } = await getSupabase()
      .from(AUTH_PROFILES_TABLE)
      .select("permissionRole")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      await authManager.handleError(error, "fetchPermissionRole");
      return "USER";
    }

    return (data?.permissionRole as PermissionRole | undefined) ?? "USER";
  } catch (error) {
    await authManager.handleError(error, "fetchPermissionRole");
    return "USER";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [permissionRole, setPermissionRole] = useState<PermissionRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const hangTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadSessionAndRole = useCallback(async () => {
    setLoading(true);

    try {
      console.log("[AUTH_TRACE] BEFORE getSupabase().auth.getSession()");
      const { data, error } = await getSupabase().auth.getSession();
      console.log("[AUTH_TRACE] AFTER getSupabase().auth.getSession()", { hasSession: !!data?.session, error });

      if (error) {
        console.error("[AUTH_TRACE] getSession error:", error);
        setAuthError(`Session check failed: ${error.message}`);
        await authManager.handleError(error, "loadSession");
      }

      const nextSession = data.session ?? null;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user?.id) {
        console.log("[AUTH_TRACE] BEFORE fetchPermissionRole", { userId: nextSession.user.id });
        const role = await fetchPermissionRole(nextSession.user.id);
        console.log("[AUTH_TRACE] AFTER fetchPermissionRole", { role });
        setPermissionRole(role);
      } else {
        setPermissionRole(null);
      }
    } catch (err) {
      console.error("[AUTH_TRACE] loadSessionAndRole threw", {
        name: (err as Error)?.name,
        message: (err as Error)?.message,
      });
      setAuthError("Could not verify authentication. Check your network connection.");
      setSession(null);
      setUser(null);
      setPermissionRole(null);
    } finally {
      setLoading(false);
      console.log("[AUTH_TRACE] loadSessionAndRole END — loading set to false");
    }
  }, []);

  useEffect(() => {
    hangTimeoutRef.current = setTimeout(() => {
      console.error("[AUTH_TRACE] AUTH_HANG_DETECTED — 12s timeout fired, forcing loading=false (session might be stale, letting user see the page)");
      setLoading(false);
    }, 12000);
    console.log("[AUTH_TRACE] hangTimeout set for 12000ms — session will be checked on next navigation if still null");

    const { data: sub } = getSupabase().auth.onAuthStateChange(async (_event: string, nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user?.id) {
        console.log("[AUTH_TRACE] onAuthStateChange BEFORE fetchPermissionRole", { userId: nextSession.user.id });
        const role = await fetchPermissionRole(nextSession.user.id);
        console.log("[AUTH_TRACE] onAuthStateChange AFTER fetchPermissionRole", { role });
        setPermissionRole(role);
      } else {
        setPermissionRole(null);
      }
    });

    return () => {
      if (hangTimeoutRef.current) {
        clearTimeout(hangTimeoutRef.current);
        hangTimeoutRef.current = null;
      }
      sub.subscription.unsubscribe();
    };
  }, [loadSessionAndRole]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) {
      const authErr = authManager.classifyError(error);
      // Only throw session_expired/policy — let the manager redirect
      if (authErr.category === 'session_expired' || authErr.category === 'policy') {
        await authManager.handleError(error, 'signIn');
      }
      throw error;
    }
  }, []);

  const signUp = useCallback(
    async ({
      fullName,
      email,
      phoneNumber,
      password,
    }: {
      fullName: string;
      email: string;
      phoneNumber: string;
      password: string;
    }) => {
      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
          },
        },
      });

      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) return { userId: "" };

      const role = await fetchPermissionRole(userId);
      setPermissionRole(role);

      return { userId };
    },
    [],
  );

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) {
      const authErr = authManager.classifyError(error);
      if (authErr.category === 'policy' || authErr.category === 'session_expired') {
        await authManager.handleError(error, 'signOut');
        return;
      }
      throw error;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      permissionRole,
      loading,
      authError,
      supabase: getSupabase(),
      signIn,
      signUp,
      signOut,
    }),
    [user, session, permissionRole, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

