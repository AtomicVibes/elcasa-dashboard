import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;
let warningEmitted = false;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NEXT_PHASE === 'phase-production-build' && !warningEmitted) {
      warningEmitted = true;
      console.warn('[Supabase] Keys missing during build phase.');
    }

    throw new Error('Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY) not set.');
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  console.log("Auth: Success");
  return client;
}
