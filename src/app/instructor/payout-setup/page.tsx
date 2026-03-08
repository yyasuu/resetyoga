'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Profile } from '@/types'
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  CreditCard,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Suspense } from 'react'

interface ConnectStatus {
  connected: boolean
  complete?: boolean
  account_id?: string
}

function PayoutSetupContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [status, setStatus] = useState<ConnectStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session ? { 'Authorization': `Bearer ${session.access_token}` } : {}
  }

  const loadStatus = async (token?: string) => {
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : await getAuthHeaders()
    const res = await fetch('/api/instructor/stripe-connect', { headers })
    if (res.ok) setStatus(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', session.user.id).single()
        .then(({ data }) => {
          if (!data || (data.role !== 'instructor' && data.role !== 'admin')) {
            router.push('/dashboard'); return
          }
          setProfile(data)
          loadStatus(session.access_token)
        })
    })

    if (searchParams.get('success')) {
      toast.success('Stripe account connected! Your setup is complete.')
    }
    if (searchParams.get('reauth')) {
      toast.info('Please complete your Stripe account setup.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConnect = async () => {
    setConnecting(true)
    const headers = await getAuthHeaders()
    const res = await fetch('/api/instructor/stripe-connect', { method: 'POST', headers })
    const data = await res.json()
    if (data.url) {
      window.location.href = data.url
    } else {
      toast.error(data.error ?? 'Failed to start Stripe setup')
      setConnecting(false)
    }
  }

  if (!profile || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-xl mx-auto w-full px-4 py-12">
        <Link href="/instructor/dashboard">
          <Button variant="ghost" size="sm" className="mb-6 text-gray-500 dark:text-navy-400">
            <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Stripe Payout Setup
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">
          Connect your Stripe account to receive automated payouts directly to your bank.
        </p>

        {/* Status card */}
        {status?.complete ? (
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-green-200 dark:border-green-800 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white mb-1">
                  Stripe account connected ✓
                </h2>
                <p className="text-sm text-gray-500 dark:text-navy-300">
                  Your account is fully set up. The platform admin can now send payouts
                  directly to your bank via Stripe.
                </p>
                <p className="text-xs font-mono text-gray-400 dark:text-navy-500 mt-2">
                  {status.account_id}
                </p>
              </div>
            </div>
          </div>
        ) : status?.connected ? (
          // Connected but onboarding not complete
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-yellow-200 dark:border-yellow-800 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-900 dark:text-white mb-1">
                  Setup incomplete
                </h2>
                <p className="text-sm text-gray-500 dark:text-navy-300 mb-4">
                  You started the Stripe setup but haven&apos;t finished. Please complete it to
                  receive payouts.
                </p>
                <Button
                  className="bg-navy-600 hover:bg-navy-700 text-white"
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting
                    ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Redirecting…</>
                    : <><ExternalLink className="h-4 w-4 mr-2" /> Complete Stripe Setup</>}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Not connected
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-navy-600 dark:text-navy-300" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 dark:text-white mb-1">
                  Connect your Stripe account
                </h2>
                <p className="text-sm text-gray-500 dark:text-navy-300">
                  You&apos;ll be taken to Stripe&apos;s secure onboarding to set up your payout account.
                  This takes about 5–10 minutes.
                </p>
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-600 dark:text-navy-300 mb-6">
              {[
                'Government-issued ID (passport or driver\'s license)',
                'Your bank account details for receiving payouts',
                'Personal address and date of birth',
              ].map(item => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-sage-500 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold h-12"
              onClick={handleConnect}
              disabled={connecting}
            >
              {connecting
                ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Redirecting to Stripe…</>
                : <><ExternalLink className="h-4 w-4 mr-2" /> Connect Stripe Account</>}
            </Button>

            <p className="text-xs text-gray-400 dark:text-navy-500 text-center mt-3">
              Powered by Stripe — your banking info is handled securely by Stripe, not Reset Yoga.
            </p>
          </div>
        )}

        {/* How it works */}
        <div className="bg-gray-50 dark:bg-navy-800/50 rounded-xl border border-gray-200 dark:border-navy-700 p-5">
          <h3 className="font-semibold text-gray-700 dark:text-navy-200 mb-3 text-sm">
            How payouts work
          </h3>
          <ol className="space-y-2 text-sm text-gray-500 dark:text-navy-400">
            {[
              'After your sessions are completed, the admin reviews and processes your payout.',
              'If you\'ve connected Stripe, the transfer is sent automatically to your bank.',
              'Stripe typically takes 2–7 days to deposit funds depending on your country.',
            ].map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-navy-200 dark:bg-navy-700 text-navy-700 dark:text-navy-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function PayoutSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    }>
      <PayoutSetupContent />
    </Suspense>
  )
}
