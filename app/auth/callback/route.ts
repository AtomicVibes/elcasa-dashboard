import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[AuthCallback] ENTRY', { origin: requestUrl.origin, hasCode: !!code, url: request.url });

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
        console.log('[AuthCallback] COOKIES_SET', cookiesToSet.map(c => ({
          name: c.name,
          valuePreview: `${c.value.slice(0, 30)}...`,
          valueLength: c.value.length,
          options: c.options,
        })));
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
    cookieOptions: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  });

  try {
    console.log('[AuthCallback] exchangeCodeForSession START');
    const exchangeStart = Date.now();
    const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
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
      duration: `${exchangeDuration}ms`,
    });

    // ── VERIFY: Read back the session cookie to confirm it was materialised ──
    console.log('[AuthCallback] getSession() after exchange START');
    const sessionStart = Date.now();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const sessionDuration = Date.now() - sessionStart;
    console.log('[AuthCallback] getSession() after exchange', {
      hasSession: !!session,
      userId: session?.user?.id ?? null,
      email: session?.user?.email ?? null,
      duration: `${sessionDuration}ms`,
      error: sessionError?.message ?? null,
    });

    if (!session) {
      console.error('[AuthCallback] No session materialised after code exchange', {
        sessionError: sessionError?.message,
      });
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_not_created`);
    }

    // ── VERIFY: Check the supabase-auth-token cookie is set on the response ──
    const setCookieHeader = response.headers.get('Set-Cookie');
    console.log('[AuthCallback] Set-Cookie header preview', {
      present: !!setCookieHeader,
      containsAuthToken: setCookieHeader?.includes('supabase-auth-token') ?? false,
      length: setCookieHeader?.length ?? 0,
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
