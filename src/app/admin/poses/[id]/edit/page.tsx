import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { cookies } from 'next/headers'
import { PoseEditor } from '@/components/wellness/PoseEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditPosePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const admin = await createAdminClient()
  const { data: pose } = await admin
    .from('yoga_poses')
    .select('*')
    .eq('id', id)
    .single()

  if (!pose) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/admin/wellness"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? 'コンテンツ管理へ戻る' : 'Back to Content Management'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ja' ? 'ポーズを編集' : 'Edit Pose'}
          </h1>
          <p className="text-sm text-sage-600 dark:text-sage-400 mt-1 font-medium">
            {pose.name_sanskrit} — {pose.name_en}
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <PoseEditor mode="edit" initialPose={pose as any} locale={locale} />
        </div>
      </div>
    </div>
  )
}
