'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  CheckCircle,
  AlertCircle,
  RefreshCw,
  CreditCard,
  ShieldCheck,
  BookOpen,
  Settings,
} from 'lucide-react'
import { Profile, StudentSubscription } from '@/types'
import { format } from 'date-fns'
import { Suspense } from 'react'
import Link from 'next/link'

function SubscriptionContent() {
  const t = useTranslations('subscription')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<StudentSubscription | null>(null)
  const [loading, setLoading] = useState(false)
  const [cancelConfirm, setCancelConfirm] = useState(false)
  const [canceling, setCanceling] = useState(false)

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(p)

    if (!p?.role || p.role === 'student') {
      const { data: s } = await supabase
        .from('student_subscriptions')
        .select('*')
        .eq('student_id', user.id)
        .single()
      setSubscription(s)
    }
  }

  useEffect(() => {
    loadData()
    if (searchParams.get('success')) toast.success(t('activated'))
    if (searchParams.get('cancelled')) toast.info(t('checkout_cancelled'))
    if (searchParams.get('setup_success')) {
      toast.success(t('card_registered'))
      loadData()
    }
    if (searchParams.get('setup_cancelled')) toast.info(t('card_cancelled'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { toast.error(t('checkout_failed')); setLoading(false) }
  }

  const handleManage = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { toast.error(t('portal_failed')); setLoading(false) }
  }

  const handleAddCard = async () => {
    setLoading(true)
    const res = await fetch('/api/stripe/setup', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { toast.error(t('card_setup_failed')); setLoading(false) }
  }

  const handleCancel = async () => {
    setCanceling(true)
    const res = await fetch('/api/stripe/cancel', { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      toast.success(t('cancel_success'))
      setCancelConfirm(false)
      loadData()
    } else {
      toast.error(data.error || 'Failed to cancel subscription')
    }
    setCanceling(false)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-navy-400">{t('loading')}</p>
      </div>
    )
  }

  // ── Instructor view ──────────────────────────────────────────────────────
  if (profile.role === 'instructor') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
        <Navbar user={profile} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-10 text-center">
            <div className="w-16 h-16 bg-navy-100 dark:bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-8 w-8 text-navy-600 dark:text-sage-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t('instructor_account')}
            </h2>
            <p className="text-gray-500 dark:text-navy-400 mb-8 max-w-sm mx-auto">
              {t('instructor_account_desc')}
            </p>
            <Link href="/instructor/dashboard">
              <Button className="bg-navy-600 hover:bg-navy-700 text-white">
                {t('go_to_dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Admin view ───────────────────────────────────────────────────────────
  if (profile.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
        <Navbar user={profile} />
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-10 text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              {t('admin_account')}
            </h2>
            <p className="text-gray-500 dark:text-navy-400 mb-8 max-w-sm mx-auto">
              {t('admin_account_desc')}
            </p>
            <Link href="/admin/dashboard">
              <Button className="bg-navy-600 hover:bg-navy-700 text-white">
                {t('go_to_dashboard')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Student view ─────────────────────────────────────────────────────────
  const isActive   = subscription?.status === 'active'
  const isTrial    = subscription?.status === 'trial'
  const isCanceled = subscription?.status === 'canceled'
  const hasCard    = !!(subscription?.stripe_customer_id)

  const trialLeft    = isTrial  ? subscription!.trial_limit    - subscription!.trial_used    : 0
  const sessionsLeft = isActive ? subscription!.sessions_limit - subscription!.sessions_used : 0

  const showAddCardBanner = isTrial && !hasCard
  const fromBooking = searchParams.get('add_card') === 'true'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>

        {/* ── Card-required banner ──────────────────────────────────────── */}
        {showAddCardBanner && (
          <div className={`rounded-xl border p-5 mb-6 flex items-start gap-4 ${
            fromBooking
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <CreditCard className={`h-6 w-6 flex-shrink-0 mt-0.5 ${fromBooking ? 'text-amber-600' : 'text-blue-600 dark:text-blue-400'}`} />
            <div className="flex-1">
              <p className={`font-bold mb-1 ${fromBooking ? 'text-amber-900 dark:text-amber-300' : 'text-blue-900 dark:text-blue-200'}`}>
                {fromBooking ? t('card_required_title') : t('card_required_trial_title')}
              </p>
              <p className={`text-sm mb-3 ${fromBooking ? 'text-amber-700 dark:text-amber-400' : 'text-blue-700 dark:text-blue-400'}`}>
                {t('card_required_desc')}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-navy-400 mb-3">
                <ShieldCheck className="h-4 w-4" />
                <span>{t('stripe_secure')}</span>
              </div>
              <Button
                className="bg-navy-600 hover:bg-navy-700 text-white"
                onClick={handleAddCard}
                disabled={loading}
              >
                {loading ? t('redirecting_stripe') : t('register_card_btn')}
              </Button>
            </div>
          </div>
        )}

        {/* ── Current plan status ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('current_plan')}</h2>

          {isTrial && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t('trial_plan')}</p>
                <p className="text-blue-600 dark:text-blue-400 font-medium mt-1">
                  {t('sessions_remaining', { left: trialLeft, limit: subscription!.trial_limit })}
                </p>
                {hasCard ? (
                  <p className="text-green-600 dark:text-green-400 text-sm mt-1 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> {t('card_registered_check')}
                  </p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mt-1 flex items-center gap-1">
                    <CreditCard className="h-4 w-4" /> {t('card_required_check')}
                  </p>
                )}
              </div>
            </div>
          )}

          {isActive && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t('monthly_plan')}</p>
                <p className="text-gray-600 dark:text-navy-300 mt-1">
                  {t('sessions_used', {
                    used: subscription!.sessions_used,
                    limit: subscription!.sessions_limit,
                  })}
                </p>
                {subscription!.current_period_end && (
                  <p className="text-gray-400 dark:text-navy-400 text-sm mt-1">
                    {t('period_ends', {
                      date: format(new Date(subscription!.current_period_end), 'MMM d, yyyy'),
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {isCanceled && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t('cancel')}</p>
                {subscription?.current_period_end && (
                  <p className="text-orange-600 dark:text-orange-400 text-sm mt-1">
                    {t('access_until', {
                      date: format(new Date(subscription.current_period_end), 'MMM d, yyyy'),
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          {!subscription && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-navy-700 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-gray-500 dark:text-navy-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t('no_active_plan')}</p>
                <p className="text-gray-500 dark:text-navy-400 mt-1">{t('no_active_desc')}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Pricing cards ──────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Trial card */}
          <div className={`rounded-xl border p-5 ${
            isTrial
              ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800'
          }`}>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('trial_plan')}</h3>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Free</p>
            <ul className="text-sm text-gray-600 dark:text-navy-300 space-y-1">
              <li>✓ {t('trial_f1')}</li>
              <li>✓ {t('trial_f2')}</li>
              <li>✓ {t('trial_f3')}</li>
              <li>✓ {t('trial_f4')}</li>
            </ul>
            {isTrial && (
              <span className="mt-3 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2 py-1 rounded-full">
                {t('current_plan_badge')}
              </span>
            )}
          </div>

          {/* Monthly card */}
          <div
            className={`rounded-xl border p-5 transition-all ${
              isActive
                ? 'border-navy-400 dark:border-navy-500 bg-navy-50 dark:bg-navy-700/50'
                : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800 cursor-pointer hover:border-navy-400 dark:hover:border-navy-500 hover:shadow-md'
            }`}
            onClick={!isActive && !loading ? handleSubscribe : undefined}
          >
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{t('monthly_plan')}</h3>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              $19.99
              <span className="text-sm font-normal text-gray-500 dark:text-navy-400">/mo</span>
            </p>
            <ul className="text-sm text-gray-600 dark:text-navy-300 space-y-1">
              <li>✓ {t('monthly_f1')}</li>
              <li>✓ {t('monthly_f2')}</li>
              <li>✓ {t('monthly_f3')}</li>
              <li>✓ {t('monthly_f4')}</li>
            </ul>
            {isActive && (
              <span className="mt-3 inline-block text-xs font-medium text-navy-600 dark:text-navy-200 bg-navy-100 dark:bg-navy-600 px-2 py-1 rounded-full">
                {t('current_plan_badge')}
              </span>
            )}
          </div>
        </div>

        {/* ── Action buttons ──────────────────────────────────────────────── */}

        {/* Subscribe button — trial or no plan */}
        {(isTrial || !subscription) && (
          <Button
            className="w-full bg-navy-600 hover:bg-navy-700 text-white h-12 text-base font-semibold"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? t('redirecting_btn') : t('subscribe_btn')}
          </Button>
        )}

        {/* Resubscribe button — canceled plan */}
        {isCanceled && (
          <Button
            className="w-full bg-navy-600 hover:bg-navy-700 text-white h-12 text-base font-semibold"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? t('redirecting_btn') : t('resubscribe')}
          </Button>
        )}

        {/* Active plan: cancel button (before confirm) */}
        {isActive && !cancelConfirm && (
          <Button
            variant="outline"
            className="w-full h-12 text-base border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => setCancelConfirm(true)}
            disabled={loading}
          >
            {t('cancel_sub')}
          </Button>
        )}

        {/* Cancel confirmation inline */}
        {isActive && cancelConfirm && (
          <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-5">
            <p className="font-bold text-red-900 dark:text-red-300 mb-1">
              {t('cancel_confirm_title')}
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mb-5">
              {subscription?.current_period_end
                ? t('cancel_confirm_desc', {
                    date: format(new Date(subscription.current_period_end), 'MMM d, yyyy'),
                  })
                : t('cancel_confirm_nodesc')}
            </p>
            <div className="flex gap-3">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={canceling}
              >
                {canceling ? t('canceling') : t('cancel_yes')}
              </Button>
              <Button
                variant="outline"
                className="dark:border-navy-600 dark:text-navy-200 dark:hover:bg-navy-700"
                onClick={() => setCancelConfirm(false)}
                disabled={canceling}
              >
                {t('cancel_keep')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
          <p className="text-gray-500 dark:text-navy-400">Loading…</p>
        </div>
      }
    >
      <SubscriptionContent />
    </Suspense>
  )
}
