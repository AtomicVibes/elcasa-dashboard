import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('[MW] ENTRY', { pathname, method: request.method, url: request.url })
  console.log('[MW] COOKIES_IN', request.cookies.getAll().map(c => `${c.name}=${c.value.slice(0, 20)}...`))

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
          console.log('[MW] COOKIES_SET', cookiesToSet.map(c => `${c.name}=${c.value.slice(0, 20)}...`))
        }
        for (const { name, value, options } of cookiesToSet) {
          request.cookies.set(name, value)
          supabaseResponse.cookies.set(name, value, options)
        }
      },
    },
  })

  console.log('[MW] getUser() START')
  const { data: { user }, error } = await supabase.auth.getUser()
  console.log('[MW] getUser() END', { hasUser: !!user, error: error?.message ?? null })
  console.log('[MW] COOKIES_OUT', supabaseResponse.cookies.getAll().map(c => `${c.name}=${c.value.slice(0, 20)}...`))

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

  console.log('[MW] EXIT — forwarding to handler')
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
