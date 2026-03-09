'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Lock, Globe2 } from 'lucide-react'
import { RichTextEditor } from './RichTextEditor'
import { CONCERNS } from '@/lib/concerns'
import { ARTICLE_PRESETS } from '@/lib/article-presets'

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
  concerns: string[]
  movement_type: string[]
  difficulty_level: string
  access_level: string  // 'public' | 'member' | 'premium'
  is_published: boolean
  is_premium: boolean   // derived from access_level for backward compat
}

interface ArticleEditorProps {
  initialData?: Partial<ArticleData> & { id?: string }
  redirectTo: string
  locale?: string
}

const MOVEMENT_TYPES = [
  { value: 'flow',       labelJa: 'フロー',       labelEn: 'Flow' },
  { value: 'static',     labelJa: 'スタティック',  labelEn: 'Static' },
  { value: 'dynamic',    labelJa: 'ダイナミック',  labelEn: 'Dynamic' },
  { value: 'breathing',  labelJa: '呼吸法',       labelEn: 'Breathing' },
  { value: 'meditation', labelJa: '瞑想',         labelEn: 'Meditation' },
  { value: 'stretching', labelJa: 'ストレッチ',    labelEn: 'Stretching' },
]

const DIFFICULTY_LEVELS = [
  { value: '',             labelJa: '-- レベル別 --',       labelEn: '-- Level --' },
  { value: 'all_levels',   labelJa: 'すべてのレベル',        labelEn: 'All Levels' },
  { value: 'beginner',     labelJa: '初心者',               labelEn: 'Beginner' },
  { value: 'intermediate', labelJa: '中級者',               labelEn: 'Intermediate' },
  { value: 'advanced',     labelJa: '上級者',               labelEn: 'Advanced' },
]

