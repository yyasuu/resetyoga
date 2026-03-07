'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Users, FileText, Mail } from 'lucide-react'

const TIERS = [
  { id: 'tier1', name: 'Tier 1 一般' },
  { id: 'tier2', name: 'Tier 2 認定' },
  { id: 'tier3', name: 'Tier 3 希少' },
  { id: 'tier4', name: 'Tier 4 1on1' },
]

const STATUS_BADGE: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  draft:    'bg-gray-100 text-gray-500',
}

interface Props {
  tierApps: any[]
  classSubmissions: any[]
  waitlist: any[]
  locale: string
}

export function PremiumAdminTabs({ tierApps, classSubmissions, waitlist, locale }: Props) {
  const [tab, setTab] = useState<'tier' | 'class' | 'waitlist'>('tier')
  const [loading, setLoading] = useState<string | null>(null)
  const [note, setNote] = useState<Record<string, string>>({})
  const [approvedTier, setApprovedTier] = useState<Record<string, string>>({})
  const [localApps, setLocalApps] = useState(tierApps)
  const [localClasses, setLocalClasses] = useState(classSubmissions)

  const reviewTier = async (id: string, action: 'approve' | 'reject') => {
    setLoading(id + action)
    try {
      const res = await fetch('/api/admin/premium/review-tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, approved_tier: approvedTier[id], note: note[id] }),
      })
      if (res.ok) {
        setLocalApps((prev) => prev.map((a) => a.id === id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a))
      }
    } finally {
      setLoading(null)
    }
  }

  const reviewClass = async (id: string, action: 'approve' | 'reject') => {
    setLoading(id + action)
    try {
      const res = await fetch('/api/admin/premium/review-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, note: note[id] }),
      })
      if (res.ok) {
        setLocalClasses((prev) => prev.map((c) => c.id === id ? { ...c, status: action === 'approve' ? 'approved' : 'rejected' } : c))
      }
    } finally {
      setLoading(null)
    }
  }

  const tabs = [
    { key: 'tier',     label: `Tier審査 (${localApps.filter((a) => a.status === 'pending').length})`,   Icon: Users },
    { key: 'class',    label: `クラス承認 (${localClasses.filter((c) => c.status === 'pending').length})`, Icon: FileText },
    { key: 'waitlist', label: `待機リスト (${waitlist.length})`,                                          Icon: Mail },
  ] as const

  return (
    <div>
      {/* Tab headers */}
      <div className="flex gap-1 mb-6 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl p-1 w-fit">
        {tabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-navy-600 text-white'
                : 'text-gray-500 dark:text-gray-300 hover:text-navy-600 dark:hover:text-sage-400'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tier Applications ── */}
      {tab === 'tier' && (
        <div className="space-y-4">
          {localApps.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">申請はまだありません</div>
          )}
          {localApps.map((app) => (
            <div key={app.id} className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[app.status]}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(app.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="font-bold text-navy-800 dark:text-white">{(app.profiles as any)?.full_name || (app.profiles as any)?.email}</p>
                  <p className="text-sm text-gray-500 dark:text-navy-300 mt-0.5">提案Tier: <strong>{app.proposed_tier}</strong></p>
                  {app.proposal_reason && (
                    <p className="text-sm text-gray-600 dark:text-navy-200 mt-2 bg-gray-50 dark:bg-navy-700 rounded-lg p-3">{app.proposal_reason}</p>
                  )}
                  {app.bio_premium_ja && (
                    <p className="text-xs text-gray-500 dark:text-navy-300 mt-2 line-clamp-3">{app.bio_premium_ja}</p>
                  )}
                  {app.categories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(app.categories as string[]).map((c) => (
                        <span key={c} className="text-xs bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400 px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {app.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
                  <div className="flex flex-wrap items-end gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">承認Tier</label>
                      <select
                        value={approvedTier[app.id] ?? app.proposed_tier}
                        onChange={(e) => setApprovedTier((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        className="text-sm border border-gray-200 dark:border-navy-600 rounded-lg px-2 py-1.5 bg-white dark:bg-navy-700 dark:text-white"
                      >
                        {TIERS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs text-gray-400 mb-1 block">管理コメント（任意）</label>
                      <input
                        value={note[app.id] ?? ''}
                        onChange={(e) => setNote((prev) => ({ ...prev, [app.id]: e.target.value }))}
                        placeholder="承認・却下の理由など"
                        className="w-full text-sm border border-gray-200 dark:border-navy-600 rounded-lg px-3 py-1.5 bg-white dark:bg-navy-700 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewTier(app.id, 'approve')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> 承認
                      </button>
                      <button
                        onClick={() => reviewTier(app.id, 'reject')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> 却下
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Class Submissions ── */}
      {tab === 'class' && (
        <div className="space-y-4">
          {localClasses.length === 0 && (
            <div className="text-center text-gray-400 py-10 text-sm">提出されたクラスはありません</div>
          )}
          {localClasses.map((cls) => (
            <div key={cls.id} className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[cls.status]}`}>{cls.status}</span>
                    <span className="text-xs bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-200 px-2 py-0.5 rounded-full">{cls.class_type}</span>
                    <span className="text-xs bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400 px-2 py-0.5 rounded-full">{cls.theme}</span>
                    <span className="text-xs text-gray-400">{new Date(cls.created_at).toLocaleDateString('ja-JP')}</span>
                  </div>
                  <p className="font-bold text-navy-800 dark:text-white">{cls.title_ja}</p>
                  <p className="text-sm text-gray-500 dark:text-navy-300 mt-0.5">
                    講師: {(cls.profiles as any)?.full_name}　Tier: {cls.tier_id}　提案価格: ¥{cls.proposed_price_jpy?.toLocaleString()}
                  </p>
                  {cls.description_ja && (
                    <p className="text-sm text-gray-500 dark:text-navy-300 mt-2 line-clamp-3">{cls.description_ja}</p>
                  )}
                  {cls.price_proposal_reason && (
                    <p className="text-xs text-gray-400 mt-1 italic">価格理由: {cls.price_proposal_reason}</p>
                  )}
                </div>
              </div>

              {cls.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
                  <div className="flex flex-wrap items-end gap-3">
                    <div className="flex-1 min-w-[180px]">
                      <label className="text-xs text-gray-400 mb-1 block">管理コメント（却下時は必須）</label>
                      <input
                        value={note[cls.id] ?? ''}
                        onChange={(e) => setNote((prev) => ({ ...prev, [cls.id]: e.target.value }))}
                        placeholder="修正点・却下理由など"
                        className="w-full text-sm border border-gray-200 dark:border-navy-600 rounded-lg px-3 py-1.5 bg-white dark:bg-navy-700 dark:text-white"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewClass(cls.id, 'approve')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" /> 承認
                      </button>
                      <button
                        onClick={() => reviewClass(cls.id, 'reject')}
                        disabled={!!loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> 却下
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Waitlist ── */}
      {tab === 'waitlist' && (
        <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-2xl overflow-hidden">
          {waitlist.length === 0 ? (
            <div className="text-center text-gray-400 py-10 text-sm">待機リストは空です</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-navy-700">
                <tr>
                  {['メール', 'お名前', '主なお悩み', '言語', '登録日'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                {waitlist.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/50">
                    <td className="px-4 py-3 text-navy-700 dark:text-gray-200 font-medium">{w.email}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-navy-300">{w.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-navy-300">{w.concern ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{w.locale ?? 'ja'}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(w.created_at).toLocaleDateString('ja-JP')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
