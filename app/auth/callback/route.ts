import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function serializeCookie(
  name: string,
  value: string,
  maxAge: number,
): string {
  let c = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Secure; HttpOnly; Max-Age=${maxAge}`;
  return c;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[AuthCallback] ENTRY', {
    origin: requestUrl.origin,
    code: code ? `${code.slice(0, 12)}...${code.slice(-4)}` : null,
    hasCode: !!code,
    url: request.url,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[AuthCallback] Missing Supabase env vars');
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=missing_env`);
  }

  if (!code) {
    console.warn('[AuthCallback] No code in query params');
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`);
  }

  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        if (cookiesToSet.length === 0) {
          console.warn('[AuthCallback] setAll called with EMPTY array — no cookies to persist');
          return;
        }
        console.log('[AuthCallback] COOKIES_SET', cookiesToSet.map(c => ({
          name: c.name,
          valueLength: c.value.length,
          valuePreview: `${c.value.slice(0, 30)}...`,
          options: c.options,
        })));

        for (const { name, value, options } of cookiesToSet) {
          // ── FORCE cookie persistence via raw Set-Cookie header ──────────
          // NextResponse.cookies.set() on a 307 redirect may not serialize
          // correctly on Cloudflare Workers.  We write the header directly
          // to guarantee the browser receives it.
          const maxAge = options?.maxAge ?? 60 * 60 * 24 * 365;
          response.headers.append(
            'Set-Cookie',
            serializeCookie(name, value, maxAge),
          );
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

  try {
    console.log('[AuthCallback] exchangeCodeForSession START');
    const exchangeStart = Date.now();
    const { data: exchangeData, error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    const exchangeDuration = Date.now() - exchangeStart;

    if (exchangeError) {
      console.error('[AuthCallback] exchangeCodeForSession ERROR', {
        message: exchangeError.message,
        status: exchangeError.status,
        duration: `${exchangeDuration}ms`,
      });
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=exchange_failed`);
    }

    console.log('[AuthCallback] exchangeCodeForSession OK', {
      exchangeUserEmail: exchangeData?.user?.email ?? null,
      exchangeUserId: exchangeData?.user?.id ?? null,
      duration: `${exchangeDuration}ms`,
    });

    // ── VERIFY: Read back the session cookie to confirm it was materialised ──
    console.log('[AuthCallback] getSession() after exchange START');
    const sessionStart = Date.now();
    const { data: { session }, error: sessionError } =
      await supabase.auth.getSession();
    const sessionDuration = Date.now() - sessionStart;
    console.log('[AuthCallback] getSession() after exchange', {
      hasSession: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      accessTokenPreview: session?.access_token
        ? `${session.access_token.slice(0, 16)}...`
        : null,
      refreshTokenPreview: session?.refresh_token
        ? `${session.refresh_token.slice(0, 8)}...`
        : null,
      expiresIn: session?.expires_in ?? null,
      duration: `${sessionDuration}ms`,
      error: sessionError?.message ?? null,
    });

    if (!session) {
      console.error('[AuthCallback] No session materialised after code exchange', {
        sessionError: sessionError?.message,
      });
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_not_created`);
    }

    // ── VERIFY: Confirm Set-Cookie headers are on the response ──
    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    const allSetCookie = response.headers.get('Set-Cookie') ?? '';
    console.log('[AuthCallback] Set-Cookie on response', {
      rawHeaderLength: allSetCookie.length,
      rawHeaderPreview: `${allSetCookie.slice(0, 120)}...`,
      numHeaders: setCookieHeaders.length,
      cookies: setCookieHeaders.map(h => h.split(';')[0]),
    });
  } catch (error) {
    console.error('[AuthCallback] exchangeCodeForSession threw', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack?.split('\n').slice(0, 4).join('\n'),
    });
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_exception`);
  }

  console.log('[AuthCallback] EXIT — redirecting to /dashboard');
  return response;
}
