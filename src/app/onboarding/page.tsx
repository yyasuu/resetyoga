'use client'

import { useState, Suspense } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { YOGA_STYLES, LANGUAGES, TIMEZONES } from '@/types'
import { GraduationCap, BookOpen, CheckCircle } from 'lucide-react'

function OnboardingForm() {
  const t = useTranslations('onboarding')
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') as 'instructor' | 'student' || 'student'

  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'instructor' | 'student'>(initialRole)
  const [timezone, setTimezone] = useState('UTC')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const supabase = createClient()

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item))
    } else {
      setter([...arr, item])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    // Update profile with role and timezone
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role, timezone })
      .eq('id', user.id)

    if (profileError) {
      toast.error('Failed to save profile')
      setLoading(false)
      return
    }

    if (role === 'instructor') {
      // Create instructor profile
      const { error: instructorError } = await supabase.from('instructor_profiles').upsert({
        id: user.id,
        bio,
        yoga_styles: yogaStyles,
        languages,
        years_experience: yearsExperience,
        is_approved: false,
      })

      if (instructorError) {
        toast.error('Failed to save instructor profile')
        setLoading(false)
        return
      }
      setDone(true)
    } else {
      // Create student subscription (trial)
      const { error: subError } = await supabase.from('student_subscriptions').upsert({
        student_id: user.id,
        status: 'trial',
        trial_used: 0,
        trial_limit: 2,
        sessions_used: 0,
        sessions_limit: 4,
      })

      if (subError) {
        toast.error('Failed to initialize subscription')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    }

    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">{t('pending_approval')}</p>
          <Button
            onClick={() => router.push('/')}
            className="bg-navy-600 hover:bg-navy-700"
          >
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg">
        {/* Step 1: Role selection */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h1>
            <p className="text-gray-500 mb-8">{t('choose_role')}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setRole('student')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  role === 'student'
                    ? 'border-navy-600 bg-navy-50'
                    : 'border-gray-200 hover:border-navy-300'
                }`}
              >
                <BookOpen
                  className={`h-8 w-8 mb-3 ${
                    role === 'student' ? 'text-navy-600' : 'text-gray-400'
                  }`}
                />
                <h3 className="font-bold text-gray-900 mb-1">{t('student_role')}</h3>
                <p className="text-sm text-gray-500">{t('student_desc')}</p>
              </button>

              <button
                onClick={() => setRole('instructor')}
                className={`p-6 rounded-xl border-2 text-left transition-all ${
                  role === 'instructor'
                    ? 'border-navy-600 bg-navy-50'
                    : 'border-gray-200 hover:border-navy-300'
                }`}
              >
                <GraduationCap
                  className={`h-8 w-8 mb-3 ${
                    role === 'instructor' ? 'text-navy-600' : 'text-gray-400'
                  }`}
                />
                <h3 className="font-bold text-gray-900 mb-1">{t('instructor_role')}</h3>
                <p className="text-sm text-gray-500">{t('instructor_desc')}</p>
              </button>
            </div>

            <div className="mb-6">
              <Label>{t('your_timezone')}</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full bg-navy-600 hover:bg-navy-700"
              onClick={() => (role === 'instructor' ? setStep(2) : handleSubmit())}
              disabled={loading}
            >
              {loading ? 'Saving...' : t('continue')}
            </Button>
          </>
        )}

        {/* Step 2: Instructor profile details */}
        {step === 2 && role === 'instructor' && (
          <>
            <button onClick={() => setStep(1)} className="text-navy-600 text-sm mb-4 hover:underline">
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Instructor Profile</h1>

            <div className="space-y-5">
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
                      onClick={() => toggleItem(yogaStyles, style, setYogaStyles)}
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
                      onClick={() => toggleItem(languages, lang, setLanguages)}
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
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              className="w-full bg-navy-600 hover:bg-navy-700 mt-6"
              onClick={handleSubmit}
              disabled={loading || yogaStyles.length === 0 || languages.length === 0}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OnboardingForm />
    </Suspense>
  )
}
