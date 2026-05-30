import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

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

  const log =
    typeof console !== 'undefined'
      ? (msg: string) => console.log(msg)
      : () => {};

  log(
    `[Supabase] Initializing client` +
      `\n  URL: ${supabaseUrl ? mask(supabaseUrl) : '⛔ NOT SET'}` +
      `\n  Key: ${supabaseAnonKey ? mask(supabaseAnonKey) : '⛔ NOT SET'}` +
      `\n  Environment: ${process.env.NODE_ENV ?? 'unknown'}` +
      `\n  Runtime: ${isBrowser() ? 'browser' : 'server'}`
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Supabase environment variables are missing.\n\n` +
      `  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.\n\n` +
      `  To fix this:\n` +
      `  1. Create a .env.local file in the project root:\n\n` +
      `     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
      `     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n\n` +
      `  2. Restart the dev server or rebuild.\n\n` +
      `  If deploying to Cloudflare, set these in Cloudflare Dashboard → Workers & Pages →\n` +
      `  your-project → Settings → Variables.`
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
