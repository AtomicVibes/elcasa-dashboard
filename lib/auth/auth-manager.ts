import toast from 'react-hot-toast';
import {
  AuthError,
  type AuthErrorCategory,
  APP_SESSION_VERSION,
  VERSION_COOKIE,
  getCookie,
  setCookie,
  purgeAuthCookies,
  isBrowser,
  authLog,
} from './types';

// ── Singleton ────────────────────────────────────────────────────────────
class AuthManager {
  private static instance: AuthManager;
  private resetLock = false;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // ── Version check (run once on app mount) ─────────────────────────
  // If the client-side version cookie does not match the deployment
  // build constant, all stale auth cookies are purged, forcing every
  // user to re-authenticate after a major deployment.
  checkCookieVersion(): boolean {
    if (!isBrowser()) return true;

    const stored = getCookie(VERSION_COOKIE);
    if (stored !== String(APP_SESSION_VERSION)) {
      authLog('version-mismatch', {
        stored: stored ?? '(none)',
        expected: APP_SESSION_VERSION,
        action: 'purging stale auth cookies',
      });
      purgeAuthCookies();
      setCookie(VERSION_COOKIE, String(APP_SESSION_VERSION), 365);
      return false; // was reset
    }
    return true; // version matches
  }

  // ── Error classification ──────────────────────────────────────────
  // Differentiates between network failures (retriable, no redirect)
  // and auth failures (session_expired / policy → redirect to login).
  classifyError(error: unknown): AuthError {
    if (error instanceof AuthError) return error;

    // Network-level failures
    if (
      error instanceof TypeError &&
      (error.message === 'Failed to fetch' ||
        error.message === 'NetworkError when attempting to fetch resource')
    ) {
      return new AuthError('Network request failed', 'network');
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return new AuthError('Request timed out', 'network');
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new AuthError('Network request failed', 'network');
    }

    // Supabase AuthError shape (from @supabase/supabase-js)
    if (error && typeof error === 'object' && '__isAuthError' in error) {
      const supErr = error as {
        status?: number;
        message?: string;
        code?: string;
      };

      if (supErr.status === 401) {
        return new AuthError(
          supErr.message ?? 'Not authenticated',
          'session_expired',
          401,
        );
      }
      if (supErr.status === 403) {
        return new AuthError(
          supErr.message ?? 'Access denied',
          'policy',
          403,
        );
      }

      // Token-specific error codes from Supabase Auth
      if (
        supErr.code === 'refresh_token_not_found' ||
        supErr.code === 'session_expired' ||
        supErr.code === 'bad_jwt'
      ) {
        return new AuthError(
          supErr.message ?? 'Session expired',
          'session_expired',
        );
      }
    }

    // Plain HTTP status codes (from fetch interceptors, API routes)
    const status =
      (error as Record<string, unknown>)?.status ??
      (error as Record<string, unknown>)?.code ??
      null;

    if (status === 401) {
      return new AuthError('Session expired', 'session_expired', 401);
    }
    if (status === 403) {
      return new AuthError('Forbidden — access denied', 'policy', 403);
    }

    // Catch-all
    const message =
      error instanceof Error
        ? error.message
        : String(error ?? 'Unknown auth error');
    return new AuthError(message, 'unknown');
  }

  // ── Handle error in application context ────────────────────────────
  // Network errors are surfaced (toast) but do NOT redirect.
  // Policy / session_expired errors trigger graceful session reset.
  async handleError(
    error: unknown,
    context = 'general',
  ): Promise<void> {
    const authErr = this.classifyError(error);

    authLog(context, {
      category: authErr.category,
      status: authErr.status,
      message: authErr.message,
      timestamp: authErr.timestamp,
    });

    switch (authErr.category) {
      case 'network':
        toast.error('Connection lost. Please check your network.', {
          id: 'auth-network-error',
          duration: 4000,
        });
        // Do NOT redirect — let the UI show retry controls
        break;

      case 'session_expired':
      case 'policy':
        await this.resetSession(authErr);
        break;

      case 'unknown':
        toast.error('An unexpected error occurred. Please try again.', {
          id: 'auth-unknown-error',
          duration: 5000,
        });
        break;
    }
  }

  // ── Graceful session reset (atomic) ────────────────────────────────
  private async resetSession(error: AuthError): Promise<void> {
    // Prevent concurrent resets (e.g. multiple 401s in a batch)
    if (this.resetLock) return;
    this.resetLock = true;

    authLog('reset-start', {
      category: error.category,
      reason: error.message,
    });

    // 1. Attempt polite signout (best-effort, ignore failure)
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && key) {
        const client = createClient(url, key);
        await client.auth.signOut();
      }
    } catch {
      // Network may be down; proceed with local cleanup anyway
    }

    // 2. Purge ALL auth cookies from the browser
    purgeAuthCookies();

    // 3. Clear client-side storage
    try {
      sessionStorage.clear();
    } catch {
      // Not available (private browsing, etc.)
    }

    // 4. Show toast BEFORE redirect (prevents blank screen — user sees the toast)
    const messages: Record<AuthErrorCategory, string> = {
      session_expired: 'Session expired. Please sign in again.',
      policy: 'Access denied. Contact your administrator.',
      network: '',
      unknown: '',
    };

    toast.error(messages[error.category] ?? 'Session expired. Please sign in again.', {
      id: 'auth-reset',
      duration: 6000,
    });

    // 5. Redirect to login with error context
    if (isBrowser()) {
      const searchParams = new URLSearchParams({
        reason: error.category,
      });
      if (error.message && error.message.length < 200) {
        searchParams.set('message', error.message);
      }
      // Use replace to avoid history pollution
      window.location.replace(`/auth?${searchParams.toString()}`);
    }
  }

  // ── Validate session (called by heartbeat) ─────────────────────────
  // Returns false if session is invalid and redirect has been triggered.
  async validateSession(): Promise<boolean> {
    if (!isBrowser()) return true;

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return true;

      const client = createClient(url, key);
      const { data, error } = await client.auth.getSession();

      if (error) {
        await this.handleError(error, 'heartbeat-getSession');
        return false;
      }

      if (!data.session) {
        await this.handleError(
          new AuthError('No session found', 'session_expired'),
          'heartbeat-no-session',
        );
        return false;
      }

      return true;
    } catch (error) {
      // Network error during heartbeat — do NOT redirect, just log
      authLog('heartbeat-network-error', {
        message: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}

export const authManager = AuthManager.getInstance();
