import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function serializeCookie(name: string, value: string, maxAge: number): string {
  const attrs = [`${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax; Secure; Max-Age=${maxAge}`];
  // Only refresh-token and code-verifier cookies need HttpOnly.
  // The access-token cookie must be readable by the browser client
  // via document.cookie so createBrowserClient can get the session.
  if (/refresh.token|code.verifier/i.test(name)) attrs.push('HttpOnly');
  return attrs.join('; ');
}

function redirectHtml(destination: string): string {
  const escaped = JSON.stringify(destination);
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Redirecting...</title><meta http-equiv="refresh" content="0;url=${destination}"><script>window.location.href=${escaped}</script></head><body></body></html>`;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');

  console.log('[AuthCallback] ENTRY', {
    origin: requestUrl.origin,
    hasCode: !!code,
    hasState: !!state,
    codePreview: code ? `${code.slice(0, 12)}...${code.slice(-4)}` : null,
  });

  if (!code) {
    console.warn('[AuthCallback] No code in query params');
    return NextResponse.redirect(new URL('/auth?error=no_code', requestUrl.origin));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[AuthCallback] Missing Supabase env vars');
    return NextResponse.redirect(new URL('/auth?error=config', requestUrl.origin));
  }

  // ── State verification (CSRF protection) ──────────────────────────────
  if (state) {
    const storedState = request.cookies.get('supabase.state')?.value ?? null;
    if (storedState && storedState !== state) {
      console.error('[AuthCallback] State mismatch — possible CSRF', {
        stored: storedState.slice(0, 8),
        received: state.slice(0, 8),
      });
      return NextResponse.redirect(new URL('/auth?error=state_mismatch', requestUrl.origin));
    }
  }

  // 200 OK + JS redirect body guarantees browser processes Set-Cookie headers
  // before navigating. Cloudflare Workers (via OpenNext) does not reliably
  // flush Set-Cookie on NextResponse.redirect().
  const destination = new URL('/sign/up', requestUrl.origin).href;
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
          console.warn('[AuthCallback] setAll called with empty array');
          return;
        }

        console.log('[AuthCallback] setAll', cookiesToSet.map(c => ({
          name: c.name,
          valueLength: c.value.length,
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[AuthCallback] exchangeCodeForSession ERROR', {
        message: error.message,
        status: error.status,
      });
      return NextResponse.redirect(new URL('/auth?error=exchange_failed', requestUrl.origin));
    }

    console.log('[AuthCallback] SESSION_OBTAINED', {
      email: data.user?.email ?? null,
      userId: data.user?.id ?? null,
      expiresIn: data.session?.expires_in ?? null,
    });
  } catch (error) {
    console.error('[AuthCallback] exchange threw', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack?.slice(0, 500),
    });
    return NextResponse.redirect(new URL('/auth?error=exception', requestUrl.origin));
  }

  return response;
}
