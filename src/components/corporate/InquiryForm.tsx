'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'

const TEAM_SIZES = ['1–5', '6–15', '16–30', '31–50', '51–100', '100+']
const PLANS = [
  { value: 'starter', label: 'Starter — $199/mo' },
  { value: 'pro', label: 'Pro — $399/mo' },
  { value: 'scale', label: 'Scale — $799/mo' },
  { value: 'unsure', label: 'Not sure yet' },
]

export function InquiryForm({ locale }: { locale: 'en' | 'ja' }) {
  const ja = locale === 'ja'
  const [form, setForm] = useState({ name: '', email: '', company: '', team_size: '', plan: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/corporate/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setSent(true)
    } catch {
      setError(ja ? '送信に失敗しました。もう一度お試しください。' : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-sage-500 mb-5" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {ja ? 'お問い合わせありがとうございます' : 'Thanks — we\'ll be in touch.'}
        </h3>
        <p className="text-gray-500 dark:text-navy-300 max-w-sm">
          {ja
            ? '1営業日以内にご連絡いたします。'
            : 'Expect a reply within one business day.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {ja ? '氏名' : 'Your name'} <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder={ja ? '山田 太郎' : 'Alex Johnson'}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {ja ? 'メールアドレス' : 'Work email'} <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder="you@company.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {ja ? '会社名' : 'Company'} <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={form.company}
          onChange={e => set('company', e.target.value)}
          placeholder={ja ? '株式会社〇〇' : 'Acme Inc.'}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-400"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {ja ? 'チーム人数' : 'Team size'} <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {TEAM_SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('team_size', s)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.team_size === s
                    ? 'bg-navy-600 border-navy-600 text-white'
                    : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-navy-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {ja ? '興味のあるプラン' : 'Plan interest'}
          </label>
          <div className="flex flex-col gap-1.5">
            {PLANS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => set('plan', p.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border text-left transition-all ${
                  form.plan === p.value
                    ? 'bg-sage-500 border-sage-500 text-white'
                    : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-sage-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {ja ? 'メッセージ（任意）' : 'Message (optional)'}
        </label>
        <textarea
          rows={3}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder={ja
            ? 'ご要望・ご質問があればお書きください'
            : 'Anything you\'d like us to know — goals, timing, questions.'}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <Button
        type="submit"
        disabled={loading || !form.name || !form.email || !form.company || !form.team_size}
        className="w-full bg-navy-600 hover:bg-navy-700 text-white py-3 rounded-xl text-base font-semibold"
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
          : ja ? 'お問い合わせを送る' : 'Send inquiry'}
      </Button>

      <p className="text-xs text-center text-gray-400 dark:text-navy-400">
        {ja ? '通常1営業日以内にご返信します。' : 'We reply within one business day. No sales pressure.'}
      </p>
    </form>
  )
}
