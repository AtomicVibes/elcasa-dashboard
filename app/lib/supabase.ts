import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let warningEmitted = false;

function mask(value: string): string {
  if (value.length <= 8) return '***';
  return value.slice(0, 4) + '****' + value.slice(-4);
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NEXT_PHASE === 'phase-production-build' && !warningEmitted) {
      warningEmitted = true;
      console.warn(
        '[Supabase] Keys missing during build phase.\n' +
        '  This is expected if deploying to Cloudflare without build-time env injection.\n' +
        '  Set .env.local locally and ensure deployment platform has these variables.'
      );
    }

    throw new Error(
      'Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) are not set.\n' +
      '  - Local dev: create .env.local with these values.\n' +
      '  - Cloudflare: set them in Dashboard → Workers & Pages → project → Settings → Variables.\n' +
      '  - Build CI: pass them as --build-env arguments or set in CI secrets.'
    );
  }

  if (typeof console !== 'undefined') {
    console.log(
      `[Supabase] Initializing client` +
      `\n  URL: ${mask(supabaseUrl)}` +
      `\n  Key: ${mask(supabaseAnonKey)}` +
      `\n  Env: ${process.env.NODE_ENV ?? 'unknown'}` +
      `\n  Runtime: ${isBrowser() ? 'browser' : 'server'}`
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
