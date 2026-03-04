'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Eye, EyeOff, Play } from 'lucide-react'

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
  is_published: boolean
  created_at: string
}

const CATEGORIES = [
  { value: 'meditation', label: '瞑想 / Meditation' },
  { value: 'breathwork', label: '呼吸法 / Breathwork' },
  { value: 'morning', label: '朝のルーティン / Morning' },
  { value: 'evening', label: '夜のリラックス / Evening' },
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
  is_published: false,
}

export function VideoManager({ initialVideos }: { initialVideos: WellnessVideo[] }) {
  const [videos, setVideos] = useState<WellnessVideo[]>(initialVideos)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title_ja || !form.title_en || !form.video_url) {
      setError('タイトル（日英）と動画URLは必須です')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/wellness/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setVideos([json.data, ...videos])
      setForm(EMPTY_FORM)
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
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="h-4 w-4" />
          動画を追加
        </Button>
      </div>

      {/* Add Video Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-sage-50 dark:bg-navy-700 rounded-xl border border-sage-200 dark:border-navy-600 space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">新しい動画を追加</h3>

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

          <div>
            <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">動画URL（YouTube / Vimeo / 直接リンク）*</label>
            <input
              value={form.video_url}
              onChange={e => setForm({ ...form, video_url: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">カテゴリ</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
            <div>
              <label className="block text-xs text-gray-500 dark:text-navy-300 mb-1">サムネイルURL（任意）</label>
              <input
                value={form.thumbnail_url}
                onChange={e => setForm({ ...form, thumbnail_url: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-navy-600 bg-white dark:bg-navy-800 text-gray-900 dark:text-white"
                placeholder="https://..."
              />
            </div>
          </div>

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

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <div className="flex gap-2 pt-1">
            <Button type="submit" size="sm" className="bg-navy-600 hover:bg-navy-700 text-white" disabled={saving}>
              {saving ? '保存中...' : '保存'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
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
          {videos.map(video => (
            <div key={video.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-700 rounded-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Play className="h-5 w-5 text-sage-600 dark:text-sage-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{video.title_ja}</p>
                  <p className="text-xs text-gray-400 dark:text-navy-400 truncate">{video.title_en} · {video.category} {video.duration_label ? `· ${video.duration_label}` : ''}</p>
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
          ))}
        </div>
      )}
    </div>
  )
}
