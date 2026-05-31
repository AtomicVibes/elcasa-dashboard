import type { SupabaseClient } from '@supabase/supabase-js';

// ── Session Versioning ───────────────────────────────────────────────────
// Bump this constant on each major deployment to force all users to
// re-authenticate (invalidates stale client-side caches).
export const APP_SESSION_VERSION = 1;

// Cookie name that persists the version on the client
export const VERSION_COOKIE = 'elcasa-session-v';

// ── Error Categories ─────────────────────────────────────────────────────
export type AuthErrorCategory =
  | 'network'        // fetch failed, timeout, DNS — show retry, do NOT redirect
  | 'policy'         // 403 — RLS or permission denied, redirect to login
  | 'session_expired' // 401 — token expired / refresh failed, redirect to login
  | 'unknown';       // catch-all

// ── AuthError — typed Domain Error ───────────────────────────────────────
export class AuthError extends Error {
  public readonly category: AuthErrorCategory;
  public readonly status: number | null;
  public readonly timestamp: number;

  constructor(
    message: string,
    category: AuthErrorCategory,
    status: number | null = null,
  ) {
    super(message);
    this.name = 'AuthError';
    this.category = category;
    this.status = status;
    this.timestamp = Date.now();
  }
}

// ── Result wrapper for every Supabase data call ──────────────────────────
export type QueryResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: AuthError };

// ── Snapshot of auth state (serialisable, no class instances) ────────────
export interface AuthStateSnapshot {
  userId: string | null;
  email: string | null;
  role: string | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
}

// ── Logger scoped to auth operations ─────────────────────────────────────
export function authLog(context: string, payload: Record<string, unknown>): void {
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log(`[Auth:${context}]`, payload);
  }
}

// ── Cookie helpers (client-only, safe to call on server) ─────────────────
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function getCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

export function setCookie(name: string, value: string, days: number): void {
  if (!isBrowser()) return;
  const maxAge = days * 86400;
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
}

export function deleteCookie(name: string): void {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

export function purgeAuthCookies(): void {
  if (!isBrowser()) return;
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('sb-') || name.startsWith('elcasa-session-v')) {
      deleteCookie(name);
    }
  }
}

// ── Re-export Supabase client type ───────────────────────────────────────
export type { SupabaseClient };
