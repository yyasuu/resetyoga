import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const role = searchParams.get('role') || 'student'
  // next=/auth/reset-password is set when coming from a password reset email
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // If this is a password reset flow, redirect to the reset-password page
      if (next && next.startsWith('/') && !next.startsWith('//')) {
        return NextResponse.redirect(`${origin}${next}`)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Check if profile exists and has a role set
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (!profile?.role || profile.role === 'student') {
          // New user or student - go to onboarding
          return NextResponse.redirect(`${origin}/onboarding?role=${role}`)
        }

        // Existing user - redirect based on role
        if (profile.role === 'instructor') {
          return NextResponse.redirect(`${origin}/instructor/dashboard`)
        }
        if (profile.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin/dashboard`)
        }
        return NextResponse.redirect(`${origin}/dashboard`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
