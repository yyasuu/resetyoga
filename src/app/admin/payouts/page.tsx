'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  DollarSign,
  Clock,
  CheckCircle,
  Building2,
  Zap,
  RefreshCw,
  Settings,
  ArrowLeft,
} from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Profile } from '@/types'

interface PayoutInfo {
  bank_name: string | null
  bank_country: string | null
  swift_code: string | null
  account_number: string | null
  account_holder_name: string | null
  bank_branch: string | null
  account_holder_kana: string | null
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
}

interface PendingPayout {
  instructor_id: string
  name: string
  email: string
  avatar_url: string | null
  session_count: number
  booking_ids: string[]
  payout_rate_usd: number | null
  suggested_amount: number | null
  payout_info: PayoutInfo | null
}

interface PayoutHistoryItem {
  id: string
  instructor_id: string
  session_count: number
  amount_usd: number
  payment_method: string
  payment_reference: string | null
  paid_at: string
  profiles: { full_name: string } | null
}

interface FormState {
  amount: string
  method: 'wise' | 'bank_transfer' | 'other'
  reference: string
  notes: string
  rate: string
}

const METHOD_LABELS: Record<string, string> = {
  stripe: 'Stripe (自動)',
  wise: 'Wise',
  bank_transfer: '銀行振込 / Bank Transfer',
  other: 'その他 / Other',
}

