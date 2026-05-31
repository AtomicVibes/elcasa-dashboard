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

  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        console.log('[AuthCallback] COOKIES_SET', cookiesToSet.map(c => ({
          name: c.name,
          valueLength: c.value.length,
          valuePreview: `${c.value.slice(0, 30)}...`,
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

  if (code) {
    try {
      console.log('[AuthCallback] exchangeCodeForSession START');
      const exchangeStart = Date.now();
      await supabase.auth.exchangeCodeForSession(code);
      const exchangeDuration = Date.now() - exchangeStart;
      console.log('[AuthCallback] exchangeCodeForSession END', { duration: `${exchangeDuration}ms` });

      console.log('[AuthCallback] getUser() after exchange START');
      const getUserStart = Date.now();
      const { data: { user }, error } = await supabase.auth.getUser();
      const getUserDuration = Date.now() - getUserStart;
      console.log('[AuthCallback] getUser() after exchange END', {
        hasUser: !!user,
        userEmail: user?.email ?? null,
        duration: `${getUserDuration}ms`,
        error: error?.message ?? null,
        errorStatus: error?.status ?? null,
      });

      if (!user) {
        console.error('[AuthCallback] No user after code exchange — session may not have been established', {
          error: error?.message,
          status: error?.status,
        });
        return NextResponse.redirect(`${requestUrl.origin}/auth?error=session_failed`);
      }
    } catch (error) {
      console.error('[AuthCallback] exchangeCodeForSession threw', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_failed`);
    }
  } else {
    console.warn('[AuthCallback] No code in query params');
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=no_code`);
  }

  console.log('[AuthCallback] EXIT — redirecting to /dashboard');
  return response;
}
