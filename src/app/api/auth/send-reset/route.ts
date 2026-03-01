import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email, locale } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || `https://${request.headers.get('host')}`
    const adminSupabase = await createAdminClient()

    // Generate a real Supabase recovery link via Admin API.
    // The link is valid, signed by Supabase, and works with the normal
    // auth/callback → exchangeCodeForSession flow.
    const { data, error } = await adminSupabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      // Don't expose internal errors; log server-side only
      console.error('[send-reset] generateLink error:', error.message)
      // Return 200 anyway to avoid email enumeration
      return NextResponse.json({ success: true })
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      console.error('[send-reset] No action_link in response')
      return NextResponse.json({ success: true })
    }

    // Send via Resend (much better deliverability than Supabase's default SMTP)
    await sendPasswordResetEmail({ to: email, resetLink, locale: locale || 'en' })

    // Set a short-lived cookie so the auth/callback route knows to redirect
    // to /auth/reset-password instead of the normal onboarding/dashboard flow.
    const res = NextResponse.json({ success: true })
    res.cookies.set('ry_recovery', '1', {
      path: '/',
      maxAge: 3600,
      sameSite: 'lax',
      httpOnly: true,
    })
    return res
  } catch (err) {
    console.error('[send-reset] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
