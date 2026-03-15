'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { AlertTriangle, UserRound } from 'lucide-react'
import { useLocale } from 'next-intl'

export function SwitchToStudentButton() {
  const router = useRouter()
  const locale = useLocale()
  const ja = locale === 'ja'
  const supabase = createClient()

  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleSwitch() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError(ja ? '認証エラー。再ログインしてください。' : 'Auth error. Please log in again.'); setLoading(false); return }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'student' })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  if (!confirm) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700"
        onClick={() => setConfirm(true)}
      >
        <UserRound className="h-4 w-4 text-gray-400" />
        {ja ? '生徒に切り替える' : 'Switch to Student'}
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4">
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">
            {ja ? '生徒に切り替えますか？' : 'Switch to Student?'}
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
            {ja
              ? 'プロフィールや実績はそのまま保存されます。また講師に申請すれば再び教えることができます。'
              : 'Your profile and history are preserved. You can re-apply as an instructor anytime.'}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white"
          onClick={handleSwitch}
          disabled={loading}
        >
          {loading ? (ja ? '切り替え中…' : 'Switching…') : (ja ? '切り替える' : 'Switch')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="dark:border-navy-600 dark:text-navy-200 dark:hover:bg-navy-700"
          onClick={() => { setConfirm(false); setError('') }}
          disabled={loading}
        >
          {ja ? 'キャンセル' : 'Cancel'}
        </Button>
      </div>
    </div>
  )
}
