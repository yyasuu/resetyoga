'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronRight, ChevronLeft, Plus, X, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLocale } from 'next-intl'
import type { Profile } from '@/types'

const YOGA_STYLES = ['Hatha','Vinyasa','Ashtanga','Yin','Restorative','Kundalini','Bikram','Power','Prenatal','Kids','Chair','Aerial','Meditation','Breathwork','Other']
const LANGUAGES   = ['English','Japanese','Hindi','Spanish','French','German','Portuguese','Korean','Chinese','Indonesian','Thai','Vietnamese','Other']
const TOTAL_STEPS = 3

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div className={`flex-1 h-1.5 rounded-full transition-colors ${i < step ? 'bg-sage-500' : i === step ? 'bg-sage-300' : 'bg-gray-200 dark:bg-navy-700'}`} />
        </div>
      ))}
      <span className="text-xs text-gray-400 dark:text-navy-400 whitespace-nowrap ml-1">
        {step + 1} / {TOTAL_STEPS}
      </span>
    </div>
  )
}

interface Props {
  profile: Profile
  alreadyApplied: boolean
}

export default function ApplyForm({ profile, alreadyApplied }: Props) {
  const router = useRouter()
  const locale = useLocale()
  const ja = locale === 'ja'
  const supabase = createClient()

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(alreadyApplied)

  // Step 1
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages]   = useState<string[]>([])
  const [tagline, setTagline]       = useState('')
  const [bio, setBio]               = useState('')

  // Step 2
  const [yearsExperience, setYearsExperience] = useState(1)
  const [certInput, setCertInput]             = useState('')
  const [certifications, setCertifications]   = useState<string[]>([])
  const [careerHistory, setCareerHistory]     = useState('')
  const [instagramUrl, setInstagramUrl]       = useState('')
  const [youtubeUrl, setYoutubeUrl]           = useState('')

  // Step 3
  const [agreed, setAgreed] = useState(false)

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]
  }

  function addCert() {
    const v = certInput.trim()
    if (!v || certifications.length >= 20) return
    setCertifications(prev => [...prev, v])
    setCertInput('')
  }

  function validate(): boolean {
    if (step === 0) {
      if (yogaStyles.length === 0) { toast.error(ja ? 'ヨガスタイルを1つ以上選択してください。' : 'Select at least one yoga style.'); return false }
      if (languages.length === 0)  { toast.error(ja ? '指導言語を1つ以上選択してください。' : 'Select at least one teaching language.'); return false }
    }
    if (step === 2 && !agreed) { toast.error(ja ? '規約に同意してください。' : 'Please agree to the terms.'); return false }
    return true
  }

  function next() { if (validate()) setStep(s => s + 1) }
  function back() { setStep(s => s - 1) }

  async function handleSubmit() {
    if (!validate()) return
    setLoading(true)
    try {
      // 1. Update profiles.role to 'instructor'
      const { error: roleError } = await supabase
        .from('profiles')
        .update({ role: 'instructor' })
        .eq('id', profile.id)

      if (roleError) throw new Error(roleError.message)

      // 2. Submit instructor profile via existing API
      const res = await fetch('/api/onboarding/instructor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tagline: tagline || null,
          bio: bio || null,
          yogaStyles,
          languages,
          yearsExperience,
          certifications,
          careerHistory: careerHistory || null,
          instagramUrl: instagramUrl || null,
          youtubeUrl: youtubeUrl || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Submission failed.')
      }

      setDone(true)
    } catch (err: any) {
      toast.error(err.message || (ja ? '予期しないエラーが発生しました。' : 'Unexpected error. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 bg-sage-100 dark:bg-sage-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-sage-600 dark:text-sage-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {ja ? '申請を受け付けました！' : 'Application submitted!'}
        </h2>
        <p className="text-gray-500 dark:text-navy-300 mb-2 leading-relaxed">
          {ja
            ? '審査が完了次第、メールでご連絡します。通常1〜3営業日以内にご連絡します。'
            : 'We\'ll review your application and reach out by email. This usually takes 1–3 business days.'}
        </p>
        <p className="text-sm text-gray-400 dark:text-navy-400 mb-8">
          {ja
            ? '承認されるまでは生徒として引き続きご利用いただけます。'
            : 'You can continue using Reset Yoga as a student while we review your application.'}
        </p>
        <Button
          onClick={() => router.push('/instructor/dashboard')}
          className="bg-navy-600 hover:bg-navy-700 text-white rounded-full px-7"
        >
          {ja ? '講師ダッシュボードへ' : 'Go to Instructor Dashboard'}
        </Button>
      </div>
    )
  }

  const inputCls = 'w-full rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-700 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-sage-400 dark:focus:ring-sage-500'
  const chipBase = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors select-none'
  const chipOn  = 'bg-sage-500 text-white border-sage-500'
  const chipOff = 'bg-white dark:bg-navy-700 text-gray-600 dark:text-navy-200 border-gray-200 dark:border-navy-600 hover:border-sage-400 dark:hover:border-sage-500'

  return (
    <>
      <ProgressBar step={step} />

      {/* ── Step 1: Your Practice ───────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              {ja ? 'あなたのPractice' : 'Your Practice'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-navy-400">
              {ja ? '教えているスタイルと言語を教えてください。' : 'Tell us what you teach and in what languages.'}
            </p>
          </div>

          {/* Yoga Styles */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? 'ヨガスタイル' : 'Yoga Styles'} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {YOGA_STYLES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setYogaStyles(prev => toggle(prev, s))}
                  className={`${chipBase} ${yogaStyles.includes(s) ? chipOn : chipOff}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? '指導言語' : 'Teaching Languages'} <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguages(prev => toggle(prev, l))}
                  className={`${chipBase} ${languages.includes(l) ? chipOn : chipOff}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? 'タグライン（任意）' : 'Tagline (optional)'}
            </label>
            <input
              value={tagline}
              onChange={e => setTagline(e.target.value.slice(0, 60))}
              placeholder={ja ? '例：ヨガで心と体をリセット' : 'e.g. Reset your mind and body through yoga'}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{tagline.length}/60</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? '自己紹介（任意）' : 'Bio (optional)'}
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value.slice(0, 3000))}
              rows={4}
              placeholder={ja ? 'ヨガとの出会い、指導スタイル、得意なことなど…' : 'Your yoga journey, teaching style, what students can expect…'}
              className={inputCls}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/3000</p>
          </div>
        </div>
      )}

      {/* ── Step 2: Experience ──────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              {ja ? '経験・資格' : 'Experience & Credentials'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-navy-400">
              {ja ? 'あなたの指導経験と資格を教えてください。' : 'Share your teaching background and qualifications.'}
            </p>
          </div>

          {/* Years */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? '指導経験（年数）' : 'Years of Teaching Experience'}
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={yearsExperience}
              onChange={e => setYearsExperience(Math.max(0, Math.min(60, Number(e.target.value))))}
              className={`${inputCls} w-28`}
            />
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? '資格・認定（任意）' : 'Certifications (optional)'}
            </label>
            <div className="flex gap-2 mb-3">
              <input
                value={certInput}
                onChange={e => setCertInput(e.target.value.slice(0, 100))}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCert() } }}
                placeholder={ja ? '例：RYT 200、全米ヨガアライアンス' : 'e.g. RYT 200, Yoga Alliance'}
                className={inputCls}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addCert}
                className="rounded-xl shrink-0 dark:border-navy-600 dark:text-gray-200"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {certifications.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300 border border-sage-200 dark:border-sage-800 px-3 py-1 rounded-full text-xs">
                    {c}
                    <button onClick={() => setCertifications(prev => prev.filter((_, j) => j !== i))} className="hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Career History */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
              {ja ? '経歴（任意）' : 'Career History (optional)'}
            </label>
            <textarea
              value={careerHistory}
              onChange={e => setCareerHistory(e.target.value.slice(0, 3000))}
              rows={3}
              placeholder={ja ? 'これまでの指導歴、スタジオ経験など…' : 'Where you\'ve taught, studios you\'ve worked with…'}
              className={inputCls}
            />
          </div>

          {/* Social */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
                Instagram（任意）
              </label>
              <input
                value={instagramUrl}
                onChange={e => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/..."
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-navy-200 mb-2">
                YouTube（任意）
              </label>
              <input
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
                placeholder="https://youtube.com/..."
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Terms & Submit ──────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">
              {ja ? '確認して申請' : 'Review & Submit'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-navy-400">
              {ja ? '規約に同意のうえ、申請してください。' : 'Agree to the terms and submit your application.'}
            </p>
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-700/40 p-5 space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="text-gray-400 dark:text-navy-400 w-28 shrink-0">{ja ? 'ヨガスタイル' : 'Yoga Styles'}</span>
              <span className="text-gray-800 dark:text-white">{yogaStyles.join(', ') || '—'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 dark:text-navy-400 w-28 shrink-0">{ja ? '指導言語' : 'Languages'}</span>
              <span className="text-gray-800 dark:text-white">{languages.join(', ') || '—'}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 dark:text-navy-400 w-28 shrink-0">{ja ? '経験年数' : 'Experience'}</span>
              <span className="text-gray-800 dark:text-white">{yearsExperience} {ja ? '年' : 'years'}</span>
            </div>
            {certifications.length > 0 && (
              <div className="flex gap-3">
                <span className="text-gray-400 dark:text-navy-400 w-28 shrink-0">{ja ? '資格' : 'Certs'}</span>
                <span className="text-gray-800 dark:text-white">{certifications.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="rounded-xl border border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 p-5 text-sm text-gray-600 dark:text-navy-300 space-y-2 leading-relaxed max-h-48 overflow-y-auto">
            <p className="font-semibold text-gray-800 dark:text-white">
              {ja ? '講師利用規約（要旨）' : 'Instructor Terms Summary'}
            </p>
            <p>{ja
              ? '・ Reset Yogaは、スケジュール管理・集客・決済を代行します。'
              : '· Reset Yoga handles scheduling, discovery, and payments on your behalf.'}</p>
            <p>{ja
              ? '・ 生徒との直接取引（プラットフォーム外での決済）は禁止です。'
              : '· Direct transactions with students outside the platform are prohibited.'}</p>
            <p>{ja
              ? '・ セッションは誠実に、予約通りに実施してください。'
              : '· Sessions must be conducted honestly and as booked.'}</p>
            <p>{ja
              ? '・ 振込は月次で行われます。詳細はダッシュボードで設定できます。'
              : '· Payouts are processed monthly. You can configure bank details in your dashboard.'}</p>
            <p>{ja
              ? '・ Reset Yogaはアカウントを随時審査・停止できる権利を有します。'
              : '· Reset Yoga reserves the right to review or suspend accounts at any time.'}</p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-sage-500"
            />
            <span className="text-sm text-gray-700 dark:text-navy-200">
              {ja
                ? '上記の講師利用規約を読み、同意します。'
                : 'I have read and agree to the Instructor Terms above.'}
            </span>
          </label>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────────────── */}
      <div className={`flex mt-8 ${step > 0 ? 'justify-between' : 'justify-end'}`}>
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={back}
            disabled={loading}
            className="gap-1.5 rounded-full px-5 dark:border-navy-600 dark:text-gray-200"
          >
            <ChevronLeft className="h-4 w-4" />
            {ja ? '戻る' : 'Back'}
          </Button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <Button
            type="button"
            onClick={next}
            className="gap-1.5 rounded-full px-6 bg-navy-600 hover:bg-navy-700 text-white"
          >
            {ja ? '次へ' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !agreed}
            className="gap-1.5 rounded-full px-7 bg-sage-500 hover:bg-sage-600 text-white"
          >
            {loading
              ? (ja ? '送信中…' : 'Submitting…')
              : (ja ? '申請する' : 'Submit Application')}
          </Button>
        )}
      </div>
    </>
  )
}
