import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createStripeCustomer, STRIPE_PRICE_ID } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Get or create subscription record
    let { data: subscription } = await supabase
      .from('student_subscriptions')
      .select('*')
      .eq('student_id', user.id)
      .single()

    // Get or create Stripe customer
    let stripeCustomerId = subscription?.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await createStripeCustomer(
        profile.email,
        profile.full_name || profile.email
      )
      stripeCustomerId = customer.id

      // Update subscription with customer ID
      if (subscription) {
        await supabase
          .from('student_subscriptions')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('student_id', user.id)
      } else {
        await supabase.from('student_subscriptions').insert({
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

    const session = await createCheckoutSession({
      customerId: stripeCustomerId,
      priceId: STRIPE_PRICE_ID,
      successUrl: `${appUrl}/subscription?success=true`,
      cancelUrl: `${appUrl}/subscription?cancelled=true`,
      metadata: { userId: user.id },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
