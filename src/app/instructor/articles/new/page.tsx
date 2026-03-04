import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { cookies } from 'next/headers'
import { ArticleEditor } from '@/components/wellness/ArticleEditor'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function NewArticlePage() {
  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['instructor', 'admin'].includes(profile.role)) redirect('/dashboard')

  const redirectTo = profile.role === 'admin' ? '/admin/wellness' : '/instructor/articles'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={redirectTo} className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-4">
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? '戻る' : 'Back'}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {locale === 'ja' ? '新しいコラムを書く' : 'Write New Article'}
          </h1>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
          <ArticleEditor redirectTo={redirectTo} locale={locale} />
        </div>
      </div>
    </div>
  )
}
