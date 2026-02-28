'use client'

import { useState, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  GraduationCap,
  BookOpen,
  CheckCircle,
  Camera,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Instagram,
  Youtube,
  Landmark,
} from 'lucide-react'
import Image from 'next/image'

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center gap-2">
          <div
            className={`h-2 rounded-full flex-1 transition-all duration-300 ${
              i < current ? 'bg-navy-600' : i === current ? 'bg-navy-300' : 'bg-gray-200'
            }`}
          />
        </div>
      ))}
      <span className="text-xs text-gray-400 whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  )
}

// ── Tag toggle button ─────────────────────────────────────────────────────────
function TagButton({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        selected
          ? 'bg-navy-600 text-white border-navy-600'
          : 'bg-white text-gray-600 border-gray-300 hover:border-navy-400'
      }`}
    >
      {label}
    </button>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
function OnboardingForm() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get('role') as 'instructor' | 'student') || 'student'

  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step state
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'instructor' | 'student'>(initialRole)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  // Step 1
  const [timezone, setTimezone] = useState('Asia/Tokyo')

  // Step 2 – basic info
  const [fullName, setFullName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Step 3 – introduction
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])

  // Step 4 – experience & certifications
  const [yearsExperience, setYearsExperience] = useState(1)
  const [certifications, setCertifications] = useState<string[]>([])
  const [certInput, setCertInput] = useState('')
  const [careerHistory, setCareerHistory] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Step 5 – payout
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [accountType, setAccountType] = useState<'普通' | '当座'>('普通')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderKana, setAccountHolderKana] = useState('')

  const INSTRUCTOR_STEPS = 5

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item])
  }

  const addCert = () => {
    const v = certInput.trim()
    if (v && !certifications.includes(v)) {
      setCertifications([...certifications, v])
      setCertInput('')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Upload avatar if selected
    let avatarUrl: string | null = null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    // Update profiles
    const profileUpdate: Record<string, unknown> = { role, timezone }
    if (fullName) profileUpdate.full_name = fullName
    if (avatarUrl) profileUpdate.avatar_url = avatarUrl

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)

    if (profileError) {
      toast.error(t('error_profile'))
      setLoading(false)
      return
    }

    if (role === 'instructor') {
      const { error: instructorError } = await supabase.from('instructor_profiles').upsert({
        id: user.id,
        tagline,
        bio,
        yoga_styles: yogaStyles,
        languages,
        years_experience: yearsExperience,
        certifications,
        career_history: careerHistory,
        instagram_url: instagramUrl || null,
        youtube_url: youtubeUrl || null,
        is_approved: false,
      })

      if (instructorError) {
        toast.error(t('error_instructor'))
        setLoading(false)
        return
      }

      // Save payout info if provided
      if (bankName || accountNumber) {
        await supabase.from('instructor_payout_info').upsert({
          id: user.id,
          bank_name: bankName || null,
          bank_branch: bankBranch || null,
          account_type: accountType,
          account_number: accountNumber || null,
          account_holder_kana: accountHolderKana || null,
        })
      }

      setDone(true)
    } else {
      const res = await fetch('/api/onboarding/student', { method: 'POST' })
      if (!res.ok) {
        toast.error(t('error_init'))
        setLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    }

    setLoading(false)
  }

  // ── Complete screen ─────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-linen-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('done_title')}</h2>
          <p className="text-gray-600 mb-2">{t('pending_approval')}</p>
          <p className="text-sm text-gray-400 mb-8">
            {t('done_note')}
          </p>
          <Button onClick={() => router.push('/')} className="bg-navy-600 hover:bg-navy-700 w-full rounded-full">
            {t('done_btn')}
          </Button>
        </div>
      </div>
    )
  }

  const card = 'bg-white rounded-2xl shadow-sm p-8 w-full max-w-lg'

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-linen-50 to-navy-50 flex items-center justify-center p-4">
      <div className={card}>

        {/* ── Step 1: Role ──────────────────────────────────────────────── */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('title')}</h1>
            <p className="text-gray-500 mb-8">{t('choose_role')}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                {
                  value: 'student',
                  icon: <BookOpen className={`h-8 w-8 mb-3 ${role === 'student' ? 'text-navy-600' : 'text-gray-400'}`} />,
                  title: t('student_role'),
                  desc: t('student_desc'),
                },
                {
                  value: 'instructor',
                  icon: <GraduationCap className={`h-8 w-8 mb-3 ${role === 'instructor' ? 'text-navy-600' : 'text-gray-400'}`} />,
                  title: t('instructor_role'),
                  desc: t('instructor_desc'),
                },
              ].map(({ value, icon, title, desc }) => (
                <button
                  key={value}
                  onClick={() => setRole(value as 'student' | 'instructor')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    role === value
                      ? 'border-navy-600 bg-navy-50'
                      : 'border-gray-200 hover:border-navy-300'
                  }`}
                >
                  {icon}
                  <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </button>
              ))}
            </div>

            <div className="mb-6">
              <Label>{t('your_timezone')}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-navy-600 hover:bg-navy-700 rounded-full"
              onClick={() => (role === 'instructor' ? setStep(2) : handleSubmit())}
              disabled={loading}
            >
              {loading ? t('saving') : role === 'student' ? t('cta_student') : t('cta_next')}
            </Button>
          </>
        )}

        {/* ── Step 2: Basic Info ────────────────────────────────────────── */}
        {step === 2 && role === 'instructor' && (
          <>
            <ProgressBar current={1} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step_basic_title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('step_basic_desc')}</p>

            {/* Photo upload */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-navy-400 transition-colors overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="preview" fill className="object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 text-sm text-navy-600 hover:underline"
              >
                {t('photo_select')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t('display_name')} <span className="text-red-500">*</span></Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('display_name_placeholder')}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t('back')}
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                disabled={!fullName.trim()}
                onClick={() => setStep(3)}
              >
                {t('next')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Introduction ──────────────────────────────────────── */}
        {step === 3 && role === 'instructor' && (
          <>
            <ProgressBar current={2} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step_intro_title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('step_intro_desc')}</p>

            <div className="space-y-5">
              <div>
                <Label>{t('tagline_label')} <span className="text-gray-400 text-xs font-normal">{t('tagline_hint')}</span></Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={t('tagline_placeholder')}
                  maxLength={60}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{tagline.length}/60</p>
              </div>

              <div>
                <Label>{t('bio')}</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={t('bio_placeholder')}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="mb-2 block">{t('yoga_styles')} <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {YOGA_STYLES.map((s) => (
                    <TagButton
                      key={s}
                      label={s}
                      selected={yogaStyles.includes(s)}
                      onClick={() => toggle(yogaStyles, s, setYogaStyles)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">{t('languages')} <span className="text-red-500">*</span></Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l) => (
                    <TagButton
                      key={l}
                      label={l}
                      selected={languages.includes(l)}
                      onClick={() => toggle(languages, l, setLanguages)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(2)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t('back')}
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                disabled={yogaStyles.length === 0 || languages.length === 0}
                onClick={() => setStep(4)}
              >
                {t('next')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Experience & Certifications ──────────────────────── */}
        {step === 4 && role === 'instructor' && (
          <>
            <ProgressBar current={3} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">{t('step_exp_title')}</h2>
            <p className="text-gray-500 text-sm mb-6">{t('step_exp_desc')}</p>

            <div className="space-y-5">
              <div>
                <Label>{t('experience')}</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(Number(e.target.value))}
                  className="mt-1 w-28"
                />
              </div>

              <div>
                <Label>{t('certifications_label')}</Label>
                <p className="text-xs text-gray-400 mb-2">{t('certifications_hint')}</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                    placeholder={t('cert_placeholder')}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addCert} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {certifications.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 bg-navy-50 text-navy-700 border border-navy-200 px-3 py-1 rounded-full text-sm"
                    >
                      {c}
                      <button onClick={() => setCertifications(certifications.filter((x) => x !== c))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>{t('career_history_label')}</Label>
                <Textarea
                  value={careerHistory}
                  onChange={(e) => setCareerHistory(e.target.value)}
                  placeholder={t('career_placeholder')}
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <Instagram className="h-4 w-4 text-pink-500" /> {t('instagram_label')}
                </Label>
                <Input
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/yourhandle"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-1">
                  <Youtube className="h-4 w-4 text-red-500" /> {t('youtube_label')}
                </Label>
                <Input
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/@yourchannel"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(3)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t('back')}
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                onClick={() => setStep(5)}
              >
                {t('next')} <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 5: Payout Info ───────────────────────────────────────── */}
        {step === 5 && role === 'instructor' && (
          <>
            <ProgressBar current={4} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              <Landmark className="inline h-5 w-5 mr-2 text-navy-600" />
              {t('step_payout_title')}
            </h2>
            <p className="text-gray-500 text-sm mb-2">{t('step_payout_desc')}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
              {t('payout_note')}
            </div>

            <div className="space-y-4">
              <div>
                <Label>{t('bank_name')}</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder={t('bank_name_placeholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t('bank_branch')}</Label>
                <Input
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder={t('bank_branch_placeholder')}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t('account_type')}</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as '普通' | '当座')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="普通">{t('account_ordinary')}</SelectItem>
                    <SelectItem value="当座">{t('account_checking')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('account_number')}</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('account_number_placeholder')}
                  maxLength={8}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>{t('account_holder_kana')}</Label>
                <Input
                  value={accountHolderKana}
                  onChange={(e) => setAccountHolderKana(e.target.value)}
                  placeholder={t('account_holder_placeholder')}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(4)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> {t('back')}
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? t('submitting') : t('submit_application')}
              </Button>
            </div>
            <button
              type="button"
              className="w-full text-sm text-gray-400 hover:text-gray-600 mt-3"
              onClick={handleSubmit}
              disabled={loading}
            >
              {t('skip_payout')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <OnboardingForm />
    </Suspense>
  )
}
