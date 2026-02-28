'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
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
import { YOGA_STYLES, LANGUAGES, TIMEZONES, Profile, InstructorProfile, InstructorPayoutInfo } from '@/types'
import { Camera, Plus, X, Instagram, Youtube, Landmark, User, BookOpen, Award, CreditCard } from 'lucide-react'
import Image from 'next/image'

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
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

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function InstructorProfilePage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)

  // Basic info
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Tokyo')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // Instructor profile
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])

  // Experience
  const [yearsExperience, setYearsExperience] = useState(1)
  const [certifications, setCertifications] = useState<string[]>([])
  const [certInput, setCertInput] = useState('')
  const [careerHistory, setCareerHistory] = useState('')

  // SNS
  const [instagramUrl, setInstagramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Payout
  const [bankName, setBankName] = useState('')
  const [bankBranch, setBankBranch] = useState('')
  const [accountType, setAccountType] = useState<'普通' | '当座'>('普通')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderKana, setAccountHolderKana] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: ip } = await supabase.from('instructor_profiles').select('*').eq('id', user.id).single()
      const { data: pay } = await supabase.from('instructor_payout_info').select('*').eq('id', user.id).single()

      if (p) {
        setProfile(p)
        setFullName(p.full_name || '')
        setTimezone(p.timezone || 'Asia/Tokyo')
        if (p.avatar_url) setAvatarPreview(p.avatar_url)
      }
      if (ip) {
        const i = ip as InstructorProfile
        setTagline(i.tagline || '')
        setBio(i.bio || '')
        setYogaStyles(i.yoga_styles || [])
        setLanguages(i.languages || [])
        setYearsExperience(i.years_experience || 1)
        setCertifications(i.certifications || [])
        setCareerHistory(i.career_history || '')
        setInstagramUrl(i.instagram_url || '')
        setYoutubeUrl(i.youtube_url || '')
      }
      if (pay) {
        const po = pay as InstructorPayoutInfo
        setBankName(po.bank_name || '')
        setBankBranch(po.bank_branch || '')
        setAccountType(po.account_type || '普通')
        setAccountNumber(po.account_number || '')
        setAccountHolderKana(po.account_holder_kana || '')
      }
    }
    load()
  }, [])

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

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Upload avatar
    let avatarUrl = profile?.avatar_url || null
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (!error) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    await supabase.from('profiles').update({
      full_name: fullName,
      timezone,
      avatar_url: avatarUrl,
    }).eq('id', user.id)

    await supabase.from('instructor_profiles').update({
      tagline,
      bio,
      yoga_styles: yogaStyles,
      languages,
      years_experience: yearsExperience,
      certifications,
      career_history: careerHistory,
      instagram_url: instagramUrl || null,
      youtube_url: youtubeUrl || null,
    }).eq('id', user.id)

    await supabase.from('instructor_payout_info').upsert({
      id: user.id,
      bank_name: bankName || null,
      bank_branch: bankBranch || null,
      account_type: accountType,
      account_number: accountNumber || null,
      account_holder_kana: accountHolderKana || null,
    })

    toast.success('プロフィールを更新しました')
    setSaving(false)
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">プロフィール編集</h1>
        </div>

        {/* ── 基本情報 ─────────────────────────────────────────────────── */}
        <Section icon={<User className="h-4 w-4 text-navy-600" />} title="基本情報">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div
              className="relative w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-navy-400 transition-colors overflow-hidden flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <Image src={avatarPreview} alt="avatar" fill className="object-cover" />
              ) : (
                <Camera className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-navy-600 hover:underline"
              >
                写真を変更
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG / PNG・推奨：正方形</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div>
            <Label>表示名</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>

          <div>
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
        </Section>

        {/* ── 自己紹介 ─────────────────────────────────────────────────── */}
        <Section icon={<BookOpen className="h-4 w-4 text-sage-600" />} title="自己紹介">
          <div>
            <Label>キャッチコピー <span className="text-gray-400 text-xs font-normal">（60字以内）</span></Label>
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
            <Label className="mb-2 block">{t('yoga_styles')}</Label>
            <div className="flex flex-wrap gap-2">
              {YOGA_STYLES.map((s) => (
                <TagButton key={s} label={s} selected={yogaStyles.includes(s)} onClick={() => toggle(yogaStyles, s, setYogaStyles)} />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t('languages')}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <TagButton key={l} label={l} selected={languages.includes(l)} onClick={() => toggle(languages, l, setLanguages)} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── 経験・資格 ───────────────────────────────────────────────── */}
        <Section icon={<Award className="h-4 w-4 text-amber-500" />} title="経験・資格">
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
            <div className="flex gap-2 mt-1 mb-2">
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
                <span key={c} className="inline-flex items-center gap-1 bg-navy-50 text-navy-700 border border-navy-200 px-3 py-1 rounded-full text-sm">
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
              placeholder="例：インドのリシケシュで修行後、東京でヨガスタジオを主宰。"
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="border-t pt-4 space-y-4">
            <div>
              <Label className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-500" /> Instagram
              </Label>
              <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://www.instagram.com/yourhandle" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-500" /> YouTube
              </Label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/@yourchannel" className="mt-1" />
            </div>
          </div>
        </Section>

        {/* ── 入金口座 ─────────────────────────────────────────────────── */}
        <Section icon={<Landmark className="h-4 w-4 text-navy-600" />} title="入金口座情報">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700">
            セッション報酬の振込先です。情報は安全に保存されます。
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>銀行名</Label>
              <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="例：三菱UFJ銀行" className="mt-1" />
            </div>
            <div>
              <Label>支店名</Label>
              <Input value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} placeholder="例：新宿支店" className="mt-1" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
          </div>

          <div>
            <Label>口座名義（カナ）</Label>
            <Input value={accountHolderKana} onChange={(e) => setAccountHolderKana(e.target.value)} placeholder="例：ヤマダ ハナコ" className="mt-1" />
          </div>
        </Section>

        <Button
          className="w-full bg-navy-600 hover:bg-navy-700 h-12 text-base rounded-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '保存中...' : '変更を保存する'}
        </Button>
      </div>
    </div>
  )
}
