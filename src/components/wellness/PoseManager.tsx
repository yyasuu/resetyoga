'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Layers, Edit, Trash2, Eye, EyeOff, Plus, Sparkles,
  Lock, Globe2, ClipboardList, CheckCircle, AlertCircle,
} from 'lucide-react'
import { POSE_FAMILIES, DIFFICULTY_LEVELS, YogaPose } from '@/lib/poses'
import { CONCERNS } from '@/lib/concerns'

interface PoseManagerProps {
  initialPoses: YogaPose[]
  locale: string
}

export function PoseManager({ initialPoses, locale }: PoseManagerProps) {
  const [poses, setPoses] = useState<YogaPose[]>(initialPoses)
  const [activeTab, setActiveTab] = useState<'list' | 'bulk'>('list')

  // Bulk import state
  const [tsvText, setTsvText] = useState('')
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'previewing' | 'importing' | 'done' | 'error'>('idle')
  const [importCount, setImportCount] = useState(0)
  const [importErrors, setImportErrors] = useState<string[]>([])

  const togglePublish = async (pose: YogaPose) => {
    const newState = !pose.is_published
    setPoses(poses.map(p => p.id === pose.id ? { ...p, is_published: newState } : p))
    await fetch(`/api/admin/poses/${pose.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: newState }),
    })
  }

  const deletePose = async (id: string) => {
    if (!confirm(locale === 'ja' ? 'このポーズを削除しますか？' : 'Delete this pose?')) return
    setPoses(poses.filter(p => p.id !== id))
    await fetch(`/api/admin/poses/${id}`, { method: 'DELETE' })
  }

  const parseTSV = () => {
    const lines = tsvText.trim().split('\n').filter(l => l.trim())
    if (lines.length === 0) return

    const rows: Record<string, string>[] = []
    for (const line of lines) {
      const cols = line.split('\t')
      rows.push({
        name_sanskrit:  cols[0]?.trim() ?? '',
        name_en:        cols[1]?.trim() ?? '',
        name_ja:        cols[2]?.trim() ?? '',
        description_ja: cols[3]?.trim() ?? '',
        description_en: cols[4]?.trim() ?? '',
        how_to_ja:      cols[5]?.trim() ?? '',
        how_to_en:      cols[6]?.trim() ?? '',
        pose_family:    cols[7]?.trim() ?? '',
        difficulty:     cols[8]?.trim() ?? 'beginner',
        access_level:   cols[9]?.trim() ?? 'public',
        concerns:       cols[10]?.trim() ?? '',
      })
    }
    setPreviewRows(rows)
    setBulkStatus('previewing')
  }

  const importRows = async () => {
    setBulkStatus('importing')
    setImportErrors([])
    let successCount = 0
    const errors: string[] = []

    for (let i = 0; i < previewRows.length; i++) {
      const row = previewRows[i]
      if (!row.name_sanskrit || !row.name_en || !row.name_ja) {
        errors.push(`Row ${i + 1}: Missing required name fields`)
        continue
      }

      const concernIds = row.concerns
        ? row.concerns.split(',').map(s => s.trim()).filter(Boolean)
        : []

      try {
        const res = await fetch('/api/admin/poses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name_sanskrit:  row.name_sanskrit,
            name_en:        row.name_en,
            name_ja:        row.name_ja,
            description_ja: row.description_ja || null,
            description_en: row.description_en || null,
            how_to_ja:      row.how_to_ja || null,
            how_to_en:      row.how_to_en || null,
            pose_family:    row.pose_family || null,
            difficulty:     row.difficulty || 'beginner',
            access_level:   row.access_level || 'public',
            concerns:       concernIds,
            is_published:   false,
          }),
        })
        if (res.ok) {
          const newPose = await res.json()
          setPoses(prev => [...prev, newPose])
          successCount++
        } else {
          const err = await res.json()
          errors.push(`Row ${i + 1}: ${err.error ?? 'Unknown error'}`)
        }
      } catch (e) {
        errors.push(`Row ${i + 1}: Network error`)
      }
    }

    setImportCount(successCount)
    setImportErrors(errors)
    setBulkStatus('done')
    if (successCount > 0) {
      setTsvText('')
      setPreviewRows([])
    }
  }

  const getDifficultyLabel = (val: string | null) => {
    const d = DIFFICULTY_LEVELS.find(d => d.value === val)
    return d ? (locale === 'ja' ? d.ja : d.en) : val ?? ''
  }

  const getFamilyLabel = (val: string | null) => {
    const f = POSE_FAMILIES.find(f => f.value === val)
    return f ? (locale === 'ja' ? f.ja : f.en) : val ?? ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Layers className="h-5 w-5 text-navy-500 dark:text-navy-400" />
          {locale === 'ja' ? 'ヨガポーズライブラリ' : 'Yoga Pose Library'}
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-navy-400">({poses.length})</span>
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200 dark:border-navy-700">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'list'
              ? 'border-navy-600 text-navy-700 dark:text-white dark:border-sage-400'
              : 'border-transparent text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {locale === 'ja' ? 'ポーズ一覧' : 'Pose List'}
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px flex items-center gap-1.5 ${
            activeTab === 'bulk'
              ? 'border-navy-600 text-navy-700 dark:text-white dark:border-sage-400'
              : 'border-transparent text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {locale === 'ja' ? 'スプレッドシート入力' : 'Spreadsheet Import'}
        </button>
      </div>

      {/* Tab 1 — Pose List */}
      {activeTab === 'list' && (
        <div>
          <div className="flex justify-end mb-4">
            <Link href="/admin/poses/new">
              <Button size="sm" className="bg-navy-600 hover:bg-navy-700 text-white gap-1">
                <Plus className="h-4 w-4" />
                {locale === 'ja' ? '新規ポーズを追加' : 'Add New Pose'}
              </Button>
            </Link>
          </div>

          {poses.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-navy-400 py-6 text-center">
              {locale === 'ja' ? 'ポーズがまだありません。追加してください。' : 'No poses yet. Add your first pose.'}
            </p>
          ) : (
            <div className="space-y-2">
              {poses.map(pose => (
                <div
                  key={pose.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-navy-700 rounded-xl gap-3"
                >
                  {/* Thumbnail — click to edit */}
                  <Link href={`/admin/poses/${pose.id}/edit`} className="w-10 h-10 rounded-lg overflow-hidden bg-linen-100 dark:bg-navy-600 flex items-center justify-center flex-shrink-0 hover:ring-2 hover:ring-navy-400 dark:hover:ring-sage-400 transition-all flex-shrink-0">
                    {pose.image_url
                      ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={pose.image_url}
                          alt={pose.name_en}
                          className="w-full h-full object-cover"
                        />
                      )
                      : (
                        <span className="text-lg">🧘</span>
                      )}
                  </Link>

                  {/* Names */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-sage-600 dark:text-sage-400 font-medium truncate">{pose.name_sanskrit}</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {pose.name_en} <span className="text-gray-400 font-normal">/ {pose.name_ja}</span>
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                    {pose.pose_family && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-linen-100 dark:bg-navy-600 text-navy-600 dark:text-navy-300 border border-linen-200 dark:border-navy-500">
                        {getFamilyLabel(pose.pose_family)}
                      </span>
                    )}
                    {pose.difficulty && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                        pose.difficulty === 'advanced'
                          ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : pose.difficulty === 'intermediate'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {getDifficultyLabel(pose.difficulty)}
                      </span>
                    )}
                    {(() => {
                      const al = pose.access_level ?? 'public'
                      if (al === 'premium') return (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 inline-flex items-center gap-0.5">
                          <Sparkles className="h-2.5 w-2.5" />
                          {locale === 'ja' ? 'プレミアム' : 'Premium'}
                        </span>
                      )
                      if (al === 'member') return (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 inline-flex items-center gap-0.5">
                          <Lock className="h-2.5 w-2.5" />
                          {locale === 'ja' ? '会員' : 'Members'}
                        </span>
                      )
                      return (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 inline-flex items-center gap-0.5">
                          <Globe2 className="h-2.5 w-2.5" />
                          {locale === 'ja' ? '公開' : 'Public'}
                        </span>
                      )
                    })()}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      pose.is_published
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-navy-600 text-gray-500 dark:text-navy-300'
                    }`}>
                      {pose.is_published
                        ? (locale === 'ja' ? '公開中' : 'Published')
                        : (locale === 'ja' ? '下書き' : 'Draft')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePublish(pose)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-600 text-gray-500 dark:text-navy-300"
                      title={pose.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {pose.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <Link
                      href={`/admin/poses/${pose.id}/edit`}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-600 text-gray-500 dark:text-navy-300 inline-flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => deletePose(pose.id)}
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
      )}

      {/* Tab 2 — Bulk Import */}
      {activeTab === 'bulk' && (
        <div>
          <div className="mb-4 p-4 bg-sage-50 dark:bg-navy-700 rounded-xl border border-sage-200 dark:border-navy-600 text-sm text-gray-600 dark:text-navy-200">
            <p className="font-semibold mb-2">
              {locale === 'ja'
                ? 'Google Sheets / Excel から以下の列順でコピーしてここに貼り付け：'
                : 'Copy from Google Sheets / Excel in this column order and paste below:'}
            </p>
            <p className="text-xs text-gray-500 dark:text-navy-300 leading-relaxed font-mono">
              A: サンスクリット名 | B: 英語名 | C: 日本語名 | D: 説明(日本語) | E: 説明(英語) | F: ステップ手順(日本語、改行区切り) | G: ステップ手順(英語、改行区切り) | H: ポーズファミリー(standing/seated/supine/prone/inversion/balance/backbend/forward_fold/twist/arm_balance) | I: 難易度(beginner/intermediate/advanced) | J: アクセス(public/member/premium) | K: お悩みタグID(カンマ区切り、例: shoulder,stress)
            </p>
          </div>

          <textarea
            value={tsvText}
            onChange={e => { setTsvText(e.target.value); setBulkStatus('idle'); setPreviewRows([]) }}
            className="w-full min-h-40 px-3 py-2 text-sm font-mono border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-800 text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-400 dark:focus:ring-sage-500 resize-y"
            placeholder={locale === 'ja' ? 'スプレッドシートからコピーして貼り付け...' : 'Paste from spreadsheet here...'}
          />

          <div className="flex items-center gap-3 mt-3">
            <Button
              onClick={parseTSV}
              disabled={!tsvText.trim()}
              size="sm"
              variant="outline"
              className="border-navy-300 dark:border-navy-600 text-navy-700 dark:text-navy-200"
            >
              {locale === 'ja' ? 'プレビュー' : 'Preview'}
            </Button>
            {bulkStatus === 'previewing' && previewRows.length > 0 && (
              <Button
                onClick={importRows}
                size="sm"
                className="bg-navy-600 hover:bg-navy-700 text-white"
              >
                {locale === 'ja' ? `確認して登録 (${previewRows.length}件)` : `Confirm & Import (${previewRows.length} rows)`}
              </Button>
            )}
            {bulkStatus === 'importing' && (
              <span className="text-sm text-gray-500 dark:text-navy-300 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-300 border-t-navy-600 rounded-full animate-spin" />
                {locale === 'ja' ? 'インポート中...' : 'Importing...'}
              </span>
            )}
          </div>

          {/* Status messages */}
          {bulkStatus === 'done' && (
            <div className="mt-4 space-y-2">
              {importCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {locale === 'ja' ? `${importCount}件のポーズを登録しました！` : `Successfully imported ${importCount} pose(s)!`}
                </div>
              )}
              {importErrors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {err}
                </div>
              ))}
            </div>
          )}

          {/* Preview table */}
          {bulkStatus === 'previewing' && previewRows.length > 0 && (
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200 dark:border-navy-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-navy-700">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">#</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">Sanskrit</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">EN</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">JA</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">Family</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">Difficulty</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">Access</th>
                    <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-navy-300">Concerns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {previewRows.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-navy-800 hover:bg-gray-50 dark:hover:bg-navy-750">
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 text-sage-700 dark:text-sage-400 font-medium">{row.name_sanskrit}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{row.name_en}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-white">{row.name_ja}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-navy-300">{row.pose_family}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-navy-300">{row.difficulty}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-navy-300">{row.access_level}</td>
                      <td className="px-3 py-2 text-gray-500 dark:text-navy-300">{row.concerns}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
