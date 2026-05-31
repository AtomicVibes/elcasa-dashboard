import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  // ── Log raw Cookie header ──────────────────────────────────────────────
  // Ground truth: if sb- cookies are missing here, the browser never received
  // or never sent them.
  const rawHeader = request.headers.get('cookie') ?? '(none)';
  const parts = rawHeader.split(';').map(s => s.trim()).filter(Boolean);
  const sbParts = parts.filter(c => c.startsWith('sb-'));

  console.log('[Middleware] COOKIE_HEADER', {
    rawLength: rawHeader.length,
    total: parts.length,
    names: parts.map(c => c.split('=')[0]),
    sbCount: sbParts.length,
    hasSbCookies: sbParts.length > 0,
    preview: sbParts.slice(0, 3).map(c => `${c.slice(0, 55)}...`),
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Middleware] Missing Supabase env — bypassing auth');
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        }
      },
    },
    cookieOptions: {
      sameSite: 'lax',
      secure: true,
      path: '/',
      httpOnly: true,
    },
  });

  // ── Phase 1: getSession() — reads from cookie, zero network I/O ────────
  const { data: { session } } = await supabase.auth.getSession();

  let user = session?.user ?? null;

  // ── Phase 2: getUser() — verifies token with Supabase Auth API ─────────
  // If this fails (network error, timeout), we fail OPEN and trust the
  // session cookie rather than creating a redirect loop.
  if (session?.user) {
    const { data: { user: verified }, error } = await supabase.auth.getUser();
    if (verified) {
      user = verified;
    } else {
      console.warn('[Middleware] getUser() failed — fail open, trusting session cookie', {
        error: error?.message,
      });
    }
  }

  const isAuthPage = pathname === '/' || pathname.startsWith('/auth');
  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/onboarding');

  if (user && isAuthPage) {
    console.log('[Middleware] Authenticated on auth page → redirect /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!user && isProtected) {
    console.log('[Middleware] No session on protected page → redirect /auth');
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  console.log('[Middleware] EXIT', {
    pathname,
    hasUser: !!user,
    duration: `${Date.now() - startTime}ms`,
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|auth/callback|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
