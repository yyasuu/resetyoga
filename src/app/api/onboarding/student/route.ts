import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendStudentWelcomeEmail, sendStudentTermsEmail } from '@/lib/email'

/**
 * POST /api/onboarding/student
 *
 * Initializes the student_subscriptions row for a newly onboarded student.
 * Uses the admin client (service_role) to bypass RLS, avoiding issues with
 * session propagation in the browser client during the OAuth onboarding flow.
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()

    // Check if subscription already exists (idempotent)
    const { data: existing } = await adminSupabase
      .from('student_subscriptions')
      .select('id')
      .eq('student_id', user.id)
      .single()

    if (existing) {
      // Already initialized — just proceed to dashboard
      return NextResponse.json({ ok: true })
    }

    const { error } = await adminSupabase.from('student_subscriptions').insert({
      student_id: user.id,
      status: 'trial',
      trial_used: 0,
      trial_limit: 2,
      sessions_used: 0,
      sessions_limit: 4,
    })

    if (error) {
      console.error('[onboarding/student] subscription insert error:', error)
      return NextResponse.json({ error: error.message, code: error.code }, { status: 500 })
    }

    // Send welcome email (fire-and-forget — don't fail onboarding if email fails)
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    if (profile) {
      sendStudentWelcomeEmail({
        to: profile.email,
        name: profile.full_name || 'there',
      }).catch((err) => console.error('[onboarding/student] welcome email error:', err))

      sendStudentTermsEmail({
        to: profile.email,
        name: profile.full_name || 'there',
      }).catch((err) => console.error('[onboarding/student] terms email error:', err))
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[onboarding/student] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
