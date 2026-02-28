import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { canAccessPath } from '@/lib/rbac'

const PUBLIC_PATHS = ['/login', '/logout', '/forgot-password']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Allow Next.js internals, static files, and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // Only protect /app/* routes — other paths pass through
  if (!pathname.startsWith('/app')) {
    return NextResponse.next()
  }

  // Check auth from cookie (set by auth store on login)
  const authCookie = request.cookies.get('pm_auth')

  if (!authCookie?.value) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based checks
  try {
    const payload = JSON.parse(decodeURIComponent(authCookie.value)) as {
      authenticated?: boolean
      role?: string
    }

    if (!payload.authenticated) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    if (!canAccessPath(pathname, payload.role as never)) {
      return NextResponse.redirect(new URL('/app/dashboard', request.url))
    }
  } catch {
    // Cookie parse failed — redirect to login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
