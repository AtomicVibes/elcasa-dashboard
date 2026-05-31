'use client';

import { useEffect, useRef } from 'react';
import { authManager } from '@/lib/auth/auth-manager';
import { getSupabase } from '@/lib/auth/supabase-client';
import { authLog } from '@/lib/auth/types';

// ── Configuration ────────────────────────────────────────────────────────
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_MS = 30 * 1000;               // minimum gap between redirects

/**
 * AuthHeartbeat — zero-visual-footprint component.
 *
 * Mount once in the root layout. It performs two responsibilities:
 *
 * 1. **Version check** on mount — compares the client-side session-version
 *    cookie against the deployment constant.  On mismatch, all stale auth
 *    cookies are purged (forces re-authentication after a major deploy).
 *
 * 2. **Periodic session validation** — calls `getSession()` every 5 minutes.
 *    If the session is missing or expired, the auth-manager triggers a
 *    graceful reset (toast + redirect to /auth).  Network errors are
 *    silently logged and do NOT redirect.
 *
 * Because this component returns `null`, it never blocks rendering or
 * creates a blank-screen state.
 */
export function AuthHeartbeat() {
  // Track last redirect time to avoid rapid-fire loops
  const lastRedirectRef = useRef(0);

  useEffect(() => {
    // ── Phase 1: version check on mount ──────────────────────────
    const wasReset = !authManager.checkCookieVersion();
    if (wasReset) {
      authLog('heartbeat-version-reset', {
        message: 'Session version mismatch — stale cookies purged',
      });
      // After purge, we don't redirect here; the user will be caught
      // by the middleware on next navigation.
    }

    // ── Phase 2: periodic heartbeat ──────────────────────────────
    const intervalId = setInterval(async () => {
      try {
        const now = Date.now();

        // Rate-limit redirects
        if (now - lastRedirectRef.current < COOLDOWN_MS) return;

        const { data, error } = await getSupabase().auth.getSession();

        if (error) {
          await authManager.handleError(error, 'heartbeat-getSession');
          lastRedirectRef.current = Date.now();
          return;
        }

        if (!data.session) {
          await authManager.handleError(
            { status: 401, message: 'Session missing on heartbeat check' },
            'heartbeat-no-session',
          );
          lastRedirectRef.current = Date.now();
          return;
        }

        // Session is valid — nothing to do
      } catch (error) {
        // Network errors are logged but do NOT trigger a redirect
        if (error instanceof TypeError && error.message.includes('fetch')) {
          authLog('heartbeat-network', {
            message: 'Network unavailable during heartbeat check',
          });
          return;
        }

        // Unexpected errors — log and surface
        authLog('heartbeat-error', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
