import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const startTime = Date.now()

  console.log('[Proxy] ENTRY', { pathname, method: request.method, url: request.url, origin })

  // ── Log the RAW Cookie header exactly as the browser sent it ──────────
  // This is the single source of truth for whether sb- cookies exist.
  const rawCookieHeader = request.headers.get('cookie') ?? '(none)'
  const cookieParts = rawCookieHeader.split(';').map(s => s.trim()).filter(Boolean)
  const sbCookiesInHeader = cookieParts.filter(c => c.startsWith('sb-'))
  console.log('[Proxy] COOKIE_HEADER', {
    rawLength: rawCookieHeader.length,
    numCookies: cookieParts.length,
    cookieNames: cookieParts.map(c => c.split('=')[0]),
    sbCookies: sbCookiesInHeader.map(c => {
      const [n, ...rest] = c.split('=')
      return `${n}=${rest.join('=').slice(0, 40)}...`
    }),
    hasSbCookies: sbCookiesInHeader.length > 0,
  })

  const allCookies = request.cookies.getAll()
  const sbCookie = allCookies.find(c => c.name.startsWith('sb-'))
  console.log('[Proxy] COOKIES_IN', {
    total: allCookies.length,
    names: allCookies.map(c => c.name),
    sbCookieSize: sbCookie ? sbCookie.value.length : 0,
    sbCookieName: sbCookie?.name ?? '(none)',
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Proxy] Supabase env vars missing — skipping auth checks')
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        if (cookiesToSet.length > 0) {
          console.log('[Proxy] COOKIES_SET', cookiesToSet.map(c => ({
            name: c.name,
            valueLength: c.value.length,
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
      secure: true,
      path: '/',
      httpOnly: true,
    },
  })

  const isAuthPage = pathname === '/' || pathname.startsWith('/auth') || pathname === '/onboarding'
  const isProtectedPage = pathname.startsWith('/dashboard')

  // ── PHASE 1: Fast path — read session from cookie (no network call to Supabase Auth) ──
  const getSessionStart = Date.now()
  const { data: { session } } = await supabase.auth.getSession()
  const getSessionDuration = Date.now() - getSessionStart
  console.log('[Proxy] getSession()', {
    hasSession: !!session,
    duration: `${getSessionDuration}ms`,
    userId: session?.user?.id ?? null,
    accessTokenPreview: session?.access_token
      ? `${session.access_token.slice(0, 16)}...`
      : null,
  })

  let user = session?.user ?? null

  // ── PHASE 2: When we have a session cookie, verify it with getUser() ──
  if (session?.user) {
    const getUserStart = Date.now()
    const { data: { user: verifiedUser }, error } = await supabase.auth.getUser()
    const getUserDuration = Date.now() - getUserStart
    console.log('[Proxy] getUser()', {
      verified: !!verifiedUser,
      duration: `${getUserDuration}ms`,
      error: error?.message ?? null,
      errorStatus: error?.status ?? null,
    })

    if (verifiedUser) {
      user = verifiedUser
    } else {
      console.warn('[Proxy] getUser() failed — falling back to session cookie', {
        error: error?.message,
        status: error?.status,
      })
    }
  }

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
    '/((?!_next/static|_next/image|auth/callback|api/|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
