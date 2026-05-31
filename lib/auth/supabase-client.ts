import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { authManager } from './auth-manager';
import { type QueryResult, type AuthError, authLog, isBrowser } from './types';

// ── Singleton instance ───────────────────────────────────────────────────
let client: SupabaseClient | null = null;

// ── URL-safe origin for fetch interceptor logging ─────────────────────────
function maskUrl(url: string): string {
  try {
    const u = new URL(url);
    const key = u.searchParams.get('apikey');
    if (key) u.searchParams.set('apikey', key.slice(0, 4) + '****');
    return u.pathname + u.search;
  } catch {
    return url.length > 80 ? url.slice(0, 80) + '…' : url;
  }
}

// ── Intercepting fetch wrapper ───────────────────────────────────────────
// Detects 401/403 responses from Supabase REST/API endpoints and triggers
// the auth-manager's graceful session reset.
//
// Auth endpoints (/auth/v1/*) are excluded to avoid intercepting login,
// signup, and token-refresh calls that naturally produce 4xx during
// normal flow (e.g. wrong password → 400).
function createInterceptingFetch(): typeof fetch {
  const baseFetch = globalThis.fetch.bind(globalThis);

  return async (input, init) => {
    const response = await baseFetch(input, init);

    if (response.status === 401 || response.status === 403) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      const pathname = url ? new URL(url).pathname : '';

      // Exclude auth-method calls (sign-in, sign-up, token refresh, MFA)
      const isAuthEndpoint =
        pathname.includes('/auth/v1/') && !pathname.includes('/auth/v1/user');

      // Exclude callback URL patterns (exchangeCodeForSession)
      const isOAuthCallback = pathname.includes('callback') || pathname.includes('token?');

      if (!isAuthEndpoint && !isOAuthCallback) {
        // Fire-and-forget: reset will handle dedup via internal lock
        authLog('fetch-interceptor-401', {
          status: response.status,
          path: maskUrl(url),
        });

        // Defer to avoid React render-cycle conflicts
        setTimeout(() => {
          authManager.handleError(
            { status: response.status, message: response.status === 401 ? 'Unauthorized' : 'Forbidden' },
            `fetch:${response.status}`,
          );
        }, 0);
      }
    }

    return response;
  };
}

// ── Supabase client factory (enhanced) ───────────────────────────────────
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const msg =
      'Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) not set.';
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('[Supabase]', msg);
      // Return a noop client during build to prevent crashes
      client = createClient('https://placeholder.supabase.co', 'placeholder-key');
      return client;
    }
    throw new Error(msg);
  }

  authLog('init', {
    env: process.env.NODE_ENV ?? 'unknown',
    runtime: isBrowser() ? 'browser' : 'server',
  });

  client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: createInterceptingFetch(),
    },
  });

  return client;
}

// ── Helper: wrap any Supabase response in a typed QueryResult ────────────
// Usage:
//   const result = await wrapQuery(supabase.from('profiles').select('*'));
//   if (!result.ok) { /* result.error is an AuthError */ }
export async function wrapQuery<T>(
  promise: PromiseLike<{ data: T | null; error: unknown }>,
): Promise<QueryResult<T>> {
  try {
    const { data, error } = await promise;

    if (error) {
      const authError = authManager.classifyError(error);
      return { ok: false, data: null, error: authError };
    }

    return { ok: true, data: data as T, error: null };
  } catch (error) {
    const authError = authManager.classifyError(error);
    return { ok: false, data: null, error: authError };
  }
}
