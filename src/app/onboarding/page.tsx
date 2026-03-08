'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { YOGA_STYLES, LANGUAGES, TIMEZONES } from '@/types'
import {
  GraduationCap, BookOpen, CheckCircle, Camera, Plus, X,
  ChevronLeft, ChevronRight, Instagram, Youtube, Landmark,
  HelpCircle, Info, AlertCircle, BookMarked, Loader2,
} from 'lucide-react'
import Image from 'next/image'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// ─────────────────────────────────────────────────────────────
// Tooltip — hover/focus to show helper text
// ─────────────────────────────────────────────────────────────
function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false)
  return (
    <span
      className="relative inline-flex items-center ml-1.5 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-navy-500 transition-colors" />
      {show && (
        <span className="absolute z-50 left-5 top-0 w-72 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl leading-relaxed pointer-events-none">
          {text}
          <span className="absolute left-[-5px] top-2 w-0 h-0 border-y-4 border-r-4 border-y-transparent border-r-gray-900" />
        </span>
      )}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Field label — shows ※ + red text when error, tooltip on hover
// ─────────────────────────────────────────────────────────────
function FieldLabel({
  label, htmlFor, required, tooltip, error,
}: {
  label: string; htmlFor?: string; required?: boolean; tooltip?: string; error?: string
}) {
  return (
    <label htmlFor={htmlFor} className="flex items-start flex-wrap gap-x-1 text-sm font-medium text-gray-700 dark:text-navy-200 mb-1">
      {error && <span className="text-red-500 font-bold">※</span>}
      <span>{label}</span>
      {required && !error && <span className="text-red-400 text-xs">*</span>}
      {tooltip && <InfoTooltip text={tooltip} />}
      {error && <span className="text-red-500 text-xs font-normal ml-1">{error}</span>}
    </label>
  )
}

// ─────────────────────────────────────────────────────────────
// Tag toggle button
// ─────────────────────────────────────────────────────────────
function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        selected
          ? 'bg-navy-600 text-white border-navy-600'
          : 'bg-white dark:bg-navy-700 text-gray-600 dark:text-navy-200 border-gray-300 dark:border-navy-600 hover:border-navy-400'
      }`}
    >
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Visual step progress bar with labels
// ─────────────────────────────────────────────────────────────
const STEP_LABELS = [
  { en: 'Profile', ja: 'プロフィール' },
  { en: 'Specialty', ja: '専門性' },
  { en: 'Experience', ja: '経験' },
  { en: 'Payout', ja: '支払い' },
  { en: 'Terms', ja: '利用規約' },
]

function ProgressStepper({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`h-2 rounded-full w-full transition-all duration-300 ${
              i < current ? 'bg-navy-600' : i === current ? 'bg-navy-300 dark:bg-navy-500' : 'bg-gray-200 dark:bg-navy-700'
            }`} />
          </div>
        ))}
      </div>
      <div className="flex justify-between">
        {STEP_LABELS.slice(0, total).map((s, i) => (
          <span key={i} className={`text-[10px] font-medium transition-colors ${
            i === current ? 'text-navy-600 dark:text-sage-400' : i < current ? 'text-navy-400 dark:text-navy-500' : 'text-gray-300 dark:text-navy-600'
          }`}>
            {s.en}
          </span>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-navy-400 text-right mt-1">
        Step {current + 1} of {total}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Step Guide Modal — floating button + popup
// ─────────────────────────────────────────────────────────────
const GUIDE_STEPS = [
  {
    num: 1, icon: '📸',
    title: 'Profile Photo & Name',
    titleJa: 'プロフィール写真と名前',
    items: [
      'Upload a clear, professional headshot (smiling is great!)',
      'Use your real or professional instructor name',
      'Photo should be well-lit with a simple background',
    ],
    itemsJa: [
      'プロフェッショナルな顔写真をアップロード（笑顔推奨）',
      '本名またはインストラクターとしての名前を入力',
      '明るい背景でシンプルな写真が理想的',
    ],
  },
  {
    num: 2, icon: '🧘',
    title: 'Your Specialty',
    titleJa: '専門性・自己紹介',
    items: [
      'Tagline: One punchy sentence about your teaching style',
      'Bio: Your yoga journey, philosophy, and what students can expect',
      'Select ALL yoga styles you can teach (students search by this)',
      'Select languages you can instruct in',
    ],
    itemsJa: [
      'タグライン：指導スタイルを表す一言（60字以内）',
      'バイオ：ヨガの歩み、哲学、クラスの特徴',
      '指導できるヨガスタイルをすべて選択',
      '指導可能な言語を選択',
    ],
  },
  {
    num: 3, icon: '🎓',
    title: 'Experience & Credentials',
    titleJa: '経験・資格',
    items: [
      'Years of teaching experience (not years of practice)',
      'Add certifications one by one (e.g. RYT-200, RYT-500)',
      'Career history: studios, countries, notable achievements',
      'Instagram / YouTube links help students trust you',
    ],
    itemsJa: [
      '指導歴の年数（練習歴ではなく）',
      '資格を一つずつ追加（例：RYT-200、RYT-500）',
      '指導経験：スタジオ、国、主な実績',
      'Instagram/YouTubeリンクで信頼感アップ',
    ],
  },
  {
    num: 4, icon: '💳',
    title: 'Payout Setup',
    titleJa: '報酬受け取り設定',
    items: [
      'You can skip this and set it up later from your dashboard',
      'Stripe Connect (recommended): automated monthly payouts in USD',
      'Bank transfer: enter SWIFT code + account details',
      'India: you also need your 11-digit IFSC code',
    ],
    itemsJa: [
      'スキップ可能・後でダッシュボードから設定できます',
      'Stripe Connect（推奨）：USD建て自動月次支払い',
      '銀行振込：SWIFTコード＋口座情報を入力',
      'インド：11桁のIFSCコードも必要',
    ],
  },
  {
    num: 5, icon: '✅',
    title: 'Terms & Submission',
    titleJa: '利用規約・申請',
    items: [
      'Read the Instructor Terms carefully before agreeing',
      'Key rule: Never contact students outside the platform',
      'After submission, our team reviews your profile (1–3 days)',
      'You\'ll receive an email when approved!',
    ],
    itemsJa: [
      '利用規約をよく読んでから同意してください',
      '重要：プラットフォーム外での生徒への連絡は禁止',
      '申請後、チームが審査（1〜3営業日）',
      '承認後にメールでお知らせします！',
    ],
  },
]

function StepGuideModal({ onClose, currentStep }: { onClose: () => void; currentStep: number }) {
  return (
    <div
      className="fixed inset-0 z-[400] bg-black/60 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-navy-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-navy-800 border-b border-gray-100 dark:border-navy-700 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white">Registration Guide</h2>
            <p className="text-xs text-gray-400 dark:text-navy-400">登録ガイド · Tap any step to expand</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700">
            <X className="h-5 w-5 text-gray-500 dark:text-navy-300" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {GUIDE_STEPS.map((s, idx) => {
            const isCurrent = idx === currentStep - 1
            return (
              <div
                key={s.num}
                className={`rounded-xl border p-4 transition-all ${
                  isCurrent
                    ? 'border-navy-500 bg-navy-50 dark:bg-navy-700/60 dark:border-navy-500'
                    : 'border-gray-200 dark:border-navy-600 bg-gray-50 dark:bg-navy-900/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      Step {s.num}: {s.title}
                      {isCurrent && <span className="text-[10px] bg-navy-600 text-white px-2 py-0.5 rounded-full">Current</span>}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-navy-400">{s.titleJa}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-navy-200">
                      <span className="text-sage-500 mt-0.5 shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-2 space-y-1">
                  {s.itemsJa.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px] text-gray-400 dark:text-navy-400">
                      <span className="shrink-0">・</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Main form
// ─────────────────────────────────────────────────────────────
function OnboardingForm() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as 'instructor' | 'student') || 'student'

  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'instructor' | 'student'>(initialRole)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [termsAgreed, setTermsAgreed] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [locale, setLocaleState] = useState<'en' | 'ja'>('en')

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    setLocaleState((match?.[1] ?? 'en') as 'en' | 'ja')
  }, [])

  const toggleLocale = () => {
    const next = locale === 'ja' ? 'en' : 'ja'
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000`
    window.location.reload()
  }

  // Handle return from Stripe Connect onboarding
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('stripe_ok') === '1') {
      const savedId = localStorage.getItem('onboarding_stripe_account_id')
      if (savedId) {
        setStripeAccountId(savedId)
        localStorage.removeItem('onboarding_stripe_account_id')
      }
      setRole('instructor')
      const stepParam = params.get('step')
      if (stepParam === '6') setStep(6)
      window.history.replaceState({}, '', '/onboarding?role=instructor')
    } else if (params.get('stripe_reauth') === '1') {
      setRole('instructor')
      const stepParam = params.get('step')
      if (stepParam === '5') setStep(5)
      toast.info('Please complete Stripe Connect again to receive payouts. / Stripe設定を再度お試しください。')
      window.history.replaceState({}, '', '/onboarding?role=instructor')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Step 1
  const [timezone, setTimezone] = useState('Asia/Tokyo')

  // Step 2
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Step 3
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])

  // Step 4
  const [yearsExperience, setYearsExperience] = useState(1)
  const [certifications, setCertifications] = useState<string[]>([])
  const [certInput, setCertInput] = useState('')
  const [careerHistory, setCareerHistory] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [stripeConnecting, setStripeConnecting] = useState(false)
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null)
  const [stripeError, setStripeError] = useState<string | null>(null)

  // Step 5
  const [bankCountry, setBankCountry] = useState('Japan')
  const [bankName, setBankName] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

  const INSTRUCTOR_STEPS = 5

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item])
  }

  const addCert = () => {
    const v = certInput.trim()
    if (v && !certifications.includes(v)) {
      setCertifications([...certifications, v])
      setCertInput('')
    }
  }

  const handleStripeConnect = async () => {
    setStripeConnecting(true)
    setStripeError(null)
    try {
      const res = await fetch('/api/onboarding/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankCountry }),
      })
      const data = await res.json()
      if (data.url && data.accountId) {
        // Persist account ID so we can restore it after Stripe redirects back
        localStorage.setItem('onboarding_stripe_account_id', data.accountId)
        window.location.href = data.url
      } else {
        const msg = data.error ?? 'Stripe Connect failed. Please try again. / Stripe設定に失敗しました。'
        setStripeError(msg)
        setStripeConnecting(false)
      }
    } catch {
      setStripeError('Connection error. Please check your internet and try again. / 通信エラーが発生しました。')
      setStripeConnecting(false)
    }
  }

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('JPG / PNG / WebP only · JPG/PNG/WebPのみ対応')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max file size 5MB · 5MB以下にしてください')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // Validate before advancing each step
  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 2) {
      if (!fullName.trim()) errs.fullName = 'Required — your display name / 表示名は必須です'
    }
    if (s === 3) {
      if (yogaStyles.length === 0) errs.yogaStyles = 'Select at least one style / 1つ以上選択してください'
      if (languages.length === 0) errs.languages = 'Select at least one language / 1つ以上選択してください'
    }
    if (s === 5) {
      const bankPartiallyFilled = bankName || swiftCode || accountNumber || accountHolderName
      if (bankPartiallyFilled) {
        // SWIFT code length
        if (swiftCode && swiftCode.length !== 8 && swiftCode.length !== 11) {
          errs.swiftCode = `※ SWIFT code must be 8 or 11 characters (entered: ${swiftCode.length}) / SWIFTコードは8または11文字 (入力: ${swiftCode.length}文字)`
        }
        // IFSC code length
        if (bankCountry === 'India' && ifscCode && ifscCode.length !== 11) {
          errs.ifscCode = `※ IFSC code must be exactly 11 characters (entered: ${ifscCode.length}) / IFSCコードは11文字 (入力: ${ifscCode.length}文字)`
        }
        // Account number ↔ holder name pair
        if (accountNumber && !accountHolderName.trim()) {
          errs.accountHolderName = '※ Account holder name is required when account number is entered / 口座番号を入力した場合は名義人も必須です'
        }
        if (accountHolderName.trim() && !accountNumber) {
          errs.accountNumber = '※ Account number is required when account holder name is entered / 名義人を入力した場合は口座番号も必須です'
        }
        // Character limits
        if (bankName && bankName.length > 100) {
          errs.bankName = `※ Bank name too long (max 100 chars, entered: ${bankName.length}) / 銀行名が長すぎます（最大100文字）`
        }
        if (accountNumber && accountNumber.length > 50) {
          errs.accountNumber = `※ Account number too long (max 50 chars, entered: ${accountNumber.length}) / 口座番号が長すぎます（最大50文字）`
        }
        if (accountHolderName && accountHolderName.length > 100) {
          errs.accountHolderName = `※ Name too long (max 100 chars, entered: ${accountHolderName.length}) / 名前が長すぎます（最大100文字）`
        }
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const goNext = (from: number) => {
    if (!validateStep(from)) {
      // Scroll to first error after React re-renders with the new error state
      setTimeout(() => {
        const el = document.querySelector('[data-error="true"]')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      return
    }
    setStep(from + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async () => {
    // Re-validate bank fields before submitting (catches edits made after Next was clicked)
    if (role === 'instructor' && !validateStep(5)) {
      setStep(5) // Go back to payout step to show errors
      setTimeout(() => {
        const el = document.querySelector('[data-error="true"]')
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 50)
      toast.error('Please fix the bank details errors before submitting. / 銀行情報のエラーを修正してから申請してください。')
      return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let avatarUrl: string | null = null
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars').upload(path, avatarFile, { upsert: true })
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
          avatarUrl = urlData.publicUrl
        }
      }

      const profileUpdate: Record<string, unknown> = { role, timezone }
      if (fullName) profileUpdate.full_name = fullName
      if (avatarUrl) profileUpdate.avatar_url = avatarUrl

      const { error: profileError } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
      if (profileError) { toast.error('Profile save failed: ' + profileError.message); setLoading(false); return }

      if (role === 'instructor') {
        const res = await fetch('/api/onboarding/instructor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tagline, bio, yogaStyles, languages, yearsExperience,
            certifications, careerHistory, instagramUrl, youtubeUrl,
            bankCountry, bankName, swiftCode, ifscCode, accountNumber, accountHolderName,
            stripeAccountId,
          }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          const fieldErrors = data?.details?.fieldErrors
          if (fieldErrors) {
            toast.error('Please check your input: ' + Object.keys(fieldErrors).join(', '))
          } else {
            toast.error(data?.error || 'Submission failed. Please try again.')
          }
          setLoading(false)
          return
        }
        setDone(true)
      } else {
        const res = await fetch('/api/onboarding/student', { method: 'POST' })
        if (!res.ok) { toast.error('Setup failed. Please try again.'); setLoading(false); return }
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      toast.error('Unexpected error. Please try again. / 予期しないエラーが発生しました。')
    } finally {
      setLoading(false)
    }
  }

  // ── Completion screen ─────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-900 dark:to-navy-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Submitted! 🎉</h2>
          <p className="text-gray-600 dark:text-navy-300 mb-2 font-medium">申請を受け付けました</p>
          <p className="text-sm text-gray-400 dark:text-navy-400 mb-2">
            Our team will review your profile within <strong>1–3 business days</strong>.<br />
            You'll receive an email when you're approved.
          </p>
          <p className="text-xs text-gray-400 dark:text-navy-500 mb-8">
            1〜3営業日以内に審査結果をメールでお知らせします。
          </p>
          <Button onClick={() => router.push('/')} className="bg-navy-600 hover:bg-navy-700 !text-white w-full rounded-full">
            Go to Homepage / ホームへ
          </Button>
        </div>
      </div>
    )
  }

  const inputCls = (field?: string) =>
    `mt-1 w-full ${errors[field ?? ''] ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-linen-50 to-navy-50 dark:from-navy-900 dark:via-navy-900 dark:to-navy-900 flex items-center justify-center p-4 relative">

      {/* Guide modal */}
      {showGuide && (
        <StepGuideModal
          onClose={() => setShowGuide(false)}
          currentStep={role === 'instructor' ? step - 1 : 1}
        />
      )}

      {/* Language + Theme toggle bar */}
      <div className="fixed top-4 right-4 z-40 flex items-center bg-white/90 dark:bg-navy-800/90 backdrop-blur rounded-full shadow-md border border-gray-200 dark:border-navy-700 px-1 py-1 gap-0.5">
        <button
          onClick={toggleLocale}
          className="text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-navy-700 dark:hover:text-sage-400 px-2.5 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
        >
          {locale === 'ja' ? 'EN' : 'JA'}
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-navy-600" />
        <ThemeToggle />
      </div>

      {/* Floating guide button (instructor only) */}
      {role === 'instructor' && step > 1 && (
        <button
          onClick={() => setShowGuide(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-medium transition-all hover:shadow-xl"
        >
          <BookMarked className="h-4 w-4" />
          <span className="hidden sm:inline">Registration Guide</span>
          <span className="sm:hidden">Guide</span>
        </button>
      )}

      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm p-8 w-full max-w-lg">

        {/* ── Step 1: Role & Timezone ──────────────────────────────── */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{t('title')}</h1>
            <p className="text-gray-500 dark:text-navy-300 mb-8">{t('choose_role')}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                {
                  value: 'student',
                  icon: <BookOpen className={`h-8 w-8 mb-3 ${role === 'student' ? 'text-navy-600' : 'text-gray-400'}`} />,
                  title: 'Student / 生徒',
                  desc: 'Book yoga sessions with expert instructors',
                  descJa: '専門インストラクターのセッションを予約',
                },
                {
                  value: 'instructor',
                  icon: <GraduationCap className={`h-8 w-8 mb-3 ${role === 'instructor' ? 'text-navy-600' : 'text-gray-400'}`} />,
                  title: 'Instructor / 講師',
                  desc: 'Teach yoga and earn from your passion',
                  descJa: 'ヨガを教えて収益を得る',
                },
              ].map(({ value, icon, title, desc, descJa }) => (
                <button
                  key={value}
                  onClick={() => setRole(value as 'student' | 'instructor')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    role === value
                      ? 'border-navy-600 bg-navy-50 dark:bg-navy-700'
                      : 'border-gray-200 dark:border-navy-600 hover:border-navy-300'
                  }`}
                >
                  {icon}
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 dark:text-navy-400">{desc}</p>
                  <p className="text-xs text-gray-400 dark:text-navy-500 mt-0.5">{descJa}</p>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <FieldLabel
                label="Your Timezone / タイムゾーン"
                htmlFor="timezone"
                tooltip="Select the timezone where you live or teach. This helps us show your availability correctly to students around the world."
              />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1" id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role === 'instructor' && (
              <div className="mb-6 bg-sage-50 dark:bg-navy-700/50 rounded-xl p-4 border border-sage-200 dark:border-navy-600">
                <p className="text-xs font-semibold text-sage-700 dark:text-sage-400 mb-1 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Instructor Registration — What to expect
                </p>
                <ul className="text-xs text-gray-600 dark:text-navy-300 space-y-0.5">
                  <li>✓ 5 simple steps · Takes about 5–10 minutes</li>
                  <li>✓ Profile photo, specialty, experience, payout, terms</li>
                  <li>✓ Team reviews your application within 1–3 days</li>
                  <li className="text-gray-400">✓ 5つのステップ · 所要時間：約5〜10分</li>
                </ul>
              </div>
            )}

            <Button
              className="w-full bg-navy-600 hover:bg-navy-700 !text-white rounded-full"
              onClick={() => { setTermsAgreed(false); setStep(2) }}
              disabled={loading}
            >
              Get Started {role === 'instructor' ? '→ Step 1/5' : '→'} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </>
        )}

        {/* ── Step 2 (student): Terms ──────────────────────────────── */}
        {step === 2 && role === 'student' && (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Terms &amp; Conditions</h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-4">Please read and agree before continuing.</p>

            <div className="bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl p-4 max-h-64 overflow-y-auto text-sm text-gray-700 dark:text-navy-200 space-y-3 mb-4">
              <p className="font-semibold text-red-700 dark:text-red-400">⚠️ Non-Circumvention (Most Important)</p>
              <p>You must not contact or arrange lessons with instructors found through Reset Yoga <strong>outside the Platform</strong>. Exchanging personal contact info for private lessons is strictly prohibited. This applies for <strong>12 months</strong> after your last session.</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>All sessions must be booked through Reset Yoga only</li>
                <li>Free trial: 2 sessions (card required, no charge)</li>
                <li>Monthly plan: $19.99/month for 4 sessions</li>
                <li>Cancellation within 12 hours forfeits that session credit</li>
              </ul>
              <a href="/student-terms" target="_blank" className="text-navy-600 dark:text-sage-400 underline text-xs">
                Read full Student Terms →
              </a>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mb-6">
              <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
              <span className="text-sm text-gray-700 dark:text-navy-200">
                I have read and agree to the{' '}
                <a href="/student-terms" target="_blank" className="text-navy-600 dark:text-sage-400 underline">Student Terms</a>
                , including the non-circumvention clause.
              </span>
            </label>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full" onClick={handleSubmit} disabled={!termsAgreed || loading}>
                {loading ? 'Setting up...' : 'Start My Trial 🎉'}
              </Button>
            </div>
          </>
        )}

        {/* ── Step 2 (instructor): Photo & Name ───────────────────── */}
        {step === 2 && role === 'instructor' && (
          <>
            <ProgressStepper current={0} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Profile Photo &amp; Name</h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              First impressions matter! A good photo and clear name build student trust.
              <br /><span className="text-xs text-gray-400">第一印象が大切です。顔写真と名前を設定しましょう。</span>
            </p>

            {/* Photo upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative w-28 h-28 rounded-full bg-gray-100 dark:bg-navy-700 border-2 border-dashed border-gray-300 dark:border-navy-500 flex items-center justify-center cursor-pointer hover:border-navy-400 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview
                  ? <Image src={avatarPreview} alt="preview" fill className="object-cover" />
                  : <Camera className="h-8 w-8 text-gray-400 dark:text-navy-400" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm text-navy-600 dark:text-sage-400 hover:underline">
                Upload Photo / 写真をアップロード
              </button>
              <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">JPG / PNG / WebP · Max 5MB · Recommended: 400×400px</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            <div data-error={!!errors.fullName || undefined}>
              <FieldLabel
                label="Display Name / 表示名"
                htmlFor="fullName"
                required
                error={errors.fullName}
                tooltip="This is the name students will see on your profile. Use your real name or professional instructor name. e.g. 'Priya Sharma' or 'Yogi James'"
              />
              <Input
                id="fullName"
                value={fullName}
                onChange={e => { setFullName(e.target.value); clearError('fullName') }}
                placeholder="e.g. Priya Sharma / あなたの名前"
                className={inputCls('fullName')}
              />
              {errors.fullName && (
                <p className="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <AlertCircle className="h-3.5 w-3.5" /> {errors.fullName}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full" onClick={() => goNext(2)}>
                Next: Specialty <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Specialty ────────────────────────────────────── */}
        {step === 3 && role === 'instructor' && (
          <>
            <ProgressStepper current={1} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Your Specialty &amp; Bio</h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              Help students find and connect with you.
              <br /><span className="text-xs text-gray-400">生徒があなたを見つけやすくするための情報を入力してください。</span>
            </p>

            <div className="space-y-5">
              <div>
                <FieldLabel
                  label="Tagline / キャッチコピー"
                  htmlFor="tagline"
                  tooltip="A short, punchy sentence describing your teaching style. This appears under your name on your profile card. e.g. 'Gentle Yin for stressed professionals' or 'Dynamic Vinyasa for all levels'"
                />
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="e.g. Gentle Yin for stressed professionals · 緊張したプロのためのやさしいヨガ"
                  maxLength={60}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 dark:text-navy-400 mt-1 text-right">{tagline.length}/60</p>
              </div>

              <div>
                <FieldLabel
                  label="Bio / 自己紹介"
                  htmlFor="bio"
                  tooltip="Tell students about your yoga journey, teaching philosophy, and what students can expect from your classes. Write in a warm, welcoming tone. 200–500 words recommended. You can write in English, Japanese, or both!"
                />
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="e.g. I have been practicing yoga for 10 years and teaching for 5. My classes focus on alignment and breathwork, helping students of all levels reconnect with their bodies..."
                  rows={4}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">{bio.length} chars · Recommended: 200–500</p>
              </div>

              <div data-error={!!errors.yogaStyles || undefined}>
                <FieldLabel
                  label="Yoga Styles / ヨガスタイル"
                  required
                  error={errors.yogaStyles}
                  tooltip="Select ALL yoga styles you are certified and comfortable teaching. Students search and filter by style — the more accurate you are, the better your bookings. You can always update this later."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {YOGA_STYLES.map(s => (
                    <TagButton
                      key={s} label={s}
                      selected={yogaStyles.includes(s)}
                      onClick={() => { toggle(yogaStyles, s, setYogaStyles); clearError('yogaStyles') }}
                    />
                  ))}
                </div>
                {errors.yogaStyles && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-2">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.yogaStyles}
                  </p>
                )}
                {yogaStyles.length > 0 && (
                  <p className="text-xs text-sage-600 dark:text-sage-400 mt-1">{yogaStyles.length} style{yogaStyles.length > 1 ? 's' : ''} selected ✓</p>
                )}
              </div>

              <div data-error={!!errors.languages || undefined}>
                <FieldLabel
                  label="Teaching Languages / 指導言語"
                  required
                  error={errors.languages}
                  tooltip="Select all languages you can teach yoga classes in. This helps students find an instructor they can communicate with comfortably."
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {LANGUAGES.map(l => (
                    <TagButton
                      key={l} label={l}
                      selected={languages.includes(l)}
                      onClick={() => { toggle(languages, l, setLanguages); clearError('languages') }}
                    />
                  ))}
                </div>
                {errors.languages && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-2">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.languages}
                  </p>
                )}
                {languages.length > 0 && (
                  <p className="text-xs text-sage-600 dark:text-sage-400 mt-1">{languages.length} language{languages.length > 1 ? 's' : ''} selected ✓</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full" onClick={() => goNext(3)}>
                Next: Experience <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Experience & Credentials ─────────────────────── */}
        {step === 4 && role === 'instructor' && (
          <>
            <ProgressStepper current={2} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Experience &amp; Credentials</h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-6">
              Show students why you're the right instructor for them.
              <br /><span className="text-xs text-gray-400">あなたが最適な講師である理由を生徒に伝えましょう。</span>
            </p>

            <div className="space-y-5">
              <div>
                <FieldLabel
                  label="Years of Teaching Experience / 指導歴"
                  htmlFor="yearsExp"
                  tooltip="Enter the number of years you have been teaching yoga classes (not years of personal practice). If you are a new instructor, enter 0 or 1."
                />
                <div className="flex items-center gap-3 mt-1">
                  <Input
                    id="yearsExp"
                    type="number" min={0} max={50}
                    value={yearsExperience}
                    onChange={e => setYearsExperience(Number(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500 dark:text-navy-300">years / 年</span>
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Certifications / 資格・認定"
                  tooltip="Add your yoga teaching certifications one at a time. Examples: 'RYT-200 Yoga Alliance', 'RYT-500 Hatha Yoga', 'Prenatal Yoga Certificate', 'Physiotherapy Degree'. Press Enter or click + to add each one."
                />
                <p className="text-xs text-gray-400 dark:text-navy-400 mb-2">
                  Type and press Enter or click + · 入力してEnterまたは+をクリック
                </p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCert())}
                    placeholder="e.g. RYT-200 Yoga Alliance · RYT-500 全米ヨガアライアンス"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addCert} size="icon" className="dark:border-navy-600 dark:text-navy-200 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map(c => (
                    <span key={c} className="inline-flex items-center gap-1 bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-600 px-3 py-1 rounded-full text-sm">
                      {c}
                      <button onClick={() => setCertifications(certifications.filter(x => x !== c))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <FieldLabel
                  label="Career History / 経歴"
                  htmlFor="career"
                  tooltip="A brief summary of where you've taught, notable studios, countries, or achievements. This helps build credibility. e.g. 'Taught at YogaWorks NYC for 3 years, conducted retreats in Bali and India...'"
                />
                <Textarea
                  id="career"
                  value={careerHistory}
                  onChange={e => setCareerHistory(e.target.value)}
                  placeholder="e.g. Taught at YogaWorks NYC for 3 years. Conducted retreats in Bali and India. Featured in Yoga Journal 2022..."
                  rows={3} className="mt-1"
                />
              </div>

              <div className="border-t dark:border-navy-700 pt-4 space-y-4">
                <p className="text-xs text-gray-500 dark:text-navy-400 flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" /> Social links help students trust you — highly recommended · SNSリンクで信頼感アップ（推奨）
                </p>
                <div>
                  <FieldLabel
                    label="Instagram"
                    htmlFor="instagram"
                    tooltip="Your public Instagram profile URL. This appears on your instructor profile and helps students learn more about you. e.g. https://www.instagram.com/yourhandle"
                  />
                  <div className="relative mt-1">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                    <Input
                      id="instagram"
                      value={instagramUrl}
                      onChange={e => setInstagramUrl(e.target.value)}
                      placeholder="https://www.instagram.com/yourhandle"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel
                    label="YouTube"
                    htmlFor="youtube"
                    tooltip="Your YouTube channel URL. If you post yoga content, this is a great way to showcase your teaching style to potential students."
                  />
                  <div className="relative mt-1">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
                    <Input
                      id="youtube"
                      value={youtubeUrl}
                      onChange={e => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/@yourchannel"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full" onClick={() => goNext(4)}>
                Next: Payout <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 5: Payout ────────────────────────────────────────── */}
        {step === 5 && role === 'instructor' && (
          <>
            <ProgressStepper current={3} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Landmark className="h-5 w-5 text-navy-600" /> Payout Setup / 報酬受け取り設定
            </h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-3">
              You can skip this now and set it up later from your dashboard.
              <br /><span className="text-xs text-gray-400">後でダッシュボードから設定することもできます。</span>
            </p>

            {/* Stripe recommended banner — clickable */}
            {stripeAccountId ? (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-xl p-4 mb-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    Stripe Connect — Connected! / 接続済み ✓
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                    Your Stripe account is linked. Payouts will begin after approval.
                    <br />Stripeアカウントが連携されました。承認後に自動支払いが開始されます。
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleStripeConnect}
                disabled={stripeConnecting}
                className="w-full text-left bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-4 hover:bg-indigo-100 dark:hover:bg-indigo-800/40 transition-colors disabled:opacity-70"
              >
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-1 flex items-center gap-1">
                  ⚡ Stripe Connect — Recommended / 推奨
                  {stripeConnecting
                    ? <Loader2 className="h-3.5 w-3.5 ml-auto animate-spin text-indigo-600 dark:text-indigo-400" />
                    : <ChevronRight className="h-3.5 w-3.5 ml-auto text-indigo-500 dark:text-indigo-400" />
                  }
                </p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed">
                  {stripeConnecting
                    ? 'Redirecting to Stripe… / Stripeへ移動中…'
                    : <><strong>Click here</strong> to connect your Stripe account for automatic monthly payouts in USD. Supported in 40+ countries including India, Japan, US, UK, and more.<br /><span className="text-indigo-500 dark:text-indigo-400">ここをクリックしてStripe Connect設定 → USD自動支払い。インド・日本・米国・英国など40カ国以上対応。</span></>
                  }
                </p>
              </button>
            )}

            {/* Stripe Connect error — shown inline instead of just a toast */}
            {stripeError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-3 text-xs text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold mb-0.5">Stripe Connect failed / Stripe Connect エラー</p>
                  <p>{stripeError}</p>
                  <button type="button" onClick={handleStripeConnect} className="mt-1.5 underline font-semibold hover:opacity-80">
                    Retry / 再試行
                  </button>
                </div>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-3 mb-5 text-xs text-blue-700 dark:text-blue-300">
              Bank details below are for <strong>manual transfer only</strong> (used if Stripe is not set up). All fields are optional.
              <br /><span className="text-blue-500">以下の銀行情報はStripe未設定時の手動送金用です。すべて任意入力です。</span>
            </div>

            <div className="space-y-4">
              <div>
                <FieldLabel
                  label="Bank Country / 銀行の国"
                  tooltip="Select the country where your bank account is located. This determines which routing details are required."
                />
                <Select value={bankCountry} onValueChange={setBankCountry}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Japan', 'India', 'United States', 'United Kingdom', 'Singapore', 'Australia', 'Canada', 'Germany', 'France', 'Brazil', 'Other'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div data-error={!!errors.bankName || undefined}>
                <FieldLabel
                  label="Bank Name / 銀行名"
                  htmlFor="bankName"
                  error={errors.bankName}
                  tooltip="Full name of your bank. e.g. 'State Bank of India', 'HDFC Bank', 'Mizuho Bank', 'JPMorgan Chase'"
                />
                <Input id="bankName" value={bankName}
                  onChange={e => { setBankName(e.target.value); clearError('bankName') }}
                  placeholder={bankCountry === 'India' ? 'e.g. State Bank of India, HDFC Bank' : 'e.g. Mizuho Bank, HSBC'}
                  maxLength={100}
                  className={`mt-1 ${errors.bankName ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`} />
                {errors.bankName && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.bankName}</p>
                )}
              </div>

              <div data-error={!!errors.swiftCode || undefined}>
                <FieldLabel
                  label="SWIFT / BIC Code"
                  htmlFor="swift"
                  error={errors.swiftCode}
                  tooltip="8 or 11-character international bank identifier code. Found on your bank's website, mobile app, or bank statement. Examples: 'SBININBB' (SBI India), 'HDFCINBB' (HDFC India), 'MHCBJPJT' (Mizuho Japan). Leave blank if unsure."
                />
                <Input id="swift" value={swiftCode}
                  onChange={e => { setSwiftCode(e.target.value.toUpperCase()); clearError('swiftCode') }}
                  placeholder={bankCountry === 'India' ? 'e.g. SBININBB or HDFCINBB' : 'e.g. MHCBJPJT'}
                  className={`mt-1 font-mono tracking-wide ${errors.swiftCode ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`} maxLength={11} />
                {errors.swiftCode
                  ? <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.swiftCode}</p>
                  : <p className="text-xs text-gray-400 dark:text-navy-500 mt-1">8 or 11 characters · 8〜11文字</p>
                }
              </div>

              {bankCountry === 'India' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4">
                  <div data-error={!!errors.ifscCode || undefined}>
                    <FieldLabel
                      label="IFSC Code (India only)"
                      htmlFor="ifsc"
                      error={errors.ifscCode}
                      tooltip="Indian Financial System Code — 11 characters identifying your specific bank branch. Found on your cheque book, passbook, or online banking portal. Format: First 4 letters = Bank code, 5th = 0, Last 6 = Branch code. e.g. 'SBIN0001234' (SBI), 'HDFC0001234' (HDFC)"
                    />
                    <Input id="ifsc" value={ifscCode}
                      onChange={e => { setIfscCode(e.target.value.toUpperCase()); clearError('ifscCode') }}
                      placeholder="e.g. SBIN0001234 or HDFC0001234"
                      maxLength={11} className={`mt-1 font-mono tracking-widest ${errors.ifscCode ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`} />
                    {errors.ifscCode
                      ? <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.ifscCode}</p>
                      : <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">11 characters · Found on cheque book or net banking · 通帳またはネットバンキングで確認</p>
                    }
                  </div>
                </div>
              )}

              <div data-error={!!errors.accountNumber || undefined}>
                <FieldLabel
                  label="Account Number / 口座番号"
                  htmlFor="accountNum"
                  error={errors.accountNumber}
                  tooltip="Your bank account number. Enter digits only, no spaces or dashes. For Indian banks, this is typically 11-16 digits."
                />
                <Input id="accountNum" value={accountNumber}
                  onChange={e => { setAccountNumber(e.target.value); clearError('accountNumber') }}
                  placeholder={bankCountry === 'India' ? 'e.g. 12345678901 (11–16 digits)' : 'e.g. 1234567890'}
                  maxLength={50}
                  className={`mt-1 font-mono tracking-wide ${errors.accountNumber ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`} />
                {errors.accountNumber && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.accountNumber}</p>
                )}
              </div>

              <div data-error={!!errors.accountHolderName || undefined}>
                <FieldLabel
                  label="Account Holder Name / 口座名義人"
                  htmlFor="holderName"
                  error={errors.accountHolderName}
                  tooltip="Full name exactly as it appears on your bank account. This must match your bank records. e.g. 'PRIYA SHARMA' or 'TANAKA YUKI'"
                />
                <Input id="holderName" value={accountHolderName}
                  onChange={e => { setAccountHolderName(e.target.value); clearError('accountHolderName') }}
                  placeholder="e.g. PRIYA SHARMA (as on bank account)"
                  maxLength={100}
                  className={`mt-1 uppercase ${errors.accountHolderName ? 'border-red-400 focus:ring-red-300 bg-red-50 dark:bg-red-900/10' : ''}`} />
                {errors.accountHolderName && (
                  <p className="flex items-center gap-1 text-red-500 text-xs mt-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.accountHolderName}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(4)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full" onClick={() => { setTermsAgreed(false); goNext(5) }}>
                Next: Terms <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <button type="button" className="w-full text-sm text-gray-400 dark:text-navy-400 hover:text-gray-600 mt-3"
              onClick={() => { setErrors({}); setTermsAgreed(false); setStep(6) }}>
              Skip for now — set up payout later / スキップして後で設定
            </button>
          </>
        )}

        {/* ── Step 6: Terms (instructor) ────────────────────────────── */}
        {step === 6 && role === 'instructor' && (
          <>
            <ProgressStepper current={4} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Terms &amp; Conditions</h2>
            <p className="text-gray-500 dark:text-navy-300 text-sm mb-4">
              Almost there! Please read and agree to submit your application.
              <br /><span className="text-xs text-gray-400">もう少しです！利用規約を読んで同意してください。</span>
            </p>

            <div className="bg-gray-50 dark:bg-navy-900 border border-gray-200 dark:border-navy-700 rounded-xl p-4 max-h-72 overflow-y-auto text-sm text-gray-700 dark:text-navy-200 space-y-3 mb-4">
              <p className="font-semibold text-red-700 dark:text-red-400">
                ⚠️ Non-Circumvention — Most Important Rule
              </p>
              <p>
                You must <strong>never</strong> contact or conduct sessions with students outside the Reset Yoga platform. No LINE, WhatsApp, WeChat, or personal exchanges for lessons. This applies for <strong>12 months</strong> after your last session. Violation = <strong>permanent account termination</strong>.
              </p>
              <p className="text-xs text-gray-500 dark:text-navy-400">
                Reset Yogaで出会った生徒とプラットフォーム外でレッスンや連絡交換をすることは固く禁じます。最終セッションから12ヶ月間有効。違反は即時永久アカウント停止。
              </p>
              <p className="font-semibold text-gray-800 dark:text-navy-100 mt-2">Key Rules / 重要事項：</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>All sessions exclusively through Reset Yoga / すべてのセッションはReset Yoga経由のみ</li>
                <li>Independent contractor status (not an employee) / 独立業務委託者（雇用関係なし）</li>
                <li>Payouts in USD, monthly, min. $20 / USD建て月次支払い（最低$20）</li>
                <li className="text-indigo-700 dark:text-indigo-300">Set up Stripe Connect after approval for automated payouts / 承認後Stripe設定で自動受取</li>
                <li>You handle your own tax filings / 税務申告はご自身の責任</li>
                <li>Maintain professional conduct at all times / 常にプロとしての行動を維持</li>
                <li>Keep all student data strictly confidential / 生徒の個人情報は厳秘</li>
              </ul>
              <a href="/instructor-terms" target="_blank" className="text-navy-600 dark:text-sage-400 underline text-xs">
                Read full Instructor Terms (English / 日本語) →
              </a>
            </div>

            <label className={`flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-xl border transition-all ${
              termsAgreed ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-navy-600'
            }`}>
              <input type="checkbox" checked={termsAgreed} onChange={e => setTermsAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-navy-600" />
              <span className="text-sm text-gray-700 dark:text-navy-200">
                I have read and agree to the{' '}
                <a href="/instructor-terms" target="_blank" className="text-navy-600 dark:text-sage-400 underline">Instructor Terms &amp; Conditions</a>
                , including the <strong>non-circumvention</strong> and payment clauses.
                <br />
                <span className="text-xs text-gray-400 dark:text-navy-400">講師利用規約（非迂回条項・支払い条件を含む）を読み、同意します。</span>
              </span>
            </label>

            {!termsAgreed && (
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs mb-4 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Please check the box above to agree to the terms before submitting.
                / 上のチェックボックスに同意してから申請してください。
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-full dark:border-navy-600 dark:text-navy-200" onClick={() => setStep(5)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 !text-white rounded-full disabled:opacity-50"
                onClick={handleSubmit}
                disabled={!termsAgreed || loading}
              >
                {loading ? 'Submitting...' : '🎉 Submit Application'}
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-navy-900">Loading…</div>}>
      <OnboardingForm />
    </Suspense>
  )
}
