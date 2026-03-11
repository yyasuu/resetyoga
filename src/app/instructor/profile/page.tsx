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

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))

const parseAvatarPosition = (pos: string | null | undefined) => {
  const raw = (pos || '').toLowerCase().trim()
  const map: Record<string, number> = { left: 0, center: 50, right: 100, top: 0, bottom: 100 }
  const parts = raw.split(/\s+/).filter(Boolean)
  if (parts.length === 2 && parts[0] in map && parts[1] in map) {
    return { x: map[parts[0]], y: map[parts[1]] }
  }
  const m = raw.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/)
  if (m) return { x: clamp(Number(m[1]), 0, 100), y: clamp(Number(m[2]), 0, 100) }
  return { x: 50, y: 50 }
}

function TagButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
        selected
          ? 'bg-navy-600 text-white border-navy-600'
          : 'bg-white dark:bg-navy-700 text-gray-600 dark:text-navy-200 border-gray-300 dark:border-navy-600 hover:border-navy-400 dark:hover:border-navy-400'
      }`}
    >
      {label}
    </button>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  )
}

export default function InstructorProfilePage() {
  const t = useTranslations('instructor')
  const tOnb = useTranslations('onboarding')
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarCropRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 })

  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)

  // Basic info
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Tokyo')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPosX, setAvatarPosX] = useState(50)
  const [avatarPosY, setAvatarPosY] = useState(50)
  const [avatarZoom, setAvatarZoom] = useState(1)

  // Instructor profile
  const [isApproved, setIsApproved] = useState(false)
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

  // Payout (international)
  const [bankCountry, setBankCountry] = useState('Japan')
  const [bankName, setBankName] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')

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
        const parsed = parseAvatarPosition(p.avatar_position)
        setAvatarPosX(parsed.x)
        setAvatarPosY(parsed.y)
        setAvatarZoom(Number(p.avatar_zoom ?? 1) || 1)
      }
      if (ip) {
        const i = ip as InstructorProfile
        setIsApproved(i.is_approved ?? false)
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
        const po = pay as any
        setBankCountry(po.bank_country || 'Japan')
        setBankName(po.bank_name || '')
        setSwiftCode(po.swift_code || '')
        setIfscCode(po.ifsc_code || '')
        setAccountNumber(po.account_number || '')
        setAccountHolderName(po.account_holder_name || po.account_holder_kana || '')
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

  const startAvatarDrag = (clientX: number, clientY: number) => {
    draggingRef.current = true
    dragStartRef.current = { x: clientX, y: clientY, posX: avatarPosX, posY: avatarPosY }
  }

  const moveAvatarDrag = (clientX: number, clientY: number) => {
    if (!draggingRef.current) return
    const frame = avatarCropRef.current
    if (!frame) return
    const rect = frame.getBoundingClientRect()
    if (!rect.width || !rect.height) return

    const dxPct = ((clientX - dragStartRef.current.x) / rect.width) * 100
    const dyPct = ((clientY - dragStartRef.current.y) / rect.height) * 100
    setAvatarPosX(clamp(dragStartRef.current.posX + dxPct, 0, 100))
    setAvatarPosY(clamp(dragStartRef.current.posY + dyPct, 0, 100))
  }

  const endAvatarDrag = () => {
    draggingRef.current = false
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
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true })
      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        toast.error('Photo upload failed: ' + uploadError.message)
      } else {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        avatarUrl = urlData.publicUrl
      }
    }

    await supabase.from('profiles').update({
      full_name: fullName,
      timezone,
      avatar_url: avatarUrl,
      avatar_position: `${avatarPosX}% ${avatarPosY}%`,
      avatar_zoom: avatarZoom,
    }).eq('id', user.id)

    const { error: ipError } = await supabase.from('instructor_profiles').upsert({
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
      // NOTE: is_approved is intentionally omitted — only admins may set this
    }, { onConflict: 'id' })

    if (ipError) {
      console.error('instructor_profiles upsert error:', ipError)
      toast.error('プロフィールの保存に失敗しました: ' + ipError.message)
      setSaving(false)
      return
    }

    await supabase.from('instructor_payout_info').upsert({
      id: user.id,
      bank_country: bankCountry || 'Japan',
      bank_name: bankName || null,
      swift_code: swiftCode || null,
      ifsc_code: ifscCode || null,
      account_number: accountNumber || null,
      account_holder_name: accountHolderName || null,
    })

    toast.success(t('saved'))
    setSaving(false)
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900 text-gray-400 dark:text-navy-500">
        {t('loading')}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile_edit_title')}</h1>
        </div>

        {/* ── 基本情報 ─────────────────────────────────────────────────── */}
        <Section icon={<User className="h-4 w-4 text-navy-600" />} title={t('section_basic')}>
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div
              ref={avatarCropRef}
              className="relative w-20 h-20 rounded-full bg-gray-100 dark:bg-navy-700 border-2 border-dashed border-gray-300 dark:border-navy-500 flex items-center justify-center cursor-pointer hover:border-navy-400 transition-colors overflow-hidden flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              onMouseDown={(e) => {
                if (!avatarPreview) return
                e.preventDefault()
                startAvatarDrag(e.clientX, e.clientY)
              }}
              onMouseMove={(e) => moveAvatarDrag(e.clientX, e.clientY)}
              onMouseUp={endAvatarDrag}
              onMouseLeave={endAvatarDrag}
              onTouchStart={(e) => {
                if (!avatarPreview) return
                const t = e.touches[0]
                startAvatarDrag(t.clientX, t.clientY)
              }}
              onTouchMove={(e) => {
                const t = e.touches[0]
                moveAvatarDrag(t.clientX, t.clientY)
              }}
              onTouchEnd={endAvatarDrag}
              style={{ touchAction: 'none' }}
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="avatar"
                  fill
                  className="object-cover"
                  style={{ objectPosition: `${avatarPosX}% ${avatarPosY}%`, transform: `scale(${avatarZoom})` }}
                />
              ) : (
                <Camera className="h-6 w-6 text-gray-400 dark:text-navy-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-navy-600 dark:text-sage-400 hover:underline"
              >
                {t('change_photo')}
              </button>
              <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">{t('photo_hint')}</p>
              {avatarPreview && (
                <p className="text-xs text-gray-500 dark:text-navy-400 mt-1">Drag to adjust photo position / ドラッグで位置調整</p>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div>
            <Label className="dark:text-navy-200">{t('display_name')}</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
          </div>

          <div>
            <Label className="dark:text-navy-200">{tOnb('your_timezone')}</Label>
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

          <div>
            <Label className="dark:text-navy-200">Zoom / ズーム</Label>
            <input
              type="range"
              min={1}
              max={2.5}
              step={0.05}
              value={avatarZoom}
              onChange={(e) => setAvatarZoom(Number(e.target.value))}
              className="w-full mt-2"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-400 dark:text-navy-400">
              <span>1.0x</span>
              <span>{avatarZoom.toFixed(2)}x</span>
              <span>2.5x</span>
            </div>
          </div>
        </Section>

        {/* ── 自己紹介 ─────────────────────────────────────────────────── */}
        <Section icon={<BookOpen className="h-4 w-4 text-sage-600" />} title={t('section_intro')}>
          <div>
            <Label className="dark:text-navy-200">{t('tagline_label')} <span className="text-gray-400 dark:text-navy-500 text-xs font-normal">{t('tagline_hint')}</span></Label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder={tOnb('tagline_placeholder')}
              maxLength={60}
              className="mt-1"
            />
            <p className="text-xs text-gray-400 dark:text-navy-400 mt-1 text-right">{tagline.length}/60</p>
          </div>

          <div>
            <Label className="dark:text-navy-200">{tOnb('bio')}</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={tOnb('bio_placeholder')}
              rows={4}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="mb-2 block dark:text-navy-200">{tOnb('yoga_styles')}</Label>
            <div className="flex flex-wrap gap-2">
              {YOGA_STYLES.map((s) => (
                <TagButton key={s} label={s} selected={yogaStyles.includes(s)} onClick={() => toggle(yogaStyles, s, setYogaStyles)} />
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block dark:text-navy-200">{tOnb('languages')}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((l) => (
                <TagButton key={l} label={l} selected={languages.includes(l)} onClick={() => toggle(languages, l, setLanguages)} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── 経験・資格 ───────────────────────────────────────────────── */}
        <Section icon={<Award className="h-4 w-4 text-amber-500" />} title={t('section_experience')}>
          <div>
            <Label className="dark:text-navy-200">{tOnb('experience')}</Label>
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
            <Label className="dark:text-navy-200">{tOnb('certifications_label')}</Label>
            <div className="flex gap-2 mt-1 mb-2">
              <Input
                value={certInput}
                onChange={(e) => setCertInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCert())}
                placeholder={tOnb('cert_placeholder')}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addCert} size="icon" className="dark:border-navy-600 dark:text-navy-200">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {certifications.map((c) => (
                <span key={c} className="inline-flex items-center gap-1 bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-navy-200 border border-navy-200 dark:border-navy-600 px-3 py-1 rounded-full text-sm">
                  {c}
                  <button onClick={() => setCertifications(certifications.filter((x) => x !== c))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label className="dark:text-navy-200">{t('career_history_label')}</Label>
            <Textarea
              value={careerHistory}
              onChange={(e) => setCareerHistory(e.target.value)}
              placeholder={t('career_placeholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="border-t dark:border-navy-700 pt-4 space-y-4">
            <div>
              <Label className="flex items-center gap-2 dark:text-navy-200">
                <Instagram className="h-4 w-4 text-pink-500" /> Instagram
              </Label>
              <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://www.instagram.com/yourhandle" className="mt-1" />
            </div>
            <div>
              <Label className="flex items-center gap-2 dark:text-navy-200">
                <Youtube className="h-4 w-4 text-red-500" /> YouTube
              </Label>
              <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/@yourchannel" className="mt-1" />
            </div>
          </div>
        </Section>

        {/* ── 入金口座 ─────────────────────────────────────────────────── */}
        <Section icon={<Landmark className="h-4 w-4 text-navy-600" />} title={t('section_payout')}>
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 text-sm text-blue-700 dark:text-blue-300">
            {t('payout_note')}
          </div>

          <div>
            <Label className="dark:text-navy-200">{tOnb('bank_country')}</Label>
            <Select value={bankCountry} onValueChange={setBankCountry}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  'Japan', 'India', 'United States', 'United Kingdom',
                  'Singapore', 'Australia', 'Canada', 'Germany',
                  'France', 'Brazil', 'Other',
                ].map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="dark:text-navy-200">{tOnb('bank_name')}</Label>
            <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={tOnb('bank_name_placeholder')} className="mt-1" />
          </div>

          <div>
            <Label className="dark:text-navy-200">
              {tOnb('swift_code')}
              <span className="text-gray-400 dark:text-navy-500 text-xs font-normal ml-1">{tOnb('swift_code_hint')}</span>
            </Label>
            <Input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value.toUpperCase())} placeholder={tOnb('swift_code_placeholder')} className="mt-1" />
          </div>

          {bankCountry === 'India' && (
            <div>
              <Label className="dark:text-navy-200">
                IFSC Code
                <span className="text-gray-400 dark:text-navy-500 text-xs font-normal ml-1">
                  (Indian Financial System Code · 11 characters)
                </span>
              </Label>
              <Input
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={11}
                className="mt-1 font-mono tracking-wide"
              />
            </div>
          )}

          <div>
            <Label className="dark:text-navy-200">{tOnb('account_number')}</Label>
            <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder={tOnb('account_number_placeholder')} className="mt-1" />
          </div>

          <div>
            <Label className="dark:text-navy-200">{tOnb('account_holder_name')}</Label>
            <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} placeholder={tOnb('account_holder_placeholder')} className="mt-1" />
          </div>
        </Section>

        <Button
          className="w-full bg-navy-600 hover:bg-navy-700 h-12 text-base rounded-full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? t('saving') : t('save_btn')}
        </Button>
      </div>
    </div>
  )
}
