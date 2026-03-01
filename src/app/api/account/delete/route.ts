import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminSupabase = await createAdminClient()

    // Cancel active Stripe subscription (students only; instructors have none)
    const { data: subscription } = await adminSupabase
      .from('student_subscriptions')
      .select('stripe_subscription_id')
      .eq('student_id', user.id)
      .maybeSingle()

    if (subscription?.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)
      } catch (err) {
        // Log but proceed — don't block account deletion on Stripe errors
        console.error('[account/delete] Stripe cancel error:', err)
      }
    }

    // Delete the auth user. Cascades via FK:
    //   auth.users → profiles → student_subscriptions, instructor_profiles,
    //                            time_slots, bookings (all ON DELETE CASCADE)
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id)
    if (error) {
      console.error('[account/delete] deleteUser error:', error.message)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[account/delete] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
