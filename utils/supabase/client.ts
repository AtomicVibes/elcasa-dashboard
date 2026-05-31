import { createBrowserClient } from '@supabase/ssr';

/**
 * Create a Supabase client for the browser.
 *
 * Use this in client components (`'use client'`).
 * For server-side operations, use `utils/supabase/server.ts` instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
