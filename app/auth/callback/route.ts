import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[AuthCallback] ENTRY', { origin: requestUrl.origin, hasCode: !!code, url: request.url });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const response = NextResponse.redirect(`${requestUrl.origin}/dashboard`);

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[AuthCallback] Missing Supabase env vars');
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=missing_env`);
  }

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
      console.log('[AuthCallback] exchangeCodeForSession END', { duration: `${Date.now() - exchangeStart}ms` });
    } catch (error) {
      console.error('[Supabase Auth Callback Error]:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth?error=oauth_failed`);
    }
  }

  console.log('[AuthCallback] EXIT — redirecting to /dashboard');
  return response;
}
