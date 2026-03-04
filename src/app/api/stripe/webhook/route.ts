import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  // Use Supabase admin client directly (no cookie auth needed for webhooks)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      // ── checkout.session.completed ──────────────────────────────────────────
      // Handles two modes:
      //   mode='setup'        → student registered a card for trial use
      //   mode='subscription' → student started paid subscription
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (session.mode === 'setup') {
          // Card registered — store the Stripe customer_id so the booking API
          // knows a payment method is on file (trial abuse guard).
          if (userId && session.customer) {
            await supabaseAdmin
              .from('student_subscriptions')
              .update({ stripe_customer_id: session.customer as string })
              .eq('student_id', userId)
          }
          break
        }

        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          if (userId && subscriptionId) {
            await supabaseAdmin
              .from('student_subscriptions')
              .update({
                stripe_subscription_id: subscriptionId,
                stripe_customer_id: session.customer as string,
                status: 'active',
                sessions_used: 0,
                sessions_limit: 4,
              })
              .eq('student_id', userId)
          }
        }
        break
      }

      // ── invoice.payment_succeeded ───────────────────────────────────────────
      // Reset monthly session counter on every successful billing cycle.
      // Period dates come from the invoice object (Stripe 2026 API).
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = (invoice.parent as any)?.subscription_details
          ?.subscription as string | undefined

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId)

          // Find the student by subscription_id (primary) or metadata (fallback)
          const { data: studentSub } = await supabaseAdmin
            .from('student_subscriptions')
            .select('student_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          const targetUserId = studentSub?.student_id || sub.metadata?.userId

          if (targetUserId) {
            await supabaseAdmin
              .from('student_subscriptions')
              .update({
                sessions_used: 0,
                status: 'active',
                current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                current_period_end: new Date(invoice.period_end * 1000).toISOString(),
              })
              .eq('student_id', targetUserId)
          }
        }
        break
      }

      // ── customer.subscription.deleted ──────────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('student_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── customer.subscription.updated ──────────────────────────────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await supabaseAdmin
          .from('student_subscriptions')
          .update({
            status: sub.status === 'active' ? 'active' : (sub.status as string),
          })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      // ── refund.created ──────────────────────────────────────────────────────
      // Replaces charge.refunded in API 2024-10-28+
      // Full refund → cancel subscription + future bookings
      case 'refund.created': {
        const refund = event.data.object as Stripe.Refund
        const chargeId = refund.charge as string | null
        if (!chargeId) break

        const chargeObj = await stripe.charges.retrieve(chargeId)
        const customerId = chargeObj.customer as string | null
        if (!customerId) break

        // Only act on full refunds
        if (chargeObj.amount_refunded < chargeObj.amount) break

        const studentId = await getStudentByCustomerId(supabaseAdmin, customerId)
        if (!studentId) break

        await supabaseAdmin
          .from('student_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_customer_id', customerId)

        await cancelFutureBookings(supabaseAdmin, studentId)
        console.log(`[webhook] Full refund processed for customer ${customerId}`)
        break
      }

      // ── charge.dispute.created ──────────────────────────────────────────────
      // Chargeback filed → freeze subscription + cancel future bookings
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeObj = await stripe.charges.retrieve(dispute.charge as string)
        const customerId = chargeObj.customer as string | null
        if (!customerId) break

        const studentId = await getStudentByCustomerId(supabaseAdmin, customerId)
        if (!studentId) break

        await supabaseAdmin
          .from('student_subscriptions')
          .update({ status: 'disputed' })
          .eq('stripe_customer_id', customerId)

        await cancelFutureBookings(supabaseAdmin, studentId)
        console.error(`[webhook] Dispute created: ${dispute.id} for customer ${customerId}`)
        break
      }

      // ── charge.dispute.closed ───────────────────────────────────────────────
      // Dispute resolved: won → restore active / lost → keep canceled
      case 'charge.dispute.closed': {
        const dispute = event.data.object as Stripe.Dispute
        const chargeObj = await stripe.charges.retrieve(dispute.charge as string)
        const customerId = chargeObj.customer as string | null
        if (!customerId) break

        const newStatus = dispute.status === 'won' ? 'active' : 'canceled'
        await supabaseAdmin
          .from('student_subscriptions')
          .update({ status: newStatus })
          .eq('stripe_customer_id', customerId)

        console.log(`[webhook] Dispute ${dispute.id} closed as ${dispute.status} → subscription ${newStatus}`)
        break
      }
    }
  } catch (err) {
    console.error('Webhook processing error:', err)
    // Return 200 so Stripe doesn't retry — we log the error for manual review.
  }

  return NextResponse.json({ received: true })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getStudentByCustomerId(
  admin: any,
  customerId: string,
): Promise<string | null> {
  const { data } = await admin
    .from('student_subscriptions')
    .select('student_id')
    .eq('stripe_customer_id', customerId)
    .single()
  return data?.student_id ?? null
}

async function cancelFutureBookings(
  admin: any,
  studentId: string,
): Promise<void> {
  const { data: bookings } = await admin
    .from('bookings')
    .select('id, time_slots!slot_id(start_time)')
    .eq('student_id', studentId)
    .eq('status', 'confirmed')

  const futureIds = (bookings ?? [])
    .filter((b: any) => b.time_slots && new Date(b.time_slots.start_time) > new Date())
    .map((b: any) => b.id)

  if (futureIds.length > 0) {
    await admin.from('bookings').update({ status: 'canceled' }).in('id', futureIds)
  }
}
