'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle } from 'lucide-react'

const TIERS = [
  { id: 'tier1', name: 'Tier 1 — 一般Premium講師', price: '¥2,500〜4,500/クラス', desc: '認定資格を持ち、品質審査を通過した講師' },
  { id: 'tier2', name: 'Tier 2 — 認定・高評価講師', price: '¥4,500〜8,000/クラス', desc: '継続率・満足度が高い、実績ある専門講師' },
  { id: 'tier3', name: 'Tier 3 — 有名・希少テーマ講師', price: '¥8,000〜20,000/クラス', desc: '希少な専門性または著名な実績を持つ講師' },
  { id: 'tier4', name: 'Tier 4 — 1on1・少人数特別枠', price: '¥15,000〜50,000/回', desc: 'マンツーマンまたは定員3名以下の個別指導' },
]

const CATEGORIES = [
  { id: 'desk',      label: '💻 デスクワーカー回復' },
  { id: 'sleep',     label: '🌙 睡眠・神経系' },
  { id: 'womens',    label: '🌸 女性のバランス・育児' },
  { id: 'elite',     label: '🏆 エリートマスター' },
  { id: 'beginner',  label: '🌱 ビギナーガイド' },
  { id: 'athletic',  label: '⚡ アスリートモビリティ' },
  { id: 'luxury',    label: '💎 マインドフルラグジュアリー' },
  { id: 'english',   label: '🌍 English Global' },
  { id: 'celebrity', label: '⭐ セレブリティ講師' },
  { id: 'japanese',  label: '🎋 ジャパニーズカーム' },
]

export default function PremiumApplyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    proposed_tier:   'tier1',
    categories:      [] as string[],
    bio_premium_ja:  '',
    bio_premium_en:  '',
    specialties:     '',
    proposal_reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const toggleCategory = (id: string) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(id)
        ? f.categories.filter((c) => c !== id)
        : f.categories.length < 5 ? [...f.categories, id] : f.categories,
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/instructor/premium/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '申請に失敗しました')
      } else {
        setDone(true)
      }
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-navy-800 rounded-2xl p-8 text-center border border-gray-100 dark:border-navy-700 shadow-sm">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-navy-800 dark:text-white mb-2">申請を受け付けました</h2>
          <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
            審査には通常3〜7営業日いただきます。結果はメールでお知らせします。
          </p>
          <Link href="/instructor/dashboard" className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            ダッシュボードへ戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link href="/instructor/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-6">
          <ChevronLeft className="h-4 w-4" /> ダッシュボードへ戻る
        </Link>

        <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl p-8 shadow-sm">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? 'bg-navy-600 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-400'
                }`}>{s}</div>
                {s < 3 && <div className={`flex-1 h-px w-12 ${step > s ? 'bg-navy-600' : 'bg-gray-200 dark:bg-navy-600'}`} />}
              </div>
            ))}
            <p className="ml-2 text-sm text-gray-500 dark:text-navy-300">
              {step === 1 ? 'Tier選択' : step === 2 ? 'カテゴリ・自己紹介' : '提案理由・確認'}
            </p>
          </div>

          <h1 className="text-xl font-bold text-navy-800 dark:text-white mb-1">Premium講師 申請</h1>
          <p className="text-sm text-gray-500 dark:text-navy-300 mb-8">
            審査・承認後にPremiumクラスの公開・受講者募集が可能になります。
          </p>

          {/* ── Step 1: Tier ── */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">希望するTierを選択してください</p>
              {TIERS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setForm((f) => ({ ...f, proposed_tier: t.id }))}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    form.proposed_tier === t.id
                      ? 'border-navy-600 bg-navy-50 dark:bg-navy-700 dark:border-sage-400'
                      : 'border-gray-200 dark:border-navy-600 hover:border-sage-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-sm text-navy-800 dark:text-white">{t.name}</p>
                    <p className="text-sage-600 dark:text-sage-400 font-semibold text-sm">{t.price}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-navy-300">{t.desc}</p>
                </button>
              ))}
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  次へ →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 2: Categories + Bio ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">専門カテゴリ（1〜5つ選択）</p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => toggleCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                        form.categories.includes(c.id)
                          ? 'bg-navy-600 border-navy-600 text-white'
                          : 'bg-white dark:bg-navy-700 border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-sage-400'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                  Premium向け自己紹介（日本語・必須）
                </label>
                <p className="text-xs text-gray-400 mb-2">どんな不調に強いか、どんな受講者に向いているかを書いてください</p>
                <textarea
                  value={form.bio_premium_ja}
                  onChange={(e) => setForm((f) => ({ ...f, bio_premium_ja: e.target.value }))}
                  rows={5}
                  placeholder="例：デスクワークで慢性的な肩こりを抱えるビジネスパーソンを専門としています。15年の指導経験と理学療法士の知見を活かし..."
                  className="w-full border border-gray-200 dark:border-navy-600 rounded-xl p-3 text-sm bg-white dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                  得意分野・資格（任意）
                </label>
                <textarea
                  value={form.specialties}
                  onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
                  rows={3}
                  placeholder="例：RYT500取得、理学療法士、産前産後ヨガ指導士、10年以上の指導経験 など"
                  className="w-full border border-gray-200 dark:border-navy-600 rounded-xl p-3 text-sm bg-white dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="px-5 py-2.5 border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                  ← 戻る
                </button>
                <button
                  onClick={() => { if (form.categories.length === 0 || !form.bio_premium_ja) { setError('カテゴリと自己紹介は必須です'); return; } setError(''); setStep(3) }}
                  className="px-6 py-2.5 bg-navy-600 hover:bg-navy-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  次へ →
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          {/* ── Step 3: Reason + Confirm ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 block mb-1">
                  提案Tier・価格の理由（必須）
                </label>
                <p className="text-xs text-gray-400 mb-2">なぜこのTierが適切か、どんな価値を提供できるかを説明してください</p>
                <textarea
                  value={form.proposal_reason}
                  onChange={(e) => setForm((f) => ({ ...f, proposal_reason: e.target.value }))}
                  rows={5}
                  placeholder="例：15年の臨床経験と指導実績があり、受講者の80%以上が3ヶ月以内に症状改善を報告しています。他サービスでは¥6,000〜8,000のクラスを提供してきた実績があります。"
                  className="w-full border border-gray-200 dark:border-navy-600 rounded-xl p-3 text-sm bg-white dark:bg-navy-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-sage-400"
                />
              </div>

              {/* Summary */}
              <div className="bg-linen-50 dark:bg-navy-700 rounded-xl p-4 space-y-2 text-sm">
                <p className="font-semibold text-navy-800 dark:text-white mb-2">申請内容の確認</p>
                <p className="text-gray-600 dark:text-navy-200"><span className="text-gray-400">希望Tier:</span> {TIERS.find((t) => t.id === form.proposed_tier)?.name}</p>
                <p className="text-gray-600 dark:text-navy-200"><span className="text-gray-400">カテゴリ:</span> {form.categories.join(', ')}</p>
                <p className="text-gray-600 dark:text-navy-200 line-clamp-2"><span className="text-gray-400">自己紹介:</span> {form.bio_premium_ja}</p>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex justify-between">
                <button onClick={() => setStep(2)} className="px-5 py-2.5 border border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-navy-700 transition-colors">
                  ← 戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !form.proposal_reason}
                  className="px-6 py-2.5 bg-navy-600 hover:bg-navy-700 disabled:opacity-60 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  {loading ? '送信中...' : '申請を送信する →'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
