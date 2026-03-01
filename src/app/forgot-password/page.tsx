'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Mail, AlertTriangle } from 'lucide-react'

function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSendError('')

    // Set a short-lived cookie so the auth callback knows to redirect to
    // reset-password instead of onboarding/dashboard.
    // The cookie is scoped to the domain so it is present when the email
    // link is clicked (same device) and the callback route reads it.
    document.cookie = 'ry_recovery=1; path=/; max-age=3600; SameSite=Lax'

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Use the base callback URL — this is already whitelisted in Supabase
      // for Google OAuth, so password-reset emails will be delivered correctly.
      redirectTo: `${window.location.origin}/auth/callback`,
    })

    setLoading(false)

    if (error) {
      console.error('Reset error:', error.message)
      // Still show the success screen to avoid email enumeration,
      // but log internally. Real delivery errors are usually rate-limit.
    }

    setSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-linen-200 via-sage-50 to-navy-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <Image
              src="/reset-yoga-logo.png"
              alt="Reset Yoga"
              width={1536}
              height={1024}
              className="h-16 w-auto object-contain dark:brightness-[2.5] dark:saturate-[0.8]"
              priority
            />
          </Link>
        </div>

        {sent ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('forgot_password_success_title')}
            </h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-5">
              {t('forgot_password_success_desc', { email })}
            </p>

            {/* Step-by-step guide */}
            <div className="bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-700 rounded-xl p-4 text-sm text-navy-800 dark:text-navy-200 text-left mb-4 space-y-2">
              <p className="font-semibold text-navy-900 dark:text-white">
                {t('reset_steps_title')}
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>{t('reset_step_1')}</li>
                <li>{t('reset_step_2')}</li>
                <li>{t('reset_step_3')}</li>
                <li>{t('reset_step_4')}</li>
              </ol>
            </div>

            {/* Spam warning */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300 text-left mb-5 flex gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{t('reset_spam_note')}</p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setSent(false); setSendError('') }}
                className="text-sm text-navy-600 dark:text-sage-400 hover:underline"
              >
                {t('reset_resend')}
              </button>
              <Link
                href="/login"
                className="text-sm text-gray-500 dark:text-navy-400 hover:underline"
              >
                ← {t('back_to_login')}
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────────────────── */
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {t('forgot_password_title')}
            </h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              {t('forgot_password_subtitle')}
            </p>

            {sendError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {sendError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="dark:text-gray-200">{t('email')}</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-navy-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-9 dark:bg-navy-700 dark:border-navy-600 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-600 hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-600 text-white h-11"
                disabled={loading}
              >
                {loading ? t('forgot_password_sending') : t('forgot_password_btn')}
              </Button>
            </form>

            <p className="text-center text-sm mt-6">
              <Link
                href="/login"
                className="text-gray-500 dark:text-navy-400 hover:text-navy-600 dark:hover:text-sage-400 hover:underline transition-colors"
              >
                ← {t('back_to_login')}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ForgotPasswordForm />
    </Suspense>
  )
}
