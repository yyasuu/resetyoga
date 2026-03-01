import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicPaths = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/onboarding',
  '/instructors',
  '/auth',
  '/api',
  '/tokusho',
  '/terms',
  '/privacy',
  '/refund',
  '/instructor-terms',
  '/student-terms',
]

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static files and API webhook
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/stripe/webhook')
  ) {
    return NextResponse.next()
  }

  // If Supabase is not configured, pass through
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If not authenticated and accessing a protected path, redirect to login
  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based routing for authenticated users
  if (user) {
    // Redirect away from auth pages
    if (pathname === '/login' || pathname === '/register') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        const url = request.nextUrl.clone()
        url.pathname =
          profile.role === 'instructor'
            ? '/instructor/dashboard'
            : profile.role === 'admin'
            ? '/admin/dashboard'
            : '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Protect instructor routes
    if (pathname.startsWith('/instructor/')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'instructor' && profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // Protect admin routes
    if (pathname.startsWith('/admin/')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profile?.role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
