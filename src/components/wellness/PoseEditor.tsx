'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, Sparkles, Lock, Globe2 } from 'lucide-react'
import { POSE_FAMILIES, DIFFICULTY_LEVELS, YogaPose } from '@/lib/poses'
import { CONCERNS } from '@/lib/concerns'

interface PoseEditorProps {
  initialPose?: YogaPose | null
  mode: 'create' | 'edit'
  locale: string
}

export function PoseEditor({ initialPose, mode, locale }: PoseEditorProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name_sanskrit:  initialPose?.name_sanskrit  ?? '',
    name_en:        initialPose?.name_en        ?? '',
    name_ja:        initialPose?.name_ja        ?? '',
    image_url:      initialPose?.image_url       ?? '',
    description_ja: initialPose?.description_ja ?? '',
    description_en: initialPose?.description_en ?? '',
    how_to_ja:      initialPose?.how_to_ja      ?? '',
    how_to_en:      initialPose?.how_to_en      ?? '',
    pose_family:    initialPose?.pose_family    ?? '',
    difficulty:     initialPose?.difficulty     ?? 'beginner',
    variation_number: initialPose?.variation_number ?? 1,
    access_level:   initialPose?.access_level   ?? 'public',
    concerns:       initialPose?.concerns       ?? [] as string[],
    is_published:   initialPose?.is_published   ?? false,
  })

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/wellness/upload-pose-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }))
      } else {
        setError(data.error ?? 'Upload failed')
      }
    } catch {
      setError('Image upload failed')
    } finally {
      setUploading(false)
    }
  }

  const toggleConcern = (id: string) => {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(id)
        ? f.concerns.filter(c => c !== id)
        : [...f.concerns, id],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name_sanskrit || !form.name_en || !form.name_ja) {
      setError(locale === 'ja' ? 'サンスクリット名・英語名・日本語名は必須です。' : 'Sanskrit, English, and Japanese names are required.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      name_sanskrit:    form.name_sanskrit,
      name_en:          form.name_en,
      name_ja:          form.name_ja,
      image_url:        form.image_url || null,
      description_ja:   form.description_ja || null,
      description_en:   form.description_en || null,
      how_to_ja:        form.how_to_ja || null,
      how_to_en:        form.how_to_en || null,
      pose_family:      form.pose_family || null,
      difficulty:       form.difficulty,
      variation_number: form.variation_number,
      access_level:     form.access_level,
      concerns:         form.concerns,
      is_published:     form.is_published,
    }

    try {
      const url = mode === 'edit' && initialPose
        ? `/api/admin/poses/${initialPose.id}`
        : '/api/admin/poses'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/wellness')
      } else {
        const data = await res.json()
        setError(data.error ?? 'Failed to save pose')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {locale === 'ja' ? '画像' : 'Image'}
        </label>
        <div
          className="border-2 border-dashed border-gray-200 dark:border-navy-600 rounded-2xl overflow-hidden cursor-pointer hover:border-sage-400 dark:hover:border-sage-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {form.image_url ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={form.image_url}
                alt="Pose preview"
                className="w-full h-56 object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  {locale === 'ja' ? '画像を変更' : 'Change image'}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-3 text-gray-400 dark:text-navy-400">
              {uploading ? (
                <div className="w-8 h-8 border-2 border-sage-300 border-t-sage-600 rounded-full animate-spin" />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span className="text-sm">
                    {locale === 'ja' ? 'クリックして画像をアップロード' : 'Click to upload image'}
                  </span>
                  <span className="text-xs">JPG, PNG, WebP — max 5MB</span>
                </>
              )}
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleImageUpload(file)
          }}
        />
      </div>

      {/* Names */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            {locale === 'ja' ? 'サンスクリット名' : 'Sanskrit Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name_sanskrit}
            onChange={e => setForm(f => ({ ...f, name_sanskrit: e.target.value }))}
            placeholder="e.g. Tadasana"
            required
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            {locale === 'ja' ? '英語名' : 'English Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name_en}
            onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))}
            placeholder="e.g. Mountain Pose"
            required
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            {locale === 'ja' ? '日本語名' : 'Japanese Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name_ja}
            onChange={e => setForm(f => ({ ...f, name_ja: e.target.value }))}
            placeholder="例：山のポーズ"
            required
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500"
          />
        </div>
      </div>

      {/* Pose Family */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {locale === 'ja' ? 'ポーズファミリー' : 'Pose Family'}
        </label>
        <select
          value={form.pose_family}
          onChange={e => setForm(f => ({ ...f, pose_family: e.target.value }))}
          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500"
        >
          <option value="">{locale === 'ja' ? '選択してください' : 'Select family'}</option>
          {POSE_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>
              {locale === 'ja' ? `${f.ja} (${f.en})` : `${f.en} (${f.ja})`}
            </option>
          ))}
        </select>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {locale === 'ja' ? '難易度' : 'Difficulty'}
        </label>
        <div className="flex gap-3 flex-wrap">
          {DIFFICULTY_LEVELS.map(d => (
            <label key={d.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="difficulty"
                value={d.value}
                checked={form.difficulty === d.value}
                onChange={() => setForm(f => ({ ...f, difficulty: d.value }))}
                className="w-4 h-4 text-navy-600 focus:ring-navy-400"
              />
              <span className={`text-sm font-medium ${
                d.value === 'advanced'
                  ? 'text-red-600 dark:text-red-400'
                  : d.value === 'intermediate'
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {d.ja} ({d.en})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Variation Number */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
          {locale === 'ja' ? 'バリエーション番号' : 'Variation Number'}
        </label>
        <input
          type="number"
          min={1}
          max={99}
          value={form.variation_number}
          onChange={e => setForm(f => ({ ...f, variation_number: parseInt(e.target.value) || 1 }))}
          className="w-24 px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500"
        />
      </div>

      {/* Access Level */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {locale === 'ja' ? 'アクセスレベル' : 'Access Level'}
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'public',  labelJa: '🌿 全体公開',   labelEn: '🌿 Public',  Icon: Globe2,   cls: 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' },
            { value: 'member',  labelJa: '🔒 無料会員',   labelEn: '🔒 Members', Icon: Lock,     cls: 'border-sage-300 dark:border-sage-700 bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-300' },
            { value: 'premium', labelJa: '✨ プレミアム', labelEn: '✨ Premium', Icon: Sparkles, cls: 'border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm(f => ({ ...f, access_level: opt.value }))}
              className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                form.access_level === opt.value
                  ? opt.cls + ' shadow-sm'
                  : 'border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-500 dark:text-navy-400'
              }`}
            >
              {locale === 'ja' ? opt.labelJa : opt.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Concern Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          {locale === 'ja' ? 'お悩みタグ' : 'Concern Tags'}
        </label>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map(c => (
            <label
              key={c.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border cursor-pointer transition-all ${
                form.concerns.includes(c.id)
                  ? 'bg-navy-600 text-white border-navy-600 shadow-sm'
                  : 'bg-white dark:bg-navy-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400'
              }`}
            >
              <input
                type="checkbox"
                className="hidden"
                checked={form.concerns.includes(c.id)}
                onChange={() => toggleConcern(c.id)}
              />
              <span>{c.icon}</span>
              <span>{locale === 'ja' ? c.ja : c.en}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            {locale === 'ja' ? '説明（日本語）' : 'Description (Japanese)'}
          </label>
          <textarea
            value={form.description_ja}
            onChange={e => setForm(f => ({ ...f, description_ja: e.target.value }))}
            rows={3}
            placeholder={locale === 'ja' ? 'ポーズの説明（日本語）' : 'Description in Japanese'}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500 resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            {locale === 'ja' ? '説明（英語）' : 'Description (English)'}
          </label>
          <textarea
            value={form.description_en}
            onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))}
            rows={3}
            placeholder="Description in English"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500 resize-y"
          />
        </div>
      </div>

      {/* How-to Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {locale === 'ja' ? 'ステップ手順（日本語）' : 'How-to Steps (Japanese)'}
          </label>
          <p className="text-xs text-gray-400 dark:text-navy-400 mb-1.5">
            {locale === 'ja' ? '各ステップを改行で区切ってください' : 'Separate each step with a new line'}
          </p>
          <textarea
            value={form.how_to_ja}
            onChange={e => setForm(f => ({ ...f, how_to_ja: e.target.value }))}
            rows={6}
            placeholder={locale === 'ja'
              ? '足を腰幅に開いて立ちます\n背骨を伸ばします\n...'
              : 'Step 1 in Japanese\nStep 2 in Japanese\n...'}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500 resize-y"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">
            {locale === 'ja' ? 'ステップ手順（英語）' : 'How-to Steps (English)'}
          </label>
          <p className="text-xs text-gray-400 dark:text-navy-400 mb-1.5">
            {locale === 'ja' ? '各ステップを改行で区切ってください' : 'Separate each step with a new line'}
          </p>
          <textarea
            value={form.how_to_en}
            onChange={e => setForm(f => ({ ...f, how_to_en: e.target.value }))}
            rows={6}
            placeholder={locale === 'ja'
              ? 'Stand with feet hip-width apart\nElongate your spine\n...'
              : 'Stand with feet hip-width apart\nElongate your spine\n...'}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500 resize-y"
          />
        </div>
      </div>

      {/* Published Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-navy-400 focus:ring-offset-2 dark:focus:ring-offset-navy-900 ${
            form.is_published ? 'bg-sage-500' : 'bg-gray-300 dark:bg-navy-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
              form.is_published ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {form.is_published
            ? (locale === 'ja' ? '公開中' : 'Published')
            : (locale === 'ja' ? '下書き（非公開）' : 'Draft (not published)')}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={saving}
          className="bg-navy-600 hover:bg-navy-700 text-white px-6"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {locale === 'ja' ? '保存中...' : 'Saving...'}
            </span>
          ) : (
            mode === 'create'
              ? (locale === 'ja' ? 'ポーズを作成' : 'Create Pose')
              : (locale === 'ja' ? '変更を保存' : 'Save Changes')
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/wellness')}
          className="border-gray-200 dark:border-navy-600 text-gray-600 dark:text-navy-300"
        >
          {locale === 'ja' ? 'キャンセル' : 'Cancel'}
        </Button>
      </div>
    </form>
  )
}
