import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { cookies } from 'next/headers'
import { ArticleManager } from '@/components/wellness/ArticleManager'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function InstructorArticlesPage() {
  const supabase = await createClient()
  const admin = await createAdminClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['instructor', 'admin'].includes(profile.role)) redirect('/dashboard')

  // Instructors see only their own articles
  const { data: articles } = await admin
    .from('wellness_articles')
    .select('*, profiles(full_name, role)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/instructor/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-4">
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? 'ダッシュボードへ戻る' : 'Back to Dashboard'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ja' ? 'ウェルネスコラム' : 'Wellness Articles'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-navy-300 mt-1">
            {locale === 'ja'
              ? 'あなたのコラムを作成・管理します。公開するとすべての会員が読めます。'
              : 'Create and manage your wellness articles. Published articles are visible to all members.'}
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <ArticleManager
            initialArticles={(articles ?? []) as any}
            newArticleHref="/instructor/articles/new"
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
