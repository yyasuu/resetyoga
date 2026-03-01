'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError(t('password_too_short'))
      return
    }
    if (password !== confirm) {
      setError(t('password_mismatch'))
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setDone(true)
    // Auto-redirect to login after 3 seconds
    setTimeout(() => router.push('/login'), 3000)
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

        {done ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t('reset_password_title')}
            </h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              {t('reset_password_success')}
            </p>
            <p className="text-xs text-gray-400 dark:text-navy-500 mb-4">
              Redirecting to login...
            </p>
            <Link
              href="/login"
              className="inline-block bg-navy-600 hover:bg-navy-700 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              {t('sign_in')} →
            </Link>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────────────────── */
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {t('reset_password_title')}
            </h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              {t('reset_password_subtitle')}
            </p>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password" className="dark:text-gray-200">
                  {t('new_password')}
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10 dark:bg-navy-700 dark:border-navy-600 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-navy-400 hover:text-gray-600 dark:hover:text-navy-200"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">8 characters minimum</p>
              </div>

              <div>
                <Label htmlFor="confirm" className="dark:text-gray-200">
                  {t('confirm_password')}
                </Label>
                <Input
                  id="confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="mt-1 dark:bg-navy-700 dark:border-navy-600 dark:text-gray-100 dark:placeholder-gray-500"
                />
                {confirm && confirm !== password && (
                  <p className="text-xs text-red-500 mt-1">{t('password_mismatch')}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-navy-600 hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-600 text-white h-11"
                disabled={loading || (confirm.length > 0 && confirm !== password)}
              >
                {loading ? t('reset_password_updating') : t('reset_password_btn')}
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
