'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TimezoneCombobox } from '@/components/ui/timezone-combobox'
import { toast } from 'sonner'
import { Profile } from '@/types'
import { GlobeIcon, UserIcon, Loader2 } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Tokyo')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!p) { router.push('/login'); return }

      setProfile(p)
      setFullName(p.full_name || '')
      setTimezone(p.timezone || 'Asia/Tokyo')
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, timezone })
      .eq('id', user.id)

    setSaving(false)
    if (error) {
      toast.error('保存に失敗しました / Failed to save')
    } else {
      toast.success('保存しました / Saved')
      setProfile(prev => prev ? { ...prev, full_name: fullName, timezone } : prev)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Account Settings / アカウント設定
        </h1>
        <p className="text-sm text-gray-500 dark:text-navy-300 mb-8">
          名前・タイムゾーンを変更できます。
        </p>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 space-y-6">

          {/* Display name */}
          <div>
            <Label className="flex items-center gap-2 dark:text-navy-200 mb-1">
              <UserIcon className="size-4 text-muted-foreground" />
              Display Name / 表示名
            </Label>
            <Input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              className="dark:bg-input/30"
            />
          </div>

          {/* Timezone */}
          <div>
            <Label className="flex items-center gap-2 dark:text-navy-200 mb-1">
              <GlobeIcon className="size-4 text-muted-foreground" />
              Timezone / タイムゾーン
            </Label>
            <p className="text-xs text-gray-500 dark:text-navy-400 mb-2">
              予約カレンダーの表示時刻に使用されます。
            </p>
            <TimezoneCombobox
              value={timezone}
              onValueChange={setTimezone}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-navy-600 hover:bg-navy-700 text-white"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {saving ? '保存中...' : '保存する / Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}
