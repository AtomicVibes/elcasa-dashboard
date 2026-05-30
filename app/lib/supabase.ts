'use client';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

let warned = false;

function buildEnvGuide(): string {
  const missing: string[] = [];
  const vars = [
    ['NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL],
    ['NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY],
  ] as const;

  for (const [name, val] of vars) {
    if (!val) missing.push(name);
  }

  if (missing.length === 0) return '';

  return [
    `Supabase environment variables missing: ${missing.join(', ')}.`,
    '',
    '  To fix this:',
    '  1. Create a .env.local file in the project root:',
    '',
    '     NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co',
    '     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here',
    '',
    '  2. Restart the dev server.',
    '',
    '  If these are set in Cloudflare Dashboard → Workers & Pages →',
    '  your-project → Settings → Variables, add them there for deployment.',
  ].join('\n');
}

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (!warned) {
      warned = true;
      console.error(buildEnvGuide());
    }

    return new Proxy(
      {} as unknown as SupabaseClient,
      {
        get(_target, prop) {
          if (!warned) {
            warned = true;
            console.error(buildEnvGuide());
          }
          return () => Promise.reject(new Error('Supabase not configured — see above.'));
        },
      },
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}
