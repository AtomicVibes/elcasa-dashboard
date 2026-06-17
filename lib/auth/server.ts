import { createNeonAuth } from '@neondatabase/auth/next/server';

type Auth = ReturnType<typeof createNeonAuth>;

let authInstance: Auth | null = null;

function getBaseUrl(): string | null {
  return process.env.NEON_AUTH_BASE_URL ?? null;
}

function getCookieSecret(): string | null {
  return process.env.NEON_AUTH_COOKIE_SECRET ?? null;
}

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function resolveAuth(): Auth {
  if (!authInstance) {
    const baseUrl = getBaseUrl();
    const cookieSecret = getCookieSecret();
    if (!baseUrl || !cookieSecret) {
      if (isBuildPhase()) {
        return createBuildStub();
      }
      throw new Error(
        'Missing Neon Auth env vars: NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET must be set.',
      );
    }
    authInstance = createNeonAuth({
      baseUrl,
      cookies: { secret: cookieSecret },
    });
  }
  return authInstance;
}

function createBuildStub(): Auth {
  const ok = () => new Response(null, { status: 200 });
  return new Proxy({} as Auth, {
    get(_target, prop: keyof Auth) {
      if (prop === 'handler') {
        return () => ({ GET: ok, POST: ok, PUT: ok, PATCH: ok, DELETE: ok });
      }
      if (prop === 'middleware') {
        return () => (req: Request) => req;
      }
      return async () => ({ error: new Error('Auth not yet configured') });
    },
  });
}

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return resolveAuth()[prop as keyof Auth];
  },
});
