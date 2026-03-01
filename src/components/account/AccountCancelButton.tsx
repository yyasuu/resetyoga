'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Trash2, AlertTriangle } from 'lucide-react'

interface Props {
  role: 'student' | 'instructor'
}

export function AccountCancelButton({ role }: Props) {
  const t = useTranslations('account')
  const router = useRouter()
  const supabase = createClient()

  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')

    const res = await fetch('/api/account/delete', { method: 'DELETE' })
    if (res.ok) {
      await supabase.auth.signOut()
      router.push('/')
    } else {
      setError(t('cancel_error'))
      setLoading(false)
    }
  }

  if (!confirm) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start gap-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={() => setConfirm(true)}
      >
        <Trash2 className="h-4 w-4" />
        {t('cancel_btn')}
      </Button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4">
      <div className="flex items-start gap-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-red-900 dark:text-red-300 text-sm">
            {t('cancel_confirm_title')}
          </p>
          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
            {role === 'student'
              ? t('cancel_confirm_body_student')
              : t('cancel_confirm_body_instructor')}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-3">{error}</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-red-600 hover:bg-red-700 text-white"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? t('canceling') : t('cancel_yes')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="dark:border-navy-600 dark:text-navy-200 dark:hover:bg-navy-700"
          onClick={() => { setConfirm(false); setError('') }}
          disabled={loading}
        >
          {t('cancel_no')}
        </Button>
      </div>
    </div>
  )
}