export function ArticleEditor({ initialData, redirectTo, locale = 'en' }: ArticleEditorProps) {
  const router = useRouter()
  const [tab, setTab] = useState<'ja' | 'en'>('ja')
  const [showPresets, setShowPresets] = useState(!initialData?.id)
  const [presetFilter, setPresetFilter] = useState<string | null>(null)
  const [appliedPresetId, setAppliedPresetId] = useState<string | null>(null)

  // Derive initial access_level from existing data
  const initAccessLevel = (() => {
    const al = (initialData as any)?.access_level
    if (al === 'public' || al === 'member' || al === 'premium') return al
    return (initialData as any)?.is_premium ? 'premium' : 'public'
  })()

  const [form, setForm] = useState<ArticleData>({
    title_ja: initialData?.title_ja ?? '',
    title_en: initialData?.title_en ?? '',
    subtitle_ja: initialData?.subtitle_ja ?? '',
    subtitle_en: initialData?.subtitle_en ?? '',
    content_ja: initialData?.content_ja ?? '',
    content_en: initialData?.content_en ?? '',
    category: 'other',
    cover_image_url: initialData?.cover_image_url ?? '',
    image_urls: initialData?.image_urls ?? [],
    concerns: (initialData as any)?.concerns ?? [],
    movement_type: (initialData as any)?.movement_type ?? [],
    difficulty_level: (initialData as any)?.difficulty_level ?? '',
    access_level: initAccessLevel,
    is_published: initialData?.is_published ?? false,
    is_premium: initAccessLevel === 'premium',
  })
  const [uploading, setUploading] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fileInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const isEdit = !!initialData?.id

  // Apply a preset: fill titles and auto-check concerns
  const applyPreset = (presetId: string) => {
    const preset = ARTICLE_PRESETS.find(p => p.id === presetId)
    if (!preset) return
    setForm(prev => ({
      ...prev,
      title_ja: preset.title_ja,
      title_en: preset.title_en,
      concerns: preset.concerns,
    }))
    setAppliedPresetId(presetId)
    setShowPresets(false)
  }

  const toggleConcern = (id: string) => {
    const current = form.concerns
    const next = current.includes(id) ? current.filter(c => c !== id) : [...current, id]
    setForm({ ...form, concerns: next })
  }

  const toggleMovementType = (val: string) => {
    const next = form.movement_type.includes(val)
      ? form.movement_type.filter(m => m !== val)
      : [...form.movement_type, val]
    setForm({ ...form, movement_type: next })
  }

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
      while (newImages.length > 0 && !newImages[newImages.length - 1]) newImages.pop()
      setForm({ ...form, image_urls: newImages })
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました')
    } finally {
      setUploading(null)
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
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        category: 'other',
        access_level: form.access_level,
        is_premium: form.access_level === 'premium',
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

  const filteredPresets = presetFilter
    ? ARTICLE_PRESETS.filter(p => p.concerns.includes(presetFilter))
    : ARTICLE_PRESETS

  return (
    <div className="space-y-6">

      {/* ── Preset picker ─────────────────────────────────── */}
      <div className="border border-sage-200 dark:border-navy-600 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-sage-50 dark:bg-navy-800 text-left"
        >
          <div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              {locale === 'ja' ? 'テンプレートから選ぶ' : 'Choose from a template'}
            </span>
            {appliedPresetId && !showPresets && (
              <span className="ml-2 text-xs text-sage-600 dark:text-sage-400 font-medium">
                <CheckCircle2 className="inline h-3.5 w-3.5 mr-0.5 -mt-0.5" />
                {locale === 'ja' ? '適用済み' : 'Applied'}
              </span>
            )}
            <p className="text-xs text-gray-400 dark:text-navy-400 mt-0.5">
              {locale === 'ja'
                ? 'タイトルを選ぶとお悩みタグが自動で入力されます'
                : 'Select a title to auto-fill concern tags'}
            </p>
          </div>
          {showPresets
            ? <ChevronUp className="h-4 w-4 text-gray-400 shrink-0" />
            : <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />}
        </button>

        {showPresets && (
          <div className="p-5 space-y-4 bg-white dark:bg-navy-900/40">
            {/* Concern filter chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPresetFilter(null)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  !presetFilter
                    ? 'bg-navy-600 text-white border-navy-600'
                    : 'bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400'
                }`}
              >
                {locale === 'ja' ? 'すべて' : 'All'}
              </button>
              {CONCERNS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPresetFilter(presetFilter === c.id ? null : c.id)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    presetFilter === c.id
                      ? 'bg-navy-600 text-white border-navy-600'
                      : 'bg-white dark:bg-navy-800 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-navy-600 hover:border-sage-400'
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{locale === 'ja' ? c.ja : c.en}</span>
                </button>
              ))}
            </div>

            {/* Preset list */}
            <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredPresets.map(p => {
                const isApplied = appliedPresetId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className={`text-left px-4 py-3 rounded-xl border transition-all ${
                      isApplied
                        ? 'bg-navy-50 dark:bg-navy-700 border-navy-300 dark:border-navy-500'
                        : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-600 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug mb-1.5">
                      {locale === 'ja' ? p.title_ja : p.title_en}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {p.concerns.map(cid => {
                        const concern = CONCERNS.find(c => c.id === cid)
                        return concern ? (
                          <span key={cid} className="text-[10px] bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 px-1.5 py-0.5 rounded-full">
                            {concern.icon} {locale === 'ja' ? concern.ja : concern.en}
                          </span>
                        ) : null
                      })}
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-gray-400 dark:text-navy-400">
              {locale === 'ja'
                ? '選択後もタイトルやタグは自由に編集できます'
                : 'You can freely edit the title and tags after selecting'}
            </p>
          </div>
        )}
      </div>

      {/* ── Language Tabs ─────────────────────────────────── */}
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

      {/* ── Concern tags ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {locale === 'ja' ? 'お悩みタグ' : 'Concern tags'}
          <span className="text-xs text-gray-400 dark:text-navy-400 ml-2">
            {locale === 'ja' ? '複数選択可・公開前に確認してください' : 'Multiple allowed · review before publishing'}
          </span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {CONCERNS.map(c => {
            const selected = form.concerns.includes(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleConcern(c.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border text-center transition-all duration-150 text-xs ${
                  selected
                    ? 'bg-navy-600 border-navy-600 text-white shadow-sm ring-2 ring-navy-300 dark:ring-navy-500'
                    : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
                }`}
              >
                <span className="text-base leading-none">{c.icon}</span>
                <span className="font-medium leading-snug">{locale === 'ja' ? c.ja : c.en}</span>
              </button>
            )
          })}
        </div>
        {form.concerns.length > 0 && (
          <p className="text-xs text-sage-600 dark:text-sage-400">
            {locale === 'ja'
              ? `${form.concerns.length}件のお悩みタグが設定されています`
              : `${form.concerns.length} concern tag${form.concerns.length > 1 ? 's' : ''} selected`}
          </p>
        )}
      </div>

      {/* ── Movement type + Difficulty level ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {locale === 'ja' ? '動き別' : 'Movement type'}
            <span className="text-xs text-gray-400 dark:text-navy-400 ml-2">
              {locale === 'ja' ? '複数選択可・任意' : 'multiple allowed · optional'}
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOVEMENT_TYPES.map(m => {
              const selected = form.movement_type.includes(m.value)
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => toggleMovementType(m.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    selected
                      ? 'bg-navy-600 border-navy-600 text-white'
                      : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
                  }`}
                >
                  {locale === 'ja' ? m.labelJa : m.labelEn}
                </button>
              )
            })}
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {locale === 'ja' ? 'レベル別' : 'Level'}
            <span className="text-xs text-gray-400 dark:text-navy-400 ml-2">
              {locale === 'ja' ? '任意' : 'optional'}
            </span>
          </label>
          <select
            value={form.difficulty_level}
            onChange={e => setForm({ ...form, difficulty_level: e.target.value })}
            className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
          >
            {DIFFICULTY_LEVELS.map(d => (
              <option key={d.value} value={d.value}>
                {locale === 'ja' ? d.labelJa : d.labelEn}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Title ─────────────────────────────────── */}
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

      {/* ── Subtitle ─────────────────────────────────── */}
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

      {/* ── Images ─────────────────────────────────── */}
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
                <input
                  ref={fileInputRefs[i]}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => handleImageUpload(e, i)}
                />
                {url ? (
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-navy-600 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
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

      {/* ── Content ─────────────────────────────────── */}
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

      {/* ── Access tier ─────────────────────────────────── */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {locale === 'ja' ? 'アクセス設定' : 'Access Setting'}
        </label>
        <div className="flex flex-col gap-2">
          {/* Public */}
          <button
            type="button"
            onClick={() => setForm({ ...form, access_level: 'public', is_premium: false })}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              form.access_level === 'public'
                ? 'border-navy-500 bg-navy-50 dark:bg-navy-900/30'
                : 'border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 hover:border-navy-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              form.access_level === 'public'
                ? 'border-navy-500 bg-navy-500'
                : 'border-gray-300 dark:border-navy-500'
            }`}>
              {form.access_level === 'public' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[2px]" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Globe2 className="h-3.5 w-3.5 text-navy-500" />
                {locale === 'ja' ? '全体公開' : 'Public'}
              </p>
              <p className="text-xs text-gray-400 dark:text-navy-400">
                {locale === 'ja' ? 'ゲスト含む全員が閲覧できます' : 'Anyone can read, no login required'}
              </p>
            </div>
          </button>

          {/* Member only */}
          <button
            type="button"
            onClick={() => setForm({ ...form, access_level: 'member', is_premium: false })}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              form.access_level === 'member'
                ? 'border-sage-500 bg-sage-50 dark:bg-sage-900/20'
                : 'border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 hover:border-sage-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              form.access_level === 'member'
                ? 'border-sage-500 bg-sage-500'
                : 'border-gray-300 dark:border-navy-500'
            }`}>
              {form.access_level === 'member' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[2px]" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-sage-500" />
                {locale === 'ja' ? '無料会員限定' : 'Members Only'}
              </p>
              <p className="text-xs text-gray-400 dark:text-navy-400">
                {locale === 'ja' ? '無料登録したユーザーのみ閲覧できます' : 'Free registered members only'}
              </p>
            </div>
          </button>

          {/* Premium */}
          <button
            type="button"
            onClick={() => setForm({ ...form, access_level: 'premium', is_premium: true })}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left ${
              form.access_level === 'premium'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 hover:border-amber-300'
            }`}
          >
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              form.access_level === 'premium'
                ? 'border-amber-500 bg-amber-500'
                : 'border-gray-300 dark:border-navy-500'
            }`}>
              {form.access_level === 'premium' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-[2px]" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                {locale === 'ja' ? 'プレミアム限定' : 'Premium Only'}
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">
                  $19.99/mo
                </span>
              </p>
              <p className="text-xs text-gray-400 dark:text-navy-400">
                {locale === 'ja' ? '有料サブスク会員のみ閲覧できます' : 'Paid subscribers only ($19.99/month)'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      {/* ── Actions ─────────────────────────────────── */}
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
