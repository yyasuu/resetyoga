import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'student'

  // The forgot-password page sets this cookie before calling
  // resetPasswordForEmail so we know to redirect to the reset-password page
  // instead of the normal post-login destination.
  const isRecovery = request.cookies.get('ry_recovery')?.value === '1'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // ── Password recovery flow ────────────────────────────────────────
      if (isRecovery) {
        const response = NextResponse.redirect(`${origin}/auth/reset-password`)
        // Clear the one-time recovery cookie
        response.cookies.set('ry_recovery', '', { path: '/', maxAge: 0 })
        return response
      }

      // ── Normal login / signup confirmation ────────────────────────────
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile?.role || profile.role === 'student') {
          return NextResponse.redirect(`${origin}/onboarding?role=${role}`)
        }
        if (profile.role === 'instructor') {
          return NextResponse.redirect(`${origin}/instructor/dashboard`)
        }
        if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin/dashboard`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }

    // Code exchange failed (expired link, wrong browser, etc.)
    return NextResponse.redirect(`${origin}/login?error=link_expired`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
