'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { CheckCircle, AlertCircle, RefreshCw, CreditCard, ShieldCheck } from 'lucide-react'
import { Profile, StudentSubscription } from '@/types'
import { format } from 'date-fns'
import { Suspense } from 'react'

function SubscriptionContent() {
  const t = useTranslations('subscription')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<StudentSubscription | null>(null)
  const [loading, setLoading] = useState(false)

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)

    const { data: s } = await supabase
      .from('student_subscriptions')
      .select('*')
      .eq('student_id', user.id)
      .single()
    setSubscription(s)
  }

  useEffect(() => {
    loadData()

    if (searchParams.get('success')) {
      toast.success('Subscription activated! Enjoy your sessions.')
    }
    if (searchParams.get('cancelled')) {
      toast.info('Checkout cancelled.')
    }
    if (searchParams.get('setup_success')) {
      toast.success(
        'Payment method registered! You can now book your free trial sessions.',
      )
      // Re-fetch so the UI reflects the new stripe_customer_id
      loadData()
    }
    if (searchParams.get('setup_cancelled')) {
      toast.info('Card registration cancelled.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Failed to start checkout')
      setLoading(false)
    }
  }

  const handleManage = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Failed to open billing portal')
      setLoading(false)
    }
  }

  // Called when trial user needs to register a card before their first booking
  const handleAddCard = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/setup', { method: 'POST' })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error('Failed to open card registration')
      setLoading(false)
    }
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const isActive    = subscription?.status === 'active'
  const isTrial     = subscription?.status === 'trial'
  const isCanceled  = subscription?.status === 'canceled'
  const hasCard     = !!(subscription?.stripe_customer_id)

  const sessionsLeft = isActive
    ? subscription!.sessions_limit - subscription!.sessions_used
    : 0
  const trialLeft = isTrial
    ? subscription!.trial_limit - subscription!.trial_used
    : 0

  // Should we show the "add card" prompt?
  const showAddCardBanner = isTrial && !hasCard
  // Was the user redirected here from a failed booking (card required)?
  const fromBooking = searchParams.get('add_card') === 'true'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

        {/* ── Card-required banner ─────────────────────────────────────────── */}
        {showAddCardBanner && (
          <div className={`rounded-xl border p-5 mb-6 flex items-start gap-4
            ${fromBooking
              ? 'bg-amber-50 border-amber-300'
              : 'bg-blue-50 border-blue-200'}`}>
            <CreditCard className={`h-6 w-6 flex-shrink-0 mt-0.5
              ${fromBooking ? 'text-amber-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <p className={`font-bold mb-1
                ${fromBooking ? 'text-amber-900' : 'text-blue-900'}`}>
                {fromBooking
                  ? 'A payment method is required to book your first session'
                  : 'Register a card to activate your free trial'}
              </p>
              <p className={`text-sm mb-3
                ${fromBooking ? 'text-amber-700' : 'text-blue-700'}`}>
                We require a card on file to prevent abuse. <strong>You will not be charged</strong>{' '}
                during your 2 free trial sessions. Your card will only be charged if you subscribe
                to the monthly plan ($19.99/mo).
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                <ShieldCheck className="h-4 w-4" />
                <span>Secured by Stripe · 256-bit SSL encryption</span>
              </div>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleAddCard}
                disabled={loading}
              >
                {loading ? 'Redirecting to Stripe…' : 'Register Payment Method (Free)'}
              </Button>
            </div>
          </div>
        )}

        {/* ── Current plan status ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('current_plan')}</h2>

          {isTrial && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{t('trial_plan')}</p>
                <p className="text-blue-600 font-medium mt-1">
                  {trialLeft} of {subscription!.trial_limit} free sessions remaining
                </p>
                {hasCard ? (
                  <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Payment method registered
                  </p>
                ) : (
                  <p className="text-amber-600 text-sm mt-1 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> Card required before first booking
                  </p>
                )}
              </div>
            </div>
          )}

          {isActive && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{t('monthly_plan')}</p>
                <p className="text-gray-600 mt-1">
                  {t('sessions_used', {
                    used: subscription!.sessions_used,
                    limit: subscription!.sessions_limit,
                  })}
                </p>
                {subscription!.current_period_end && (
                  <p className="text-gray-400 text-sm mt-1">
                    {t('period_ends', {
                      date: format(new Date(subscription!.current_period_end), 'MMM d, yyyy'),
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {(isCanceled || !subscription) && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900">No Active Plan</p>
                <p className="text-gray-500 mt-1">Subscribe to book sessions.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Pricing cards ────────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Trial */}
          <div
            className={`rounded-xl border p-5 ${
              isTrial ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="font-bold text-gray-900 mb-1">{t('trial_plan')}</h3>
            <p className="text-2xl font-extrabold text-gray-900 mb-2">Free</p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ 2 sessions total</li>
              <li>✓ All instructors</li>
              <li>✓ Google Meet</li>
              <li>✓ Card required (not charged)</li>
            </ul>
            {isTrial && (
              <span className="mt-3 inline-block text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Current Plan
              </span>
            )}
          </div>

          {/* Monthly */}
          <div
            className={`rounded-xl border p-5 ${
              isActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
            }`}
          >
            <h3 className="font-bold text-gray-900 mb-1">{t('monthly_plan')}</h3>
            <p className="text-2xl font-extrabold text-gray-900 mb-2">
              $19.99
              <span className="text-sm font-normal text-gray-500">/mo</span>
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ 4 sessions per month</li>
              <li>✓ All instructors</li>
              <li>✓ Google Meet</li>
              <li>✓ Cancel anytime</li>
            </ul>
            {isActive && (
              <span className="mt-3 inline-block text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                Current Plan
              </span>
            )}
          </div>
        </div>

        {/* ── Action buttons ───────────────────────────────────────────────── */}
        {!isActive && (
          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Redirecting…' : `${t('subscribe')} – $19.99/month`}
          </Button>
        )}

        {isActive && (
          <Button
            variant="outline"
            className="w-full h-12 text-base"
            onClick={handleManage}
            disabled={loading}
          >
            {loading ? 'Opening…' : t('manage')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Loading…</div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  )
}
