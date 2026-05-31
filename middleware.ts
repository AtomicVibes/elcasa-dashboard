import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const startTime = Date.now()

  console.log('[MW] ENTRY', { pathname, method: request.method, url: request.url })

  const allCookies = request.cookies.getAll()
  const sbCookie = allCookies.find(c => c.name.startsWith('sb-'))
  console.log('[MW] COOKIES_IN', {
    total: allCookies.length,
    names: allCookies.map(c => c.name),
    sbCookieSize: sbCookie ? sbCookie.value.length : 0,
    sbCookieName: sbCookie?.name ?? '(none)',
    sbCookiePreview: sbCookie ? `${sbCookie.value.slice(0, 40)}...` : '(none)',
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('[MW] ENV_CHECK', {
    urlPresent: !!supabaseUrl,
    urlLen: supabaseUrl?.length ?? 0,
    keyPresent: !!supabaseAnonKey,
    keyLen: supabaseAnonKey?.length ?? 0,
    runtime: globalThis.navigator?.userAgent ?? 'workerd',
  })

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[MW] Supabase env vars missing — skipping auth checks')
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
          console.log('[MW] COOKIES_SET', cookiesToSet.map(c => ({
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

  console.log('[MW] getUser() START')
  const getUserStart = Date.now()
  const { data: { user }, error } = await supabase.auth.getUser()
  const getUserDuration = Date.now() - getUserStart
  console.log('[MW] getUser() END', {
    hasUser: !!user,
    duration: `${getUserDuration}ms`,
    userEmail: user?.email ?? null,
    error: error?.message ?? null,
    status: error?.status ?? null,
  })

  const isAuthPage = pathname === '/' || pathname.startsWith('/auth')
  const isProtectedPage = pathname.startsWith('/dashboard')

  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    console.log('[MW] REDIRECT auth→dashboard')
    return NextResponse.redirect(url)
  }

  if (!user && isProtectedPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    console.log('[MW] REDIRECT dashboard→auth')
    return NextResponse.redirect(url)
  }

  console.log('[MW] EXIT — forwarding to handler', { totalDuration: `${Date.now() - startTime}ms` })
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|auth/callback|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
