import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const startTime = Date.now()

  console.log('[Proxy] ENTRY', { pathname, method: request.method, url: request.url, origin })

  const allCookies = request.cookies.getAll()
  const sbCookie = allCookies.find(c => c.name.startsWith('sb-'))
  console.log('[Proxy] COOKIES_IN', {
    total: allCookies.length,
    names: allCookies.map(c => c.name),
    sbCookieSize: sbCookie ? sbCookie.value.length : 0,
    sbCookieName: sbCookie?.name ?? '(none)',
    sbCookiePreview: sbCookie ? `${sbCookie.value.slice(0, 40)}...` : '(none)',
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[Proxy] ENV_CHECK', {
    urlPresent: !!supabaseUrl,
    urlLen: supabaseUrl?.length ?? 0,
    keyPresent: !!supabaseAnonKey,
    keyLen: supabaseAnonKey?.length ?? 0,
    runtime: globalThis.navigator?.userAgent ?? 'workerd',
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Proxy] Supabase env vars missing — skipping auth checks')
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        if (cookiesToSet.length > 0) {
          console.log('[Proxy] COOKIES_SET', cookiesToSet.map(c => ({
            name: c.name,
            valuePreview: `${c.value.slice(0, 20)}...`,
            valueLength: c.value.length,
            options: c.options,
          })))
        }
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
    cookieOptions: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  })

  console.log('[Proxy] getUser() START')
  const getUserStart = Date.now()
  const { data: { user }, error } = await supabase.auth.getUser()
  const getUserDuration = Date.now() - getUserStart
  console.log('[Proxy] getUser() END', {
    hasUser: !!user,
    duration: `${getUserDuration}ms`,
    userEmail: user?.email ?? null,
    error: error?.message ?? null,
    errorStatus: error?.status ?? null,
  })

  // If getUser() returned a server/network error (status >= 500), the Supabase
  // Auth API may be transiently unreachable from the Cloudflare edge.  Fail
  // OPEN — let the request through rather than redirecting into an auth loop.
  if (error && error.status && error.status >= 500) {
    console.warn('[Proxy] getUser() server/network error — failing OPEN', {
      status: error.status,
      message: error.message,
      duration: `${getUserDuration}ms`,
    })
    return NextResponse.next()
  }

  const isAuthPage = pathname === '/' || pathname.startsWith('/auth') || pathname === '/onboarding'
  const isProtectedPage = pathname.startsWith('/dashboard')

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    console.log('[Proxy] REDIRECT auth→dashboard (authenticated user on auth page)')
    return NextResponse.redirect(url)
  }

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    console.log('[Proxy] REDIRECT dashboard→auth (no session, protected page)')
    return NextResponse.redirect(url)
  }

  console.log('[Proxy] EXIT — forwarding to handler', { totalDuration: `${Date.now() - startTime}ms` })
  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static       (Next.js static chunk files)
     * - _next/image        (Next.js image optimization API — unsupported on CF Workers)
     * - auth/callback      (Supabase OAuth callback — handles its own session exchange)
     * - api/               (API route handlers — they verify auth via Bearer token)
     * - favicon.ico
     * - *.svg|png|jpg|jpeg|gif|webp  (static image files served from /public)
     */
    '/((?!_next/static|_next/image|auth/callback|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
