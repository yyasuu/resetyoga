import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)

  // ── Parameters ──────────────────────────────────────────────────────────────
  // PKCE flow (Google OAuth, normal email sign-in)
  const code = searchParams.get('code')
  // Token-hash flow (Admin API generateLink — used for our password reset)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') // 'recovery' | 'signup' | 'magiclink' …

  const role = searchParams.get('role') || 'student'

  // Cookie set by /api/auth/send-reset when the reset email is dispatched
  const isRecovery =
    request.cookies.get('ry_recovery')?.value === '1' || type === 'recovery'

  // ── Build response first so we can set cookies directly on it ───────────────
  // Using NextResponse.next() as a mutable cookie jar; we'll replace it with a
  // redirect once we know where to send the user.
  let response = NextResponse.next({ request })

  // Create Supabase client that writes cookies directly on the response object.
  // This is the pattern recommended by @supabase/ssr for auth callbacks —
  // cookies().set() from next/headers does NOT reliably propagate to explicit
  // NextResponse.redirect() objects, so we manage cookies ourselves here.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write to both request (for in-flight reads) and response (for browser)
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── Helper: redirect, carrying the session cookies we set above ──────────────
  function redirect(url: string) {
    const res = NextResponse.redirect(url)
    // Copy every Set-Cookie from our mutable response to the redirect response
    response.cookies.getAll().forEach(({ name, value, ...options }) => {
      res.cookies.set(name, value, options as any)
    })
    return res
  }

  // ── Helper: clear recovery cookie and redirect ───────────────────────────
  function recoveryRedirect() {
    const res = redirect(`${origin}/auth/reset-password`)
    res.cookies.set('ry_recovery', '', { path: '/', maxAge: 0 })
    return res
  }

  // ── Helper: redirect to dashboard based on role ──────────────────────────
  async function dashboardRedirect() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return redirect(`${origin}/login?error=auth_failed`)

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile?.role || profile.role === 'student') {
      return redirect(`${origin}/onboarding?role=${role}`)
    }
    if (profile.role === 'instructor') {
      return redirect(`${origin}/instructor/dashboard`)
    }
    if (profile.role === 'admin') {
      return redirect(`${origin}/admin/dashboard`)
    }
    return redirect(`${origin}/dashboard`)
  }

  // ── Token-hash flow (Admin API / Magic Link / Email OTP) ─────────────────
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    })

    if (!error) {
      if (isRecovery) return recoveryRedirect()
      return dashboardRedirect()
    }

    console.error('[callback] verifyOtp error:', error.message)
    return redirect(`${origin}/login?error=link_expired`)
  }

  // ── PKCE code flow (Google OAuth, standard email confirmation) ────────────
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (isRecovery) return recoveryRedirect()
      return dashboardRedirect()
    }

    console.error('[callback] exchangeCodeForSession error:', error.message)
    return redirect(`${origin}/login?error=link_expired`)
  }

  return redirect(`${origin}/login?error=auth_failed`)
}
