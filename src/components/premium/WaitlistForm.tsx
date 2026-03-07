'use client'

import { useState } from 'react'

const CONCERNS_JA = ['肩こり・首こり', '睡眠の質', 'ストレス・メンタル', 'ママ向け・産後ケア', '腰痛', '疲労回復', 'その他']
const CONCERNS_EN = ['Shoulder / Neck', 'Sleep Quality', 'Stress / Mental', 'Mama / Postnatal', 'Lower Back', 'Fatigue Recovery', 'Other']

export function WaitlistForm({ locale }: { locale: string }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [concern, setConcern] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const concerns = locale === 'ja' ? CONCERNS_JA : CONCERNS_EN

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/premium/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, concern, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error?.includes('duplicate') || data.error?.includes('already')) {
          setDone(true)
        } else {
          setError(data.error ?? (locale === 'ja' ? '登録に失敗しました' : 'Registration failed'))
        }
      } else {
        setDone(true)
      }
    } catch {
      setError(locale === 'ja' ? '通信エラーが発生しました' : 'Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">✓</div>
        <p className="font-bold text-white text-lg mb-2">
          {locale === 'ja' ? '登録が完了しました！' : 'You\'re on the list!'}
        </p>
        <p className="text-white/70 text-sm">
          {locale === 'ja'
            ? 'ローンチ時に優先的にご連絡します。楽しみにお待ちください。'
            : 'We\'ll reach out when Premium launches. Stay tuned!'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={locale === 'ja' ? 'お名前（任意）' : 'Your name (optional)'}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sage-400"
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={locale === 'ja' ? 'メールアドレス*' : 'Email address *'}
        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:border-sage-400"
      />
      <div>
        <p className="text-xs text-white/60 mb-2">{locale === 'ja' ? '主なお悩みは？（任意）' : 'Main concern? (optional)'}</p>
        <div className="flex flex-wrap gap-2">
          {concerns.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setConcern(concern === c ? '' : c)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                concern === c
                  ? 'bg-sage-500 border-sage-400 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:border-sage-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-300 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sage-500 hover:bg-sage-400 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
      >
        {loading
          ? (locale === 'ja' ? '送信中...' : 'Submitting...')
          : (locale === 'ja' ? '先行登録する（無料）' : 'Join the waitlist (free)')}
      </button>
      <p className="text-xs text-white/40 text-center">
        {locale === 'ja' ? 'スパムは送りません。いつでも退会できます。' : 'No spam. Unsubscribe anytime.'}
      </p>
    </form>
  )
}
