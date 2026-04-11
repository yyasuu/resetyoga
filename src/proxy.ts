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
  '/wellness',
  '/premium',
  '/auth',
  '/api',
  '/jp',
  '/tokusho',
  '/tokusho/en',
  '/terms',
  '/privacy',
  '/refund',
  '/instructor-terms',
  '/student-terms',
]

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/_next') ||
    pathname.includes('.') ||
    pathname.startsWith('/api/stripe/webhook')
  ) {
    return NextResponse.next()
  }

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

  if (!user && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const needsRoleCheck =
      pathname === '/login' ||
      pathname === '/register' ||
      pathname.startsWith('/instructor/') ||
      pathname.startsWith('/admin/')

    if (needsRoleCheck) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = profile?.role

      if (pathname === '/login' || pathname === '/register') {
        if (role) {
          const url = request.nextUrl.clone()
          url.pathname =
            role === 'instructor' ? '/instructor/dashboard' :
            role === 'admin'      ? '/admin/dashboard' :
                                    '/dashboard'
          return NextResponse.redirect(url)
        }
      }

      if (pathname.startsWith('/instructor/') && role !== 'instructor' && role !== 'admin') {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }

      if (pathname.startsWith('/admin/') && role !== 'admin') {
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
