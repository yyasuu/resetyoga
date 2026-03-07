import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { cookies } from 'next/headers'
import { PremiumAdminTabs } from '@/components/premium/PremiumAdminTabs'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AdminPremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = await createAdminClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const [
    { data: tierApps },
    { data: classSubmissions },
    { data: waitlist },
  ] = await Promise.all([
    admin.from('premium_tier_applications')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false }),
    admin.from('premium_classes')
      .select('*, profiles(full_name, email), premium_tiers(name_ja, price_min_jpy, price_max_jpy)')
      .neq('status', 'draft')
      .order('created_at', { ascending: false }),
    admin.from('premium_waitlist')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const pendingTierApps    = (tierApps       ?? []).filter((a: any) => a.status === 'pending')
  const pendingClasses     = (classSubmissions ?? []).filter((c: any) => c.status === 'pending')

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900">
      <Navbar user={profile} />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-navy-600 mb-6">
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja' ? '管理ダッシュボードへ' : 'Back to dashboard'}
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-navy-800 dark:text-white">Premium 管理</h1>
            <p className="text-sm text-gray-500 dark:text-navy-300 mt-1">Tier審査・クラス承認・待機リスト</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-amber-600">{pendingTierApps.length}</p>
              <p className="text-xs text-gray-400">Tier審査待ち</p>
            </div>
            <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-amber-600">{pendingClasses.length}</p>
              <p className="text-xs text-gray-400">クラス承認待ち</p>
            </div>
            <div className="bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-sage-600">{(waitlist ?? []).length}</p>
              <p className="text-xs text-gray-400">待機リスト</p>
            </div>
          </div>
        </div>

        <PremiumAdminTabs
          tierApps={tierApps as any ?? []}
          classSubmissions={classSubmissions as any ?? []}
          waitlist={waitlist as any ?? []}
          locale={locale}
        />
      </div>
    </div>
  )
}
