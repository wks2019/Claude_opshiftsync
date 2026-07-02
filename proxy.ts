import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/pricing',
  '/login',
  '/register',
  '/reset-password',
  '/auth/set-password',
  '/api/v1/health',
  '/api/v1/certificates/verify',
]

type AppRole = 'guest' | 'staff' | 'manager' | 'administrator'

const ROLE_HOME: Record<AppRole, string> = {
  guest: '/',
  staff: '/staff',
  manager: '/manager',
  administrator: '/admin',
}

function isPathAllowedForRole(pathname: string, role: AppRole): boolean {
  if (role === 'administrator') return true
  if (pathname.startsWith('/admin')) return false
  if (pathname.startsWith('/manager')) return role === 'manager'
  if (pathname.startsWith('/staff')) return role === 'staff' || role === 'manager'
  return true
}

/**
 * Next.js 16 renamed middleware.ts to proxy.ts and the exported function
 * to `proxy`. Logic is unchanged from the prior middleware.ts; this now
 * runs on the Node.js runtime by default rather than Edge, which is
 * actually a better fit for a Supabase-backed session check than the
 * old Edge-runtime constraint was.
 *
 * Next's own guidance recommends keeping this file to cheap, optimistic
 * checks and pushing authoritative validation into Server Components or
 * the Data Access Layer. The getUser()/getSession() calls here remain
 * for now since RLS is still the actual authority on every request this
 * redirects toward; tracked as a Phase 1 hardening item, not a blocker.
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value)
          }
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))

  if (!user && !isPublicPath) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (user) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const appRole = (session?.user.app_metadata?.app_role ??
      (session as unknown as { app_role?: AppRole })?.app_role ??
      'staff') as AppRole

    if (pathname === '/login') {
      return NextResponse.redirect(new URL(ROLE_HOME[appRole], request.url))
    }

    if (!isPublicPath && !isPathAllowedForRole(pathname, appRole)) {
      return NextResponse.redirect(new URL(ROLE_HOME[appRole], request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
