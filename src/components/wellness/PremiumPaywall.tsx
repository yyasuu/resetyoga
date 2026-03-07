'use client'

import { useState } from 'react'
import { Lock, CheckCircle, CreditCard, Sparkles, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PremiumPaywallProps {
  locale: string
  contentPreview: string | null
}

const BENEFITS = [
  { ja: 'ウェルネスコラム読み放題（全記事）',   en: 'Unlimited access to all wellness articles' },
  { ja: '瞑想・ヨガ動画が見放題',               en: 'Unlimited meditation & yoga videos' },
  { ja: 'レッスン月4回まで受講可能',             en: 'Up to 4 live lessons per month' },
  { ja: 'いつでもキャンセル可能・縛りなし',       en: 'Cancel anytime — no commitment' },
]

export function PremiumPaywall({ locale, contentPreview }: PremiumPaywallProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(locale === 'ja' ? '決済の開始に失敗しました。もう一度お試しください。' : 'Failed to start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      setError(locale === 'ja' ? 'エラーが発生しました。' : 'An error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {/* Blurred content preview */}
      {contentPreview && (
        <div className="relative overflow-hidden" style={{ maxHeight: '120px' }}>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
            {contentPreview}
          </p>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-linen-50/70 to-linen-50 dark:via-navy-900/70 dark:to-navy-900 pointer-events-none" />
        </div>
      )}

      {/* Paywall card */}
      <div className="mt-4 rounded-3xl overflow-hidden border border-amber-200 dark:border-amber-800/40 shadow-2xl">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 px-8 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            {locale === 'ja' ? 'プレミアム会員限定コンテンツ' : 'Premium Members Only'}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
            {locale === 'ja'
              ? 'このコラムは有料コンテンツです'
              : 'This article is premium content'}
          </h2>
          <p className="text-white/85 text-sm">
            {locale === 'ja'
              ? 'サブスクリプション登録で続きをお読みください'
              : 'Subscribe to continue reading'}
          </p>
        </div>

        {/* Body */}
        <div className="bg-white dark:bg-navy-800 px-8 py-8">
          {/* Price */}
          <div className="text-center mb-6">
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-4xl font-extrabold text-gray-900 dark:text-white">$19.99</span>
              <span className="text-gray-400 dark:text-navy-400 text-sm mb-1.5">
                {locale === 'ja' ? '/ 月' : '/ month'}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-navy-400">
              {locale === 'ja' ? '月々更新・いつでもキャンセル可能' : 'Monthly billing · cancel anytime'}
            </p>
          </div>

          {/* Benefits */}
          <div className="bg-linen-50 dark:bg-navy-900 rounded-2xl p-5 mb-6">
            <p className="text-xs font-bold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-4">
              {locale === 'ja' ? 'プランに含まれるもの' : "What's included"}
            </p>
            <ul className="space-y-3">
              {BENEFITS.map((item) => (
                <li key={item.en} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-200">
                  <CheckCircle className="h-4 w-4 text-sage-500 flex-shrink-0" />
                  {locale === 'ja' ? item.ja : item.en}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg mb-4 text-center">
              {error}
            </p>
          )}

          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full bg-navy-700 hover:bg-navy-800 text-white py-4 text-base font-bold rounded-2xl h-auto shadow-lg mb-3"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {locale === 'ja' ? 'Stripeへ移動中...' : 'Redirecting to Stripe...'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                {locale === 'ja'
                  ? '月$19.99でサブスクリプション開始'
                  : 'Start Subscription · $19.99/month'}
              </span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-navy-400">
            <ShieldCheck className="h-3.5 w-3.5 text-sage-500" />
            {locale === 'ja'
              ? 'Stripeによる安全な決済処理。カード情報は当サイトに保存されません。'
              : 'Secure payment via Stripe. Your card details are never stored on our servers.'}
          </div>
        </div>
      </div>
    </div>
  )
}
