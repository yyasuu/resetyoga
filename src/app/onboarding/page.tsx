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
      toast.error('プロフィールの保存に失敗しました')
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
        toast.error('講師プロフィールの保存に失敗しました')
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
        toast.error('初期設定に失敗しました')
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">申請を受け付けました！</h2>
          <p className="text-gray-600 mb-2">{t('pending_approval')}</p>
          <p className="text-sm text-gray-400 mb-8">
            審査には通常1〜3営業日かかります。承認後にメールでご連絡します。
          </p>
          <Button onClick={() => router.push('/')} className="bg-navy-600 hover:bg-navy-700 w-full rounded-full">
            ホームへ戻る
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
              {loading ? '保存中...' : role === 'student' ? 'はじめる' : `次へ →`}
            </Button>
          </>
        )}

        {/* ── Step 2: Basic Info ────────────────────────────────────────── */}
        {step === 2 && role === 'instructor' && (
          <>
            <ProgressBar current={1} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">基本情報</h2>
            <p className="text-gray-500 text-sm mb-6">生徒に表示される名前と写真を設定してください。</p>

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
                写真を選択（任意）
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
                <Label>表示名 <span className="text-red-500">*</span></Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="例：田中 アシュウィン"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                disabled={!fullName.trim()}
                onClick={() => setStep(3)}
              >
                次へ <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 3: Introduction ──────────────────────────────────────── */}
        {step === 3 && role === 'instructor' && (
          <>
            <ProgressBar current={2} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">自己紹介</h2>
            <p className="text-gray-500 text-sm mb-6">あなたのヨガの魅力を伝えましょう。</p>

            <div className="space-y-5">
              <div>
                <Label>キャッチコピー <span className="text-gray-400 text-xs font-normal">（一言で自分を表現）</span></Label>
                <Input
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="例：呼吸から始まる、心の旅へ"
                  maxLength={60}
                  className="mt-1"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{tagline.length}/60</p>
              </div>

              <div>
                <Label>{t('bio')} <span className="text-gray-400 text-xs font-normal">（詳しい自己紹介）</span></Label>
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
                <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                disabled={yogaStyles.length === 0 || languages.length === 0}
                onClick={() => setStep(4)}
              >
                次へ <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ── Step 4: Experience & Certifications ──────────────────────── */}
        {step === 4 && role === 'instructor' && (
          <>
            <ProgressBar current={3} total={INSTRUCTOR_STEPS} />
            <h2 className="text-xl font-bold text-gray-900 mb-1">経験・資格・SNS</h2>
            <p className="text-gray-500 text-sm mb-6">あなたの実績と活動を教えてください。</p>

            <div className="space-y-5">
              <div>
                <Label>{t('experience')}（年）</Label>
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
                <Label>保有資格・認定証</Label>
                <p className="text-xs text-gray-400 mb-2">取得している資格や認定証を追加してください（複数可）</p>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                    placeholder="例：全米ヨガアライアンス RYT200"
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
                <Label>経歴・専門分野</Label>
                <Textarea
                  value={careerHistory}
                  onChange={(e) => setCareerHistory(e.target.value)}
                  placeholder="例：インドのリシケシュで5年修行後、東京でヨガスタジオを主宰。産前産後ヨガを専門としています。"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <Instagram className="h-4 w-4 text-pink-500" /> Instagram（任意）
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
                  <Youtube className="h-4 w-4 text-red-500" /> YouTube（任意）
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
                <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                onClick={() => setStep(5)}
              >
                次へ <ChevronRight className="h-4 w-4 ml-1" />
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
              入金口座情報
            </h2>
            <p className="text-gray-500 text-sm mb-2">セッション報酬の振込先を登録してください。</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6 text-sm text-blue-700">
              この情報は暗号化されて保存されます。後から変更できます。スキップして後で登録することも可能です。
            </div>

            <div className="space-y-4">
              <div>
                <Label>銀行名</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="例：三菱UFJ銀行"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>支店名</Label>
                <Input
                  value={bankBranch}
                  onChange={(e) => setBankBranch(e.target.value)}
                  placeholder="例：新宿支店"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>口座種別</Label>
                <Select value={accountType} onValueChange={(v) => setAccountType(v as '普通' | '当座')}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="普通">普通</SelectItem>
                    <SelectItem value="当座">当座</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>口座番号</Label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="例：1234567"
                  maxLength={8}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>口座名義（カナ）</Label>
                <Input
                  value={accountHolderKana}
                  onChange={(e) => setAccountHolderKana(e.target.value)}
                  placeholder="例：ヤマダ ハナコ"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setStep(4)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
              </Button>
              <Button
                className="flex-1 bg-navy-600 hover:bg-navy-700 rounded-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '申請中...' : '申請する ✓'}
              </Button>
            </div>
            <button
              type="button"
              className="w-full text-sm text-gray-400 hover:text-gray-600 mt-3"
              onClick={handleSubmit}
              disabled={loading}
            >
              口座情報はあとで登録する
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <OnboardingForm />
    </Suspense>
  )
}
