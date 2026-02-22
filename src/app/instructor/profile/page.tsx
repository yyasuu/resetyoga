'use client'

import { useEffect, useState } from 'react'
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
import { YOGA_STYLES, LANGUAGES, TIMEZONES, Profile, InstructorProfile } from '@/types'

export default function InstructorProfilePage() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [instructorProfile, setInstructorProfile] = useState<InstructorProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: ip } = await supabase
        .from('instructor_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (p) {
        setProfile(p)
        setFullName(p.full_name || '')
        setTimezone(p.timezone || 'UTC')
      }
      if (ip) {
        setInstructorProfile(ip)
        setBio(ip.bio || '')
        setYogaStyles(ip.yoga_styles || [])
        setLanguages(ip.languages || [])
        setYearsExperience(ip.years_experience || 1)
      }
    }
    load()
  }, [])

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item])
  }

  const handleSave = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ full_name: fullName, timezone }).eq('id', user.id)
    await supabase.from('instructor_profiles').update({
      bio,
      yoga_styles: yogaStyles,
      languages,
      years_experience: yearsExperience,
    }).eq('id', user.id)

    toast.success('Profile updated!')
    setLoading(false)
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div>
            <Label>Full Name</Label>
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
              {YOGA_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => toggle(yogaStyles, style, setYogaStyles)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    yogaStyles.includes(style)
                      ? 'bg-navy-600 text-white border-navy-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-navy-400'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-2 block">{t('languages')}</Label>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggle(languages, lang, setLanguages)}
                  className={`px-3 py-1 rounded-full text-sm border transition-all ${
                    languages.includes(lang)
                      ? 'bg-navy-600 text-white border-navy-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-navy-400'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="experience">{t('experience')}</Label>
            <Input
              id="experience"
              type="number"
              min={0}
              max={50}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(Number(e.target.value))}
              className="mt-1 w-32"
            />
          </div>

          <Button
            className="w-full bg-navy-600 hover:bg-navy-700"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
