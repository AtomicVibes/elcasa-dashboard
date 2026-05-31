import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function serializeCookie(
  name: string,
  value: string,
  maxAge: number,
): string {
  // @supabase/ssr 0.10 chunker.js passes raw (un-encoded) values to setAll.
  // encodeURIComponent is needed here for safe cookie storage.
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Secure; HttpOnly; Max-Age=${maxAge}`;
}

function redirectHtml(destination: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title><meta http-equiv="refresh" content="0;url=${destination}"><script>window.location.href=${JSON.stringify(destination)}</script></head><body></body></html>`;
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

  // ── Use a 200 OK + JS redirect body instead of NextResponse.redirect() ──
  // Cloudflare Workers (via OpenNext) does not reliably flush Set-Cookie
  // headers on redirect responses.  A 200 OK response guarantees the
  // browser processes the auth cookies before navigating to /dashboard.
  const destination = `${requestUrl.origin}/dashboard`;
  const body = redirectHtml(destination);
  const response = new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });

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

    // ── LOG: Confirm Set-Cookie headers set on the 200 response ──
    const setCookieHeaders = response.headers.getSetCookie?.() ?? [];
    const allSetCookie = response.headers.get('Set-Cookie') ?? '';
    console.log('[AuthCallback] Set-Cookie on 200 response', {
      rawHeaderLength: allSetCookie.length,
      rawHeaderPreview: `${allSetCookie.slice(0, 200)}...`,
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

  console.log('[AuthCallback] EXIT — returning 200 with JS redirect to /dashboard');
  return response;
}
