'use client';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

function mask(value: string): string {
  if (value.length <= 8) return '***';
  return value.slice(0, 4) + '****' + value.slice(-4);
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase environment variables are missing.\n\n' +
      '  NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.\n\n' +
      '  To fix this:\n' +
      '  1. Create a .env.local file in the project root:\n\n' +
      '     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
      '     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here\n\n' +
      '  2. Restart the dev server.\n\n' +
      '  If deploying to Cloudflare, set these in Cloudflare Dashboard \u2192 Workers & Pages \u2192\n' +
      '  your-project \u2192 Settings \u2192 Variables.'
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(
      `[Supabase] Initializing client` +
        `\n  URL: ${mask(supabaseUrl)}` +
        `\n  Key: ${mask(supabaseAnonKey)}`
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
