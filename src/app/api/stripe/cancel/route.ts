import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = await createAdminClient()

    const { data: subscription } = await adminSupabase
      .from('student_subscriptions')
      .select('stripe_subscription_id, current_period_end')
      .eq('student_id', user.id)
      .single()

    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active Stripe subscription found' }, { status: 404 })
    }

    // Cancel at end of billing period (not immediately)
    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    await adminSupabase
      .from('student_subscriptions')
      .update({ status: 'canceled' })
      .eq('student_id', user.id)

    return NextResponse.json({
      success: true,
      access_until: subscription.current_period_end,
    })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
