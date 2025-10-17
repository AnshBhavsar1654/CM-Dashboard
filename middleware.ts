import { NextRequest, NextResponse } from 'next/server'

// Authentication disabled - dashboard opens directly without login
export function middleware(req: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
