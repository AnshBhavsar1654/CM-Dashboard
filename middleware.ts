import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'gov_session'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  const publicPaths = [
    '/login',
    '/api/login',
    '/api/logout',
    '/_next',
    '/favicon',
  ]
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // For Edge compatibility, only check presence; signature verification happens on server usage
  const cookie = req.cookies.get(COOKIE_NAME)?.value
  if (!cookie) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
