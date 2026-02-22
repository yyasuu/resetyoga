import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createStripeCustomer, createSetupSession } from '@/lib/stripe'

/**
 * POST /api/stripe/setup
 *
 * Creates (or reuses) a Stripe Customer, then opens a Checkout session in
 * "setup" mode so the student can register a card without being charged.
 *
 * On success, Stripe redirects to /subscription?setup_success=true
 * and fires checkout.session.completed (mode='setup') → webhook stores
 * the customer_id on the student_subscriptions row.
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Get or create subscription record
    const { data: subscription } = await supabase
      .from('student_subscriptions')
      .select('id, stripe_customer_id')
      .eq('student_id', user.id)
      .single()

    // Get or create Stripe customer
    let stripeCustomerId = subscription?.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        profile.email,
        profile.full_name || profile.email,
      )
      stripeCustomerId = customer.id

      // Persist customer_id immediately (webhook also does this, belt-and-suspenders)
      if (subscription) {
        await adminSupabase
          .from('student_subscriptions')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('student_id', user.id)
      } else {
        // Edge case: subscription row not yet created
        await adminSupabase.from('student_subscriptions').insert({
          student_id: user.id,
          stripe_customer_id: stripeCustomerId,
          status: 'trial',
          trial_used: 0,
          trial_limit: 2,
          sessions_used: 0,
          sessions_limit: 4,
        })
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createSetupSession({
      customerId: stripeCustomerId,
      successUrl: `${appUrl}/subscription?setup_success=true`,
      cancelUrl: `${appUrl}/subscription?setup_cancelled=true`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe setup error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
