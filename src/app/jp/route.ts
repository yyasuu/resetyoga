import { NextRequest, NextResponse } from 'next/server'

export function GET(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  const response = NextResponse.redirect(url)
  response.cookies.set('NEXT_LOCALE', 'ja', { path: '/', maxAge: 31536000 })
  return response
}
