'use client';

import { useEffect, useRef } from 'react';
import { authClient } from '@/lib/auth/client';

const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;
const COOLDOWN_MS = 30 * 1000;

export function AuthHeartbeat() {
  const lastRedirectRef = useRef(0);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        const now = Date.now();
        if (now - lastRedirectRef.current < COOLDOWN_MS) return;

        const { data, error } = await authClient.getSession();

        if (error) {
          lastRedirectRef.current = Date.now();
          return;
        }

        if (!data) {
          lastRedirectRef.current = Date.now();
          return;
        }
      } catch {
        // Network errors — silently ignored
      }
    }, HEARTBEAT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  return null;
}
