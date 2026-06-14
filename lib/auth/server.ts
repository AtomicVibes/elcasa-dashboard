import { createNeonAuth } from '@neondatabase/auth/next/server';

const baseUrl = process.env.NEON_AUTH_BASE_URL;
const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;

if (!baseUrl || !cookieSecret) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Build phase — skip auth validation; middleware/handler will be noop
  } else {
    throw new Error(
      'Missing Neon Auth env vars: NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set.',
    );
  }
}

export const auth = createNeonAuth({
  baseUrl: baseUrl ?? 'https://placeholder.neonauth.local/neondb/auth',
  cookies: {
    secret: cookieSecret ?? 'placeholder-secret-at-least-32-characters-long!!',
  },
});