export default function AdminPayoutsPage() {
  const supabase = createClient()
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [pending, setPending] = useState<PendingPayout[]>([])
  const [history, setHistory] = useState<PayoutHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [savingRate, setSavingRate] = useState<string | null>(null)
  const [forms, setForms] = useState<Record<string, FormState>>({})
  const [tab, setTab] = useState<'pending' | 'history'>('pending')

  const loadData = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/admin/payouts')
    if (res.ok) {
      const data = await res.json()
      setPending(data.pending ?? [])
      setHistory(data.history ?? [])
      // Init form state for each instructor
      const initial: Record<string, FormState> = {}
      for (const p of data.pending ?? []) {
        initial[p.instructor_id] = {
          amount: p.suggested_amount != null ? String(p.suggested_amount) : '',
          method: 'wise',
          reference: '',
          notes: '',
          rate: p.payout_rate_usd != null ? String(p.payout_rate_usd) : '',
        }
      }
      setForms(initial)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role !== 'admin') { router.push('/dashboard'); return }
          setProfile(data)
          loadData()
        })
    })
  }, [loadData, router, supabase])

  const updateForm = (instructorId: string, field: keyof FormState, value: string) => {
    setForms(prev => ({
      ...prev,
      [instructorId]: { ...prev[instructorId], [field]: value },
    }))
  }

  const handleSaveRate = async (instructorId: string) => {
    const rate = forms[instructorId]?.rate
    setSavingRate(instructorId)
    const res = await fetch('/api/admin/payouts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor_id: instructorId,
        payout_rate_usd: rate ? parseFloat(rate) : null,
      }),
    })
    if (res.ok) {
      toast.success('Default rate saved')
      // Update suggested amount locally
      const p = pending.find(p => p.instructor_id === instructorId)
      if (p && rate) {
        const suggested = Math.round(parseFloat(rate) * p.session_count * 100) / 100
        updateForm(instructorId, 'amount', String(suggested))
      }
    } else {
      toast.error('Failed to save rate')
    }
    setSavingRate(null)
  }

  const handlePay = async (instructorId: string, bookingIds: string[], useStripe = false) => {
    const form = forms[instructorId]
    if (!form?.amount || parseFloat(form.amount) <= 0) {
      toast.error('金額を入力してください / Please enter an amount')
      return
    }
    setSubmitting(instructorId)
    const res = await fetch('/api/admin/payouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instructor_id: instructorId,
        booking_ids: bookingIds,
        amount_usd: parseFloat(form.amount),
        payment_method: form.method,
        payment_reference: form.reference || null,
        notes: form.notes || null,
        use_stripe: useStripe,
      }),
    })
    if (res.ok) {
      const data = await res.json()
      if (useStripe && data.stripe_transfer_id) {
        toast.success(`Stripe送金完了 / Transfer sent · ${data.stripe_transfer_id}`)
      } else {
        toast.success('Payment recorded!')
      }
      await loadData()
    } else {
      const data = await res.json()
      toast.error(data.error ?? 'Failed to record payment')
    }
    setSubmitting(null)
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-navy-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="text-gray-500 dark:text-navy-400">
              <ArrowLeft className="h-4 w-4 mr-1" /> Admin
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-sage-500" />
            Instructor Payouts
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-200 dark:bg-navy-800 rounded-xl p-1 mb-6 w-fit">
          {(['pending', 'history'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-white dark:bg-navy-700 text-navy-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-navy-400 hover:text-gray-700 dark:hover:text-navy-200'
              }`}
            >
              {t === 'pending' ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Pending
                  {pending.length > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {pending.length}
                    </span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  History
                </span>
              )}
            </button>
          ))}
          <button
            onClick={loadData}
            className="ml-2 px-3 py-2 text-gray-400 dark:text-navy-500 hover:text-gray-600 dark:hover:text-navy-300"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* ── Pending Tab ──────────────────────────────────────────────────────── */}
        {tab === 'pending' && (
          <>
            {loading ? (
              <div className="flex justify-center py-16">
                <RefreshCw className="h-6 w-6 animate-spin text-navy-400" />
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-16 text-center">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-navy-300 font-medium">All caught up! No pending payouts.</p>
                <p className="text-gray-400 dark:text-navy-400 text-sm mt-1">
                  Pending sessions appear here after their scheduled end time.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {pending.map(inst => {
                  const form = forms[inst.instructor_id] ?? {
                    amount: '', method: 'wise', reference: '', notes: '', rate: '',
                  }
                  const isSubmitting = submitting === inst.instructor_id
                  const isSavingRate = savingRate === inst.instructor_id

                  return (
                    <div
                      key={inst.instructor_id}
                      className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden"
                    >
                      {/* Instructor header */}
                      <div className="flex items-center gap-4 px-6 py-4 bg-navy-50 dark:bg-navy-700/50 border-b border-gray-100 dark:border-navy-700">
                        <div className="w-10 h-10 rounded-full bg-navy-200 dark:bg-navy-600 flex items-center justify-center text-navy-700 dark:text-white font-bold text-sm flex-shrink-0">
                          {inst.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white">{inst.name}</p>
                          <p className="text-sm text-gray-500 dark:text-navy-300 truncate">{inst.email}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-2xl font-bold text-navy-700 dark:text-white">{inst.session_count}</p>
                          <p className="text-xs text-gray-500 dark:text-navy-400">sessions</p>
                        </div>
                      </div>

                      <div className="p-6 grid md:grid-cols-2 gap-6">
                        {/* Bank details */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5" /> Bank Details
                          </h3>
                          {inst.payout_info ? (
                            <div className="space-y-1.5 text-sm">
                              <InfoRow label="Country" value={inst.payout_info.bank_country ?? '—'} />
                              <InfoRow label="Bank" value={inst.payout_info.bank_name ?? '—'} />
                              <InfoRow label="SWIFT" value={inst.payout_info.swift_code ?? '—'} />
                              <InfoRow label="Account" value={inst.payout_info.account_number ?? '—'} />
                              <InfoRow label="Holder" value={inst.payout_info.account_holder_name ?? inst.payout_info.account_holder_kana ?? '—'} />
                              {inst.payout_info.bank_branch && (
                                <InfoRow label="Branch" value={inst.payout_info.bank_branch} />
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg px-3 py-2">
                              No bank details registered yet.
                            </p>
                          )}

                          {/* Default rate setting */}
                          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-navy-700">
                            <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <Settings className="h-3.5 w-3.5" /> Default Rate / Session
                            </p>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="e.g. 15.00"
                                  value={form.rate}
                                  onChange={e => updateForm(inst.instructor_id, 'rate', e.target.value)}
                                  className="w-full pl-7 pr-3 py-2 text-sm border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400"
                                />
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSaveRate(inst.instructor_id)}
                                disabled={isSavingRate}
                                className="dark:border-navy-600 dark:text-navy-200 dark:hover:bg-navy-700"
                              >
                                {isSavingRate ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                              </Button>
                            </div>
                            {form.rate && (
                              <p className="text-xs text-gray-400 dark:text-navy-400 mt-1">
                                {inst.session_count} sessions × ${parseFloat(form.rate || '0').toFixed(2)} = ${(inst.session_count * parseFloat(form.rate || '0')).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Payment form */}
                        <div>
                          <h3 className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                            <DollarSign className="h-3.5 w-3.5" /> Record Payment
                          </h3>
                          <div className="space-y-3">
                            {/* Stripe automated transfer */}
                            {inst.payout_info?.stripe_account_id && inst.payout_info?.stripe_onboarding_complete && (
                              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                  <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Stripe Connect</p>
                                  <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Connected</span>
                                </div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-3">
                                  金額を入力後、Stripe で自動送金します。
                                </p>
                                <Button
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                                  onClick={() => handlePay(inst.instructor_id, inst.booking_ids, true)}
                                  disabled={isSubmitting || !form.amount}
                                >
                                  {isSubmitting ? (
                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Sending…</>
                                  ) : (
                                    <><Zap className="h-4 w-4 mr-2" /> Stripe で自動送金{form.amount ? ` · $${parseFloat(form.amount || '0').toFixed(2)}` : ''}</>
                                  )}
                                </Button>
                              </div>
                            )}

                            {inst.payout_info?.stripe_account_id && inst.payout_info?.stripe_onboarding_complete && (
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-navy-600" />
                                <span className="text-xs text-gray-400 dark:text-navy-500">または手動で記録</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-navy-600" />
                              </div>
                            )}

                            {/* Amount */}
                            <div>
                              <label className="text-xs text-gray-500 dark:text-navy-400 mb-1 block">Amount (USD) *</label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={form.amount}
                                  onChange={e => updateForm(inst.instructor_id, 'amount', e.target.value)}
                                  className="w-full pl-7 pr-3 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                                />
                              </div>
                            </div>

                            {/* Method */}
                            <div>
                              <label className="text-xs text-gray-500 dark:text-navy-400 mb-1 block">Payment Method *</label>
                              <select
                                value={form.method}
                                onChange={e => updateForm(inst.instructor_id, 'method', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                              >
                                <option value="wise">Wise</option>
                                <option value="bank_transfer">銀行振込 / Bank Transfer</option>
                                <option value="other">その他 / Other</option>
                              </select>
                            </div>

                            {/* Reference */}
                            <div>
                              <label className="text-xs text-gray-500 dark:text-navy-400 mb-1 block">
                                Transaction Reference <span className="text-gray-300 dark:text-navy-500">(optional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. WISE-2026-001"
                                value={form.reference}
                                onChange={e => updateForm(inst.instructor_id, 'reference', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                              />
                            </div>

                            {/* Notes */}
                            <div>
                              <label className="text-xs text-gray-500 dark:text-navy-400 mb-1 block">
                                Notes <span className="text-gray-300 dark:text-navy-500">(optional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="March 2026 payout"
                                value={form.notes}
                                onChange={e => updateForm(inst.instructor_id, 'notes', e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-200 dark:border-navy-600 rounded-lg bg-white dark:bg-navy-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sage-400 text-sm"
                              />
                            </div>

                            <Button
                              className="w-full bg-sage-500 hover:bg-sage-600 text-white font-semibold"
                              onClick={() => handlePay(inst.instructor_id, inst.booking_ids)}
                              disabled={isSubmitting || !form.amount}
                            >
                              {isSubmitting ? (
                                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Recording…</>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark {inst.session_count} sessions as paid
                                  {form.amount ? ` · $${parseFloat(form.amount).toFixed(2)}` : ''}
                                </>
                              )}
                            </Button>

                            <p className="text-xs text-gray-400 dark:text-navy-500 text-center">
                              This marks sessions as completed and records the payment.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── History Tab ──────────────────────────────────────────────────────── */}
        {tab === 'history' && (
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
            {history.length === 0 ? (
              <div className="p-16 text-center">
                <DollarSign className="h-12 w-12 text-gray-300 dark:text-navy-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-navy-400">No payments recorded yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-700/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Instructor</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Sessions</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Method</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-navy-700">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30">
                        <td className="px-6 py-4 text-gray-600 dark:text-navy-300 whitespace-nowrap">
                          {format(new Date(item.paid_at), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          {(item.profiles as any)?.full_name ?? '—'}
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-navy-300">{item.session_count}</td>
                        <td className="px-4 py-4 font-semibold text-sage-700 dark:text-sage-400">
                          ${Number(item.amount_usd).toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-gray-600 dark:text-navy-300">
                          {METHOD_LABELS[item.payment_method] ?? item.payment_method}
                        </td>
                        <td className="px-4 py-4 text-gray-400 dark:text-navy-500 font-mono text-xs">
                          {item.payment_reference ?? '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 dark:text-navy-500 w-16 flex-shrink-0">{label}</span>
      <span className="text-gray-700 dark:text-navy-200 font-medium break-all">{value}</span>
    </div>
  )
}
