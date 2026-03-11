'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, User, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { YOGA_STYLES, LANGUAGES } from '@/types'

export default function AdminInstructorEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()

  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [instructorData, setInstructorData] = useState<any>(null)
  const [ip, setIp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [yearsExperience, setYearsExperience] = useState(0)
  const [tagline, setTagline] = useState('')
  const [bio, setBio] = useState('')
  const [yogaStyles, setYogaStyles] = useState<string[]>([])
  const [languages, setLanguages] = useState<string[]>([])
  const [certifications, setCertifications] = useState('')
  const [careerHistory, setCareerHistory] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isApproved, setIsApproved] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p?.role !== 'admin') { router.push('/dashboard'); return }
      setAdminProfile(p)

      const res = await fetch(`/api/admin/instructors/${id}`)
      if (!res.ok) { setError('Instructor not found'); setLoading(false); return }
      const json = await res.json()
      setInstructorData(json.profile)
      setIp(json.instructor_profile)

      setFullName(json.profile?.full_name ?? '')
      const i = json.instructor_profile
      if (i) {
        setYearsExperience(i.years_experience ?? 0)
        setTagline(i.tagline ?? '')
        setBio(i.bio ?? '')
        setYogaStyles(i.yoga_styles ?? [])
        setLanguages(i.languages ?? [])
        setCertifications((i.certifications ?? []).join('\n'))
        setCareerHistory(i.career_history ?? '')
        setInstagramUrl(i.instagram_url ?? '')
        setYoutubeUrl(i.youtube_url ?? '')
        setIsApproved(i.is_approved ?? false)
      }
      setLoading(false)
    }
    load()
  }, [id])

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    const res = await fetch(`/api/admin/instructors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        years_experience: yearsExperience,
        tagline: tagline || null,
        bio: bio || null,
        yoga_styles: yogaStyles,
        languages,
        certifications: certifications.split('\n').map(s => s.trim()).filter(Boolean),
        career_history: careerHistory || null,
        instagram_url: instagramUrl || null,
        youtube_url: youtubeUrl || null,
        is_approved: isApproved,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setSuccess('保存しました / Saved successfully')
    } else {
      const json = await res.json()
      setError(json.error ?? 'Save failed')
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>
  if (!adminProfile) return null

  const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400'
  const labelCls = 'block text-xs font-semibold text-gray-500 dark:text-navy-300 mb-1'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={adminProfile} />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-4">
            <ChevronLeft className="h-4 w-4" />
            Admin Dashboard
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="h-6 w-6 text-navy-500" />
                講師プロフィール編集
              </h1>
              <p className="text-sm text-gray-500 dark:text-navy-300 mt-1">
                {instructorData?.full_name} · {instructorData?.email}
              </p>
            </div>
            <Link
              href={`/instructors/${id}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs text-sage-600 dark:text-sage-400 hover:underline flex-shrink-0"
            >
              公開プロフィールを確認 <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">基本情報</h2>

          <div>
            <label className={labelCls}>表示名 / Display Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>経験年数 / Years of Experience</label>
            <input
              type="number" min={0} max={60}
              value={yearsExperience}
              onChange={e => setYearsExperience(Number(e.target.value))}
              className={inputCls + ' w-28'}
            />
          </div>

          <div>
            <label className={labelCls}>タグライン / Tagline</label>
            <input value={tagline} onChange={e => setTagline(e.target.value)} maxLength={60} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>自己紹介 / Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>ヨガスタイル / Yoga Styles</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {YOGA_STYLES.map(s => (
                <button
                  key={s} type="button"
                  onClick={() => toggle(yogaStyles, s, setYogaStyles)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    yogaStyles.includes(s)
                      ? 'bg-navy-600 border-navy-600 text-white'
                      : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-navy-300 hover:border-sage-400'
                  }`}
                >{s}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>言語 / Languages</label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {LANGUAGES.map(l => (
                <button
                  key={l} type="button"
                  onClick={() => toggle(languages, l, setLanguages)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    languages.includes(l)
                      ? 'bg-navy-600 border-navy-600 text-white'
                      : 'border-gray-200 dark:border-navy-600 text-gray-600 dark:text-navy-300 hover:border-sage-400'
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>資格・認定 / Certifications（1行1件）</label>
            <textarea value={certifications} onChange={e => setCertifications(e.target.value)} rows={3} className={inputCls} placeholder="RYT-200&#10;Yin Yoga Teacher Training" />
          </div>

          <div>
            <label className={labelCls}>経歴 / Career History</label>
            <textarea value={careerHistory} onChange={e => setCareerHistory(e.target.value)} rows={3} className={inputCls} />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Instagram URL</label>
              <input value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className={inputCls} placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label className={labelCls}>YouTube URL</label>
              <input value={youtubeUrl} onChange={e => setYoutubeUrl(e.target.value)} className={inputCls} placeholder="https://youtube.com/@..." />
            </div>
          </div>

          <div className="border-t dark:border-navy-700 pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setIsApproved(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isApproved ? 'bg-sage-500' : 'bg-gray-300 dark:bg-navy-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isApproved ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {isApproved ? '承認済み / Approved' : '未承認 / Not approved'}
              </span>
            </label>
          </div>
        </div>

        {error && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm border border-green-200 dark:border-green-800">
            {success}
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="bg-navy-600 hover:bg-navy-700 text-white gap-2">
            <Save className="h-4 w-4" />
            {saving ? '保存中...' : '変更を保存 / Save Changes'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/dashboard')} className="dark:border-navy-600 dark:text-navy-200">
            キャンセル
          </Button>
        </div>
      </div>
    </div>
  )
}
