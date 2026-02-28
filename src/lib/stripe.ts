import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder_build', {
  apiVersion: '2026-01-28.clover',
  typescript: true,
})

export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID!

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name })
}

export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata: metadata || {},
    },
  })
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

/**
 * Creates a Stripe Checkout session in "setup" mode.
 *
 * Purpose: collect and vault a payment method ($0 charge) BEFORE the student
 * uses their first free trial session.  This deters abuse (throwaway accounts)
 * and ensures Stripe can auto-charge when the trial ends.
 *
 * After the session completes, Stripe fires `checkout.session.completed` with
 * mode='setup'.  Our webhook stores the stripe_customer_id on the student's
 * subscription row, which the booking API checks as proof of card-on-file.
 */
export async function createSetupSession({
  customerId,
  successUrl,
  cancelUrl,
  metadata,
}: {
  customerId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    mode: 'setup',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}
