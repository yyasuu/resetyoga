'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface ArticleData {
  title_ja: string
  title_en: string
  subtitle_ja: string
  subtitle_en: string
  content_ja: string
  content_en: string
  category: string
  cover_image_url: string
  is_published: boolean
}

interface ArticleEditorProps {
  initialData?: Partial<ArticleData> & { id?: string }
  redirectTo: string
  locale?: string
}

const CATEGORIES = [
  { value: 'ayurveda', labelJa: 'アーユルヴェーダ', labelEn: 'Ayurveda' },
  { value: 'nutrition', labelJa: '食事・栄養', labelEn: 'Nutrition' },
  { value: 'breathing', labelJa: '呼吸法', labelEn: 'Breathing' },
  { value: 'mindfulness', labelJa: 'マインドフルネス', labelEn: 'Mindfulness' },
  { value: 'yoga', labelJa: 'ヨガ理論', labelEn: 'Yoga Theory' },
  { value: 'other', labelJa: 'その他（自由入力）', labelEn: 'Other (custom)' },
]

const PRESET_VALUES = CATEGORIES.filter(c => c.value !== 'other').map(c => c.value)

export function ArticleEditor({ initialData, redirectTo, locale = 'en' }: ArticleEditorProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'ja' | 'en'>('ja')

  const initCategory = initialData?.category ?? 'ayurveda'
  const initIsPreset = PRESET_VALUES.includes(initCategory)

  const [form, setForm] = useState<ArticleData>({
    title_ja: initialData?.title_ja ?? '',
    title_en: initialData?.title_en ?? '',
    subtitle_ja: initialData?.subtitle_ja ?? '',
    subtitle_en: initialData?.subtitle_en ?? '',
    content_ja: initialData?.content_ja ?? '',
    content_en: initialData?.content_en ?? '',
    category: initIsPreset ? initCategory : 'other',
    cover_image_url: initialData?.cover_image_url ?? '',
    is_published: initialData?.is_published ?? false,
  })
  const [customCategory, setCustomCategory] = useState(initIsPreset ? '' : initCategory)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isEdit = !!initialData?.id

  const handleSubmit = async (publish: boolean) => {
    if (!form.title_ja || !form.title_en) {
      setError(locale === 'ja' ? 'タイトル（日英）は必須です' : 'Title in both languages is required')
      return
    }
    if (form.category === 'other' && !customCategory.trim()) {
      setError(locale === 'ja' ? 'カテゴリ名を入力してください' : 'Please enter a custom category name')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        category: form.category === 'other' ? customCategory.trim() : form.category,
        is_published: publish,
      }
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/wellness/articles/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/wellness/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      router.push(redirectTo)
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Language Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-navy-700 rounded-lg w-fit">
        <button
          onClick={() => setTab('ja')}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            tab === 'ja'
              ? 'bg-white dark:bg-navy-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-navy-300'
          }`}
        >
          日本語
        </button>
        <button
          onClick={() => setTab('en')}
          className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
            tab === 'en'
              ? 'bg-white dark:bg-navy-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-navy-300'
          }`}
        >
          English
        </button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {locale === 'ja' ? 'カテゴリ' : 'Category'}
        </label>
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>
              {locale === 'ja' ? c.labelJa : c.labelEn}
            </option>
          ))}
        </select>

        {/* Custom category input */}
        {form.category === 'other' && (
          <input
            value={customCategory}
            onChange={e => setCustomCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400"
            placeholder={locale === 'ja' ? 'カテゴリ名を入力（例：ライフスタイル）' : 'Enter category name (e.g. Lifestyle)'}
          />
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {tab === 'ja' ? 'タイトル（日本語）' : 'Title (English)'}
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          value={tab === 'ja' ? form.title_ja : form.title_en}
          onChange={e =>
            tab === 'ja'
              ? setForm({ ...form, title_ja: e.target.value })
              : setForm({ ...form, title_en: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder={tab === 'ja' ? '例：体質（ドーシャ）とヨガスタイルの選び方' : 'e.g. Finding Your Yoga Style by Dosha Type'}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {tab === 'ja' ? 'サブタイトル（日本語）' : 'Subtitle (English)'}
          <span className="text-xs text-gray-400 dark:text-navy-400 ml-2">
            {locale === 'ja' ? '任意' : 'optional'}
          </span>
        </label>
        <input
          value={tab === 'ja' ? form.subtitle_ja : form.subtitle_en}
          onChange={e =>
            tab === 'ja'
              ? setForm({ ...form, subtitle_ja: e.target.value })
              : setForm({ ...form, subtitle_en: e.target.value })
          }
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder={tab === 'ja' ? '例：自分に合ったスタイルを見つけるための第一歩' : 'e.g. The first step to finding your perfect practice'}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {tab === 'ja' ? '本文（日本語）' : 'Content (English)'}
        </label>
        <textarea
          value={tab === 'ja' ? form.content_ja : form.content_en}
          onChange={e =>
            tab === 'ja'
              ? setForm({ ...form, content_ja: e.target.value })
              : setForm({ ...form, content_en: e.target.value })
          }
          rows={14}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-sage-400 resize-y"
          placeholder={tab === 'ja' ? 'コラムの本文を入力してください...' : 'Write your article content here...'}
        />
        <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">
          {tab === 'ja' ? form.content_ja.length : form.content_en.length} {locale === 'ja' ? '文字' : 'characters'}
        </p>
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {locale === 'ja' ? 'カバー画像URL（任意）' : 'Cover Image URL (optional)'}
        </label>
        <input
          value={form.cover_image_url}
          onChange={e => setForm({ ...form, cover_image_url: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sage-400"
          placeholder="https://..."
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={() => handleSubmit(true)}
          disabled={saving}
          className="bg-navy-600 hover:bg-navy-700 text-white"
        >
          {saving ? (locale === 'ja' ? '保存中...' : 'Saving...') : (locale === 'ja' ? '公開する' : 'Publish')}
        </Button>
        <Button
          onClick={() => handleSubmit(false)}
          disabled={saving}
          variant="outline"
          className="dark:border-navy-600 dark:text-gray-200"
        >
          {locale === 'ja' ? '下書き保存' : 'Save Draft'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-gray-500 dark:text-navy-300"
        >
          {locale === 'ja' ? 'キャンセル' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}
