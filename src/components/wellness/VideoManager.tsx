'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Eye, EyeOff, Play, Link2, Upload } from 'lucide-react'
import { CONCERNS } from '@/lib/concerns'

interface WellnessVideo {
  id: string
  title_ja: string
  title_en: string
  description_ja: string | null
  description_en: string | null
  video_url: string
  thumbnail_url: string | null
  duration_label: string | null
  category: string
  concerns: string[]
  movement_type: string | null
  difficulty_level: string | null
  is_published: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'meditation',   label: '瞑想 / Meditation' },
  { value: 'breathwork',   label: '呼吸法 / Breathwork' },
  { value: 'morning',      label: '朝のルーティン / Morning Routine' },
  { value: 'evening',      label: '夜のリラックス / Evening Relax' },
  { value: 'stress',       label: 'ストレス解消 / Stress Relief' },
  { value: 'sleep',        label: '睡眠改善 / Better Sleep' },
  { value: 'shoulder',     label: '肩こり改善 / Shoulder Relief' },
  { value: 'flexibility',  label: '柔軟性UP / Flexibility' },
  { value: 'core',         label: '体幹強化 / Core Strength' },
  { value: 'balance',      label: 'バランス / Balance' },
  { value: 'arm_balance',  label: 'アームバランス / Arm Balance' },
  { value: 'beginner',     label: '初心者向け / Beginner' },
]

const MOVEMENT_TYPES = [
  { value: '',          label: '-- 動き別 / Movement type --' },
  { value: 'flow',      label: 'フロー / Flow' },
  { value: 'static',    label: 'スタティック / Static' },
  { value: 'dynamic',   label: 'ダイナミック / Dynamic' },
  { value: 'breathing', label: '呼吸法 / Breathing' },
  { value: 'meditation',label: '瞑想 / Meditation' },
  { value: 'stretching',label: 'ストレッチ / Stretching' },
]

const DIFFICULTY_LEVELS = [
  { value: '',             label: '-- レベル別 / Level --' },
  { value: 'all_levels',   label: 'すべてのレベル / All Levels' },
  { value: 'beginner',     label: '初心者 / Beginner' },
  { value: 'intermediate', label: '中級者 / Intermediate' },
  { value: 'advanced',     label: '上級者 / Advanced' },
]

const EMPTY_FORM = {
  title_ja: '',
  title_en: '',
  description_ja: '',
  description_en: '',
  video_url: '',
  thumbnail_url: '',
  duration_label: '',
  category: 'meditation',
  concerns: [] as string[],
  movement_type: '',
  difficulty_level: '',
  is_published: false,
}

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo']
const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB

