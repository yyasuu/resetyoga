import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { cookies } from 'next/headers'
import { VideoManager } from '@/components/wellness/VideoManager'
import { ArticleManager } from '@/components/wellness/ArticleManager'
import { PoseManager } from '@/components/wellness/PoseManager'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function AdminWellnessPage() {
  const supabase = await createClient()
  const admin = await createAdminClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: videos } = await admin
    .from('wellness_videos')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: articles } = await admin
    .from('wellness_articles')
    .select('*, profiles(full_name, role)')
    .order('created_at', { ascending: false })

  const { data: poses } = await admin
    .from('yoga_poses')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-4">
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? 'ダッシュボードへ戻る' : 'Back to Dashboard'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ja' ? 'ウェルネスコンテンツ管理' : 'Wellness Content Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-navy-300 mt-1">
            {locale === 'ja'
              ? '瞑想動画のアップロードとウェルネスコラムの管理'
              : 'Manage meditation videos and wellness articles'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Video Management */}
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <VideoManager initialVideos={videos ?? []} />
          </div>

          {/* Article Management */}
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <ArticleManager
              initialArticles={(articles ?? []) as any}
              newArticleHref="/instructor/articles/new"
              locale={locale}
            />
          </div>

          {/* Pose Library Management */}
          <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <PoseManager
              initialPoses={(poses ?? []) as any}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
