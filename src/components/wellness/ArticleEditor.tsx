'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'

interface ArticleData {
  title_ja: string
  title_en: string
  subtitle_ja: string
  subtitle_en: string
  content_ja: string
  content_en: string
  category: string
  cover_image_url: string
  image_urls: string[]
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
    image_urls: initialData?.image_urls ?? [],
    is_published: initialData?.is_published ?? false,
  })
  const [customCategory, setCustomCategory] = useState(initIsPreset ? '' : initCategory)
  const [uploading, setUploading] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const isEdit = !!initialData?.id

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(index)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/wellness/upload-image', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      const newImages = [...form.image_urls]
      newImages[index] = json.url
      // Remove trailing empty slots
      while (newImages.length > 0 && !newImages[newImages.length - 1]) {
        newImages.pop()
      }
      setForm({ ...form, image_urls: newImages })
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました')
    } finally {
      setUploading(null)
      // Reset the input so the same file can be re-selected
      if (fileInputRefs[index].current) fileInputRefs[index].current!.value = ''
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...form.image_urls]
    newImages.splice(index, 1)
    setForm({ ...form, image_urls: newImages })
  }

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

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {locale === 'ja' ? '画像（最大3枚）' : 'Images (up to 3)'}
        </label>
        <p className="text-xs text-gray-400 dark:text-navy-400 mb-3">
          {locale === 'ja'
            ? '1枚目はコラム一覧のカードに表示されます。JPG / PNG / WebP、各5MBまで。'
            : '1st image appears in the article cards list. JPG / PNG / WebP, max 5MB each.'}
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map(i => {
            const url = form.image_urls[i]
            const isUploading = uploading === i
            return (
              <div key={i} className="relative">
                {/* Hidden file input */}
                <input
                  ref={fileInputRefs[i]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => handleImageUpload(e, i)}
                />

                {url ? (
                  /* Image preview */
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-navy-600 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRefs[i].current?.click()}
                        className="p-1.5 bg-white/90 rounded-full text-gray-800 hover:bg-white"
                        title={locale === 'ja' ? '変更' : 'Change'}
                      >
                        <Upload className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1.5 bg-white/90 rounded-full text-red-600 hover:bg-white"
                        title={locale === 'ja' ? '削除' : 'Remove'}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 text-[10px] bg-sage-600/90 text-white px-1.5 py-0.5 rounded-full font-medium">
                        {locale === 'ja' ? 'カバー' : 'Cover'}
                      </span>
                    )}
                  </div>
                ) : (
                  /* Upload slot */
                  <button
                    type="button"
                    onClick={() => fileInputRefs[i].current?.click()}
                    disabled={isUploading}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-navy-600 flex flex-col items-center justify-center gap-1.5 text-gray-400 dark:text-navy-400 hover:border-sage-400 hover:text-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-xs">
                          {i === 0
                            ? (locale === 'ja' ? 'カバー画像' : 'Cover image')
                            : `${i + 1}${locale === 'ja' ? '枚目' : ''}`}
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {tab === 'ja' ? '本文（日本語）' : 'Content (English)'}
        </label>
        <RichTextEditor
          key={tab}
          value={tab === 'ja' ? form.content_ja : form.content_en}
          onChange={html =>
            tab === 'ja'
              ? setForm({ ...form, content_ja: html })
              : setForm({ ...form, content_en: html })
          }
          placeholder={tab === 'ja' ? 'コラムの本文を入力してください...' : 'Write your article content here...'}
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
