import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_placeholder_build', {
  apiVersion: '2026-02-25.clover',
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
// ── Stripe Connect (instructor payouts) — v1 Express Connect ─────────────────

export async function createConnectAccount(email: string, country: string) {
  return stripe.accounts.create({
    type: 'express',
    email,
    country,
    capabilities: {
      transfers: { requested: true },
    },
  })
}

export async function createAccountLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string,
) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
}

export async function getConnectedAccount(accountId: string) {
  return stripe.accounts.retrieve(accountId)
}

/** Express account onboarding complete when details submitted and payouts enabled */
export function isConnectComplete(account: any): boolean {
  return !!(account?.details_submitted && account?.payouts_enabled)
}

export async function createTransfer(
  amountUsd: number,
  destination: string,
  metadata?: Record<string, string>,
) {
  return stripe.transfers.create({
    amount: Math.round(amountUsd * 100), // cents
    currency: 'usd',
    destination,
    metadata: metadata ?? {},
  })
}

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
