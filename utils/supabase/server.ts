import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Create a Supabase client for Server Components, Route Handlers,
 * and Server Actions.
 *
 * Uses `cookies()` from `next/headers` which works in both the Edge
 * Runtime and Node.js runtime.
 *
 * IMPORTANT: This should NOT be used in middleware.  Middleware/proxy
 * must use the `request.cookies` pattern (see middleware.ts / src/proxy.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        },
      },
    },
  );
}