export function VideoManager({ initialVideos }: { initialVideos: WellnessVideo[] }) {
  const [videos, setVideos] = useState<WellnessVideo[]>(initialVideos)
  const [showForm, setShowForm] = useState(false)
  const [inputMode, setInputMode] = useState<'url' | 'file'>('url')
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // File upload state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('MP4 / WebM / MOV / AVI のみ対応しています')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('ファイルサイズは500MB以下にしてください')
      return
    }
    setSelectedFile(file)
    setError('')
    // Auto-fill duration hint from filename if empty
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null
    setUploading(true)
    setUploadProgress(0)
    setError('')

    try {
      // 1. Get signed upload URL
      const urlRes = await fetch(
        `/api/wellness/upload-video-url?filename=${encodeURIComponent(selectedFile.name)}`
      )
      if (!urlRes.ok) {
        const j = await urlRes.json().catch(() => ({}))
        throw new Error(j.error || 'アップロードURLの取得に失敗しました')
      }
      const { signedUrl, publicUrl } = await urlRes.json()

      // 2. Upload directly to Supabase Storage with progress tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100))
          }
        })
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`))
        })
        xhr.addEventListener('error', () => reject(new Error('ネットワークエラーが発生しました')))
        xhr.open('PUT', signedUrl)
        xhr.setRequestHeader('Content-Type', selectedFile.type)
        xhr.send(selectedFile)
      })

      return publicUrl
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_ja || !form.title_en) {
      setError('タイトル（日英）は必須です')
      return
    }

    setSaving(true)
    setError('')

    try {
      let videoUrl = form.video_url

      // File upload mode: upload first then use the public URL
      if (inputMode === 'file') {
        if (!selectedFile) {
          setError('動画ファイルを選択してください')
          setSaving(false)
          return
        }
        const uploaded = await uploadFile()
        if (!uploaded) {
          setSaving(false)
          return
        }
        videoUrl = uploaded
      } else {
        if (!videoUrl) {
          setError('動画URLは必須です')
          setSaving(false)
          return
        }
      }

      const res = await fetch('/api/wellness/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, video_url: videoUrl }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)

      setVideos([json.data, ...videos])
      setForm(EMPTY_FORM)
      setSelectedFile(null)
      setUploadProgress(0)
      setShowForm(false)
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました')
    } finally {
      setSaving(false)
    }
  }

  const togglePublish = async (video: WellnessVideo) => {
    const newState = !video.is_published
    setVideos(videos.map(v => v.id === video.id ? { ...v, is_published: newState } : v))
    await fetch(`/api/wellness/videos/${video.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newState }),
    })
  }

  const deleteVideo = async (id: string) => {
    if (!confirm('この動画を削除しますか？')) return
    setVideos(videos.filter(v => v.id !== id))
    await fetch(`/api/wellness/videos/${id}`, { method: 'DELETE' })
  }

  const toggleConcern = (id: string) => {
    setForm(f => ({
      ...f,
      concerns: f.concerns.includes(id) ? f.concerns.filter(c => c !== id) : [...f.concerns, id],
    }))
  }

  const fileSizeMB = selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(1) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Play className="h-5 w-5 text-sage-500" />
          瞑想ガイド動画 / Meditation Videos
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-navy-400">({videos.length})</span>
        </h2>
        <Button
          size="sm"
          className="bg-sage-500 hover:bg-sage-600 text-white gap-1"
          onClick={() => { setShowForm(!showForm); setError('') }}
        >
          <Plus className="h-4 w-4" />
          動画を追加
        </Button>
      </div>

      {/* Add Video Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-sage-50 dark:bg-navy-700 rounded-xl border border-sage-200 dark:border-navy-600 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">新しい動画を追加</h3>

          {/* Title fields */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">タイトル（日本語）*</label>
              <input
                value={form.title_ja}
                onChange={e => setForm({ ...form, title_ja: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                placeholder="朝のリセット瞑想"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">Title (English)*</label>
              <input
                value={form.title_en}
                onChange={e => setForm({ ...form, title_en: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                placeholder="Morning Reset Meditation"
              />
            </div>
          </div>

          {/* Input mode tabs */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-navy-300 mb-2">動画ソース *</label>
            <div className="flex gap-1 p-1 bg-white dark:bg-navy-800 rounded-lg w-fit border border-gray-200 dark:border-navy-600 mb-3">
              <button
                type="button"
                onClick={() => { setInputMode('url'); setSelectedFile(null); setError('') }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'url'
                    ? 'bg-navy-600 text-white'
                    : 'text-gray-500 dark:text-navy-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <Link2 className="h-3.5 w-3.5" />
                URL入力（YouTube / Vimeo）
              </button>
              <button
                type="button"
                onClick={() => { setInputMode('file'); setError('') }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  inputMode === 'file'
                    ? 'bg-navy-600 text-white'
                    : 'text-gray-500 dark:text-navy-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                ファイルアップロード
              </button>
            </div>

            {inputMode === 'url' ? (
              <input
                value={form.video_url}
                onChange={e => setForm({ ...form, video_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                {selectedFile ? (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-navy-800 rounded-lg border border-gray-200 dark:border-navy-600">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-400 dark:text-navy-400">{fileSizeMB} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                      className="ml-3 text-xs text-red-500 hover:text-red-700 shrink-0"
                    >
                      変更
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-navy-600 bg-white dark:bg-navy-800 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-gray-400 dark:text-navy-400" />
                    <span className="text-sm text-gray-500 dark:text-navy-300">クリックして動画ファイルを選択</span>
                    <span className="text-xs text-gray-400 dark:text-navy-400">MP4 / WebM / MOV · 最大500MB</span>
                  </button>
                )}

                {/* Upload progress */}
                {uploading && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-navy-300 mb-1">
                      <span>アップロード中...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-navy-600 rounded-full h-2">
                      <div
                        className="bg-sage-500 h-2 rounded-full transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Category, Movement, Difficulty, Duration, Thumbnail */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">カテゴリ / Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">動き別 / Movement type</label>
              <select
                value={form.movement_type}
                onChange={e => setForm({ ...form, movement_type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              >
                {MOVEMENT_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">レベル別 / Level</label>
              <select
                value={form.difficulty_level}
                onChange={e => setForm({ ...form, difficulty_level: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              >
                {DIFFICULTY_LEVELS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">時間 (例: 5 min)</label>
              <input
                value={form.duration_label}
                onChange={e => setForm({ ...form, duration_label: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                placeholder="5 min"
              />
            </div>
          </div>

          {/* Concerns chip grid */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-navy-300 mb-2">お悩みタグ / Concern tags（複数選択可）</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {CONCERNS.map(c => {
                const selected = form.concerns.includes(c.id)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConcern(c.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl border text-center transition-all text-xs ${
                      selected
                        ? 'bg-navy-600 border-navy-600 text-white'
                        : 'bg-white dark:bg-navy-800 border-gray-200 dark:border-navy-600 text-gray-600 dark:text-gray-300 hover:border-sage-400 hover:bg-sage-50 dark:hover:bg-navy-700'
                    }`}
                  >
                    <span className="text-base leading-none">{c.icon}</span>
                    <span className="font-medium leading-snug">{c.ja}</span>
                    <span className="text-[10px] opacity-70 leading-snug">{c.en}</span>
                  </button>
                )
              })}
            </div>
            {form.concerns.length > 0 && (
              <p className="text-xs text-sage-600 dark:text-sage-400 mt-1">{form.concerns.length}件選択中</p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">サムネイルURL（任意）</label>
            <input
              value={form.thumbnail_url}
              onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          {/* Descriptions */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">説明（日本語）</label>
              <textarea
                value={form.description_ja}
                onChange={e => setForm({ ...form, description_ja: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">Description (English)</label>
              <textarea
                value={form.description_en}
                onChange={e => setForm({ ...form, description_en: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="publish-video"
              checked={form.is_published}
              onChange={e => setForm({ ...form, is_published: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="publish-video" className="text-sm text-gray-700 dark:text-gray-300">すぐに公開する</label>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              size="sm"
              className="bg-navy-600 hover:bg-navy-700 text-white"
              disabled={saving || uploading}
            >
              {uploading ? `アップロード中 ${uploadProgress}%` : saving ? '保存中...' : '保存'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setSelectedFile(null); setError('') }}>
              キャンセル
            </Button>
          </div>
        </form>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-navy-400 py-4">動画がまだありません</p>
      ) : (
        <div className="space-y-3">
          {videos.map(video => {
            const isFile = !video.video_url.includes('youtube') && !video.video_url.includes('vimeo')
            return (
              <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-700 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                    {isFile
                      ? <Upload className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                      : <Play className="h-5 w-5 text-sage-600 dark:text-sage-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{video.title_ja}</p>
                    <p className="text-xs text-gray-400 dark:text-navy-400 truncate">
                      {video.title_en} · {video.category}
                      {video.duration_label ? ` · ${video.duration_label}` : ''}
                      {isFile && <span className="ml-1 text-sage-500 dark:text-sage-400">· ファイル</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    video.is_published
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-navy-600 text-gray-500 dark:text-navy-300'
                  }`}>
                    {video.is_published ? '公開中' : '下書き'}
                  </span>
                  <button
                    onClick={() => togglePublish(video)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-600 text-gray-500 dark:text-navy-300"
                    title={video.is_published ? '非公開にする' : '公開する'}
                  >
                    {video.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => deleteVideo(video.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
