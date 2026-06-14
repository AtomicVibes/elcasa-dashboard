import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ── Asset path patterns (checked BEFORE any Supabase code runs) ──────────
const ASSET_RE = /\.(?:ico|svg|png|jpg|jpeg|gif|webp|avif|woff2?|ttf|eot|otf|css|js|json|xml|map)$/i;
const ASSET_PREFIXES = ['/_next/static/', '/_next/image/', '/api/', '/auth/callback'];

function isAssetPath(pathname: string): boolean {
  if (pathname === '/favicon.ico') return true;
  if (ASSET_RE.test(pathname)) return true;
  return ASSET_PREFIXES.some(p => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Early asset bypass (belt-and-suspenders with config.matcher) ─────
  if (isAssetPath(pathname)) {
    console.log('[Middleware] ASSET_BYPASS', { pathname });
    return NextResponse.next();
  }

  const startTime = Date.now();

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
          try {
            request.cookies.set(name, value);
          } catch {
            // Cloudflare Workers may freeze request.cookies — swallow
          }
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
  let session;
  try {
    const result = await supabase.auth.getSession();
    session = result.data.session;
  } catch (err) {
    console.error('[Middleware] getSession() threw', {
      message: (err as Error).message,
    });
    return NextResponse.next();
  }

  let user = session?.user ?? null;

  // ── Phase 2: getUser() — network call to verify token ─────────────────
  // Protected by try-catch: if Supabase Auth API is unreachable or the
  // Worker CPU limit is exceeded, we fail OPEN rather than 500.
  if (session?.user) {
    try {
      const { data: { user: verified }, error } = await supabase.auth.getUser();
      if (verified) {
        user = verified;
      } else {
        console.warn('[Middleware] getUser() failed — fail open', {
          error: error?.message,
        });
      }
    } catch (err) {
      console.warn('[Middleware] getUser() threw — fail open', {
        message: (err as Error).message,
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
  matcher: ['/((?!_next/static|_next/image|auth/callback|api/|favicon.ico).*)'],
};
