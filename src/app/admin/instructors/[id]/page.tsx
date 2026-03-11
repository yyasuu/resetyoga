'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Save, User, ExternalLink, Camera, Star } from 'lucide-react'
import Link from 'next/link'
import { YOGA_STYLES, LANGUAGES } from '@/types'
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

export default function AdminInstructorEditPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const avatarCropRef = useRef<HTMLDivElement>(null)
  const pointerIdRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const movedRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 50, posY: 50 })

  const [adminProfile, setAdminProfile] = useState<any>(null)
  const [instructorData, setInstructorData] = useState<any>(null)
  const [ip, setIp] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Editable fields
  const [fullName, setFullName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPosX, setAvatarPosX] = useState(50)
  const [avatarPosY, setAvatarPosY] = useState(50)
  const [avatarZoom, setAvatarZoom] = useState(1)
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
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewSavingId, setReviewSavingId] = useState<string | null>(null)
  const [reviewCandidates, setReviewCandidates] = useState<any[]>([])
  const [newReviewBookingId, setNewReviewBookingId] = useState('')
  const [newReviewRating, setNewReviewRating] = useState(5)
  const [newReviewComment, setNewReviewComment] = useState('')
  const [creatingReview, setCreatingReview] = useState(false)

  const reloadReviewData = async () => {
    const { data: reviewRows } = await supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles!reviews_student_id_fkey(full_name)')
      .eq('instructor_id', id)
      .order('created_at', { ascending: false })
    setReviews((reviewRows as any[]) || [])

    const candRes = await fetch(`/api/admin/instructors/${id}/review-candidates`)
    const candJson = await candRes.json().catch(() => null)
    setReviewCandidates(candJson?.candidates || [])
  }

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
      if (json.profile?.avatar_url) setAvatarPreview(json.profile.avatar_url)
      const parsed = parseAvatarPosition(json.profile?.avatar_position)
      setAvatarPosX(parsed.x)
      setAvatarPosY(parsed.y)
      setAvatarZoom(Number(json.profile?.avatar_zoom ?? 1) || 1)
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

      await reloadReviewData()
      setLoading(false)
    }
    load()
  }, [id])

  const toggle = (arr: string[], item: string, setter: (v: string[]) => void) => {
    setter(arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item])
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    setAvatarZoom(1.2)
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
    pointerIdRef.current = null
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    let avatarUrl = instructorData?.avatar_url || null

    if (avatarFile) {
      const formData = new FormData()
      formData.append('file', avatarFile)
      const uploadRes = await fetch(`/api/admin/instructors/${id}/avatar`, {
        method: 'POST',
        body: formData,
      })
      const uploadJson = await uploadRes.json().catch(() => null)
      if (!uploadRes.ok) {
        setSaving(false)
        setError(uploadJson?.error ?? 'Avatar upload failed')
        return
      }
      avatarUrl = uploadJson?.publicUrl ?? avatarUrl
    }

    const res = await fetch(`/api/admin/instructors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        avatar_url: avatarUrl,
        avatar_position: `${avatarPosX}% ${avatarPosY}%`,
        avatar_zoom: avatarZoom,
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

  const updateReviewField = (reviewId: string, field: 'rating' | 'comment', value: string | number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, [field]: value } : r))
    )
  }

  const handleReviewSave = async (reviewId: string) => {
    const target = reviews.find((r) => r.id === reviewId)
    if (!target) return
    setReviewSavingId(reviewId)
    const res = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: Number(target.rating),
        comment: target.comment ?? '',
      }),
    })
    const json = await res.json().catch(() => null)
    setReviewSavingId(null)
    if (res.ok) {
      setSuccess('レビューを更新しました / Review updated')
      await reloadReviewData()
    } else {
      setError(json?.error ?? 'Failed to update review')
    }
  }

  const handleReviewDelete = async (reviewId: string) => {
    setReviewSavingId(reviewId)
    const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' })
    const json = await res.json().catch(() => null)
    setReviewSavingId(null)
    if (res.ok) {
      setSuccess('レビューを削除しました / Review deleted')
      await reloadReviewData()
    } else {
      setError(json?.error ?? 'Failed to delete review')
    }
  }

  const handleCreateReview = async () => {
    const candidate = reviewCandidates.find((c) => c.booking_id === newReviewBookingId)
    if (!candidate) {
      setError('レビュー作成対象の予約を選択してください / Select a booking')
      return
    }
    setCreatingReview(true)
    setError('')
    const res = await fetch('/api/admin/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor_id: id,
        student_id: candidate.student_id,
        booking_id: candidate.booking_id,
        rating: newReviewRating,
        comment: newReviewComment,
      }),
    })
    const json = await res.json().catch(() => null)
    setCreatingReview(false)
    if (res.ok) {
      setSuccess('レビューを追加しました / Review added')
      setNewReviewBookingId('')
      setNewReviewRating(5)
      setNewReviewComment('')
      await reloadReviewData()
    } else {
      setError(json?.error ?? 'Failed to create review')
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

          <div className="flex items-center gap-5">
            <div
              ref={avatarCropRef}
              className="relative w-20 h-20 rounded-full bg-gray-100 dark:bg-navy-700 border-2 border-dashed border-gray-300 dark:border-navy-500 flex items-center justify-center hover:border-navy-400 transition-colors overflow-hidden flex-shrink-0 cursor-move"
              onPointerDown={(e) => {
                if (!avatarPreview) return
                e.preventDefault()
                pointerIdRef.current = e.pointerId
                movedRef.current = false
                startAvatarDrag(e.clientX, e.clientY)
                avatarCropRef.current?.setPointerCapture(e.pointerId)
              }}
              onPointerMove={(e) => {
                if (!draggingRef.current) return
                movedRef.current = true
                moveAvatarDrag(e.clientX, e.clientY)
              }}
              onPointerUp={() => {
                if (pointerIdRef.current !== null) {
                  avatarCropRef.current?.releasePointerCapture(pointerIdRef.current)
                }
                endAvatarDrag()
                if (!movedRef.current) fileInputRef.current?.click()
              }}
              onPointerCancel={endAvatarDrag}
              onWheel={(e) => {
                if (!avatarPreview) return
                e.preventDefault()
                const delta = e.deltaY > 0 ? -0.05 : 0.05
                setAvatarZoom((z) => clamp(z + delta, 0.5, 3))
              }}
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
                写真を変更 / Change photo
              </button>
              <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">ドラッグで位置調整 / Drag to reposition</p>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Zoom / ズーム</label>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.05}
              value={avatarZoom}
              onChange={(e) => setAvatarZoom(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 dark:text-navy-400 mt-1">{avatarZoom.toFixed(2)}x</p>
            <div className="mt-3 space-y-2">
              <div>
                <label className={labelCls + ' mb-0'}>Horizontal / 左右</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={avatarPosX}
                  onChange={(e) => setAvatarPosX(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className={labelCls + ' mb-0'}>Vertical / 上下</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={avatarPosY}
                  onChange={(e) => setAvatarPosY(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

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

        <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            レビュー編集 / Edit Reviews
          </h2>
          <div className="border border-dashed border-gray-300 dark:border-navy-600 rounded-lg p-4 space-y-3">
            <p className="text-xs font-semibold text-gray-500 dark:text-navy-300 uppercase tracking-wide">新規レビュー作成 / Add Review</p>
            {reviewCandidates.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-navy-300">作成可能な完了予約がありません</p>
            ) : (
              <>
                <select
                  value={newReviewBookingId}
                  onChange={(e) => setNewReviewBookingId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                >
                  <option value="">予約を選択 / Select booking</option>
                  {reviewCandidates.map((c) => (
                    <option key={c.booking_id} value={c.booking_id}>
                      {c.student_name} · {new Date(c.created_at).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500 dark:text-navy-300">Rating</label>
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="px-2 py-1 text-sm border border-gray-200 dark:border-navy-600 rounded bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  rows={3}
                  className={inputCls}
                  placeholder="Review comment"
                />
                <Button
                  type="button"
                  onClick={handleCreateReview}
                  disabled={creatingReview || !newReviewBookingId}
                  className="bg-navy-600 hover:bg-navy-700 text-white"
                >
                  {creatingReview ? 'Creating...' : 'Create Review'}
                </Button>
              </>
            )}
          </div>

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-navy-300">レビューはまだありません</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border border-gray-200 dark:border-navy-600 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {(review.profiles as any)?.full_name || 'Student'} · {new Date(review.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-500 dark:text-navy-300">Rating</label>
                      <select
                        value={Number(review.rating)}
                        onChange={(e) => updateReviewField(review.id, 'rating', Number(e.target.value))}
                        className="px-2 py-1 text-sm border border-gray-200 dark:border-navy-600 rounded bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <textarea
                    value={review.comment || ''}
                    onChange={(e) => updateReviewField(review.id, 'comment', e.target.value)}
                    rows={3}
                    className={inputCls}
                    placeholder="Review comment"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => handleReviewSave(review.id)}
                      disabled={reviewSavingId === review.id}
                      className="bg-sage-600 hover:bg-sage-700 text-white"
                    >
                      {reviewSavingId === review.id ? 'Saving...' : 'Save Review'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleReviewDelete(review.id)}
                      disabled={reviewSavingId === review.id}
                      className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
