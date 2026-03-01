'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, AlertTriangle } from 'lucide-react'

// ── URL-error banner (needs Suspense because of useSearchParams) ──────────────
function UrlErrorBanner() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  if (!error) return null

  const messages: Record<string, { title: string; body: string }> = {
    link_expired: {
      title: t('link_expired_title'),
      body: t('link_expired_body'),
    },
    auth_failed: {
      title: t('link_expired_title'),
      body: t('link_expired_body'),
    },
  }
  const msg = messages[error] ?? {
    title: t('link_expired_title'),
    body: t('link_expired_body'),
  }

  return (
    <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 flex gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm">
        <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">{msg.title}</p>
        <p className="text-amber-800 dark:text-amber-300">{msg.body}</p>
        <Link
          href="/forgot-password"
          className="mt-2 inline-block font-semibold text-navy-700 dark:text-sage-400 underline underline-offset-2 hover:opacity-80"
        >
          {t('reset_password_link')}
        </Link>
      </div>
    </div>
  )
}

// ── Main login form ───────────────────────────────────────────────────────────
function LoginForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  // 'none' | 'password'
  const [loginError, setLoginError] = useState<'none' | 'password'>('none')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginError('none')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoginError('password')
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'instructor') {
        router.push('/instructor/dashboard')
      } else if (profile?.role === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('login_title')}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t('login_subtitle')}</p>
        </div>

        {/* URL error banner (e.g. expired email link) */}
        <Suspense>
          <UrlErrorBanner />
        </Suspense>

        {/* Wrong-password inline banner */}
        {loginError === 'password' && (
          <div className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  {t('login_title')}
                </p>
                {/* Option A: Google */}
                <p className="text-amber-800 dark:text-amber-300">
                  {t('login_error_google')}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/30 h-8 text-xs"
                  onClick={handleGoogleLogin}
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {t('google_btn')}
                </Button>
                {/* Option B: Reset password */}
                <div className="border-t border-amber-200 dark:border-amber-800 pt-2 mt-2">
                  <p className="text-amber-800 dark:text-amber-300">
                    {t('login_error_password')}
                  </p>
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
                    className="inline-block mt-1.5 font-semibold text-navy-700 dark:text-sage-400 underline underline-offset-2 hover:opacity-80"
                  >
                    {t('reset_password_link')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Google Sign In */}
        <Button
          variant="outline"
          className="w-full mb-4 h-11 border-gray-300 dark:border-navy-600 dark:bg-navy-700 dark:text-gray-200 dark:hover:bg-navy-600"
          onClick={handleGoogleLogin}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {t('google_btn')}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-navy-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-400">or</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="dark:text-gray-200">{t('email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1 dark:bg-navy-700 dark:border-navy-600 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <div>
            <Label htmlFor="password" className="dark:text-gray-200">{t('password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1 dark:bg-navy-700 dark:border-navy-600 dark:text-gray-100 dark:placeholder-gray-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-navy-600 hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-600 text-white h-11"
            disabled={loading}
          >
            {loading ? 'Signing in...' : t('login_btn')}
          </Button>

          {/* Forgot password — always visible below Sign In */}
          <p className="text-center text-sm">
            <Link
              href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="text-gray-500 dark:text-navy-400 hover:text-navy-600 dark:hover:text-sage-400 hover:underline transition-colors"
            >
              {t('forgot_password')}
            </Link>
          </p>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          {t('no_account')}{' '}
          <Link href="/register" className="text-navy-600 dark:text-sage-400 font-medium hover:underline">
            {t('sign_up')}
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  )
}
