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
      console.error("[Database Schema Sync Error]:", error);
      return "USER";
    }

    return (data?.permissionRole as PermissionRole | undefined) ?? "USER";
  } catch (error) {
    console.error("[Database Schema Sync Error]:", error);
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
    setAuthError(null);
    const { data, error } = await getSupabase().auth.getSession();
    if (error) {
      // eslint-disable-next-line no-console
      console.error("getSession error:", error);
    }

    const nextSession = data.session ?? null;
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (nextSession?.user?.id) {
      const role = await fetchPermissionRole(nextSession.user.id);
      setPermissionRole(role);
    } else {
      setPermissionRole(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    hangTimeoutRef.current = setTimeout(() => {
      console.error("AUTH_HANG_DETECTED");
      setAuthError("Authentication check timed out. Please refresh the page.");
      setLoading(false);
    }, 5000);

    loadSessionAndRole().finally(() => {
      if (hangTimeoutRef.current) {
        clearTimeout(hangTimeoutRef.current);
        hangTimeoutRef.current = null;
      }
    });

    const { data: sub } = getSupabase().auth.onAuthStateChange(async (_event: string, nextSession: Session | null) => {

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user?.id) {
        const role = await fetchPermissionRole(nextSession.user.id);
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
    if (error) throw error;
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
      // We rely on DB trigger to create profiles row on signup.
      // But we still store full_name/phone_number for convenience if trigger isn't set for them.
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

      // Ensure profiles has default permissionRole; trigger should handle it.
      // Fetch role after insert.
      const role = await fetchPermissionRole(userId);
      setPermissionRole(role);

      return { userId };
    },
    []
  );

  const signOut = useCallback(async () => {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw error;
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
    [user, session, permissionRole, loading, authError, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

