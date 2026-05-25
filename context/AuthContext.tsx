"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";

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
    const { data, error } = await supabase
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

  const loadSessionAndRole = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.getSession();
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
    loadSessionAndRole();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event: string, nextSession: Session | null) => {

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
      sub.subscription.unsubscribe();
    };
  }, [loadSessionAndRole]);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
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
      const { data, error } = await supabase.auth.signUp({
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
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      permissionRole,
      loading,
      supabase,
      signIn,
      signUp,
      signOut,
    }),
    [user, session, permissionRole, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

