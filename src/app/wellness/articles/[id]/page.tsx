import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Pencil } from 'lucide-react'

const CATEGORY_LABELS: Record<string, { ja: string; en: string }> = {
  ayurveda: { ja: 'アーユルヴェーダ', en: 'Ayurveda' },
  nutrition: { ja: '食事・栄養', en: 'Nutrition' },
  breathing: { ja: '呼吸法', en: 'Breathing' },
  mindfulness: { ja: 'マインドフルネス', en: 'Mindfulness' },
  yoga: { ja: 'ヨガ理論', en: 'Yoga Theory' },
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/register')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: article } = await supabase
    .from('wellness_articles')
    .select('*, profiles(full_name, role)')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!article) notFound()

  const title = locale === 'ja' ? article.title_ja : article.title_en
  const subtitle = locale === 'ja' ? article.subtitle_ja : article.subtitle_en
  const content = locale === 'ja' ? article.content_ja : article.content_en
  const category = CATEGORY_LABELS[article.category]
  const categoryLabel = locale === 'ja' ? (category?.ja ?? article.category) : (category?.en ?? article.category)

  const canEdit =
    profile.role === 'admin' ||
    (profile.role === 'instructor' && article.author_id === user.id)

  const editHref = `/wellness/articles/${id}/edit`

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Back */}
        <Link href="/wellness" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-8">
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja' ? 'ウェルネスライブラリへ戻る' : 'Back to Wellness Library'}
        </Link>

        {/* Category badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            {categoryLabel}
          </span>
          {canEdit && (
            <Link href={editHref} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-navy-600 dark:hover:text-sage-400">
              <Pencil className="h-3.5 w-3.5" />
              {locale === 'ja' ? '編集' : 'Edit'}
            </Link>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug mb-2">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-base text-gray-500 dark:text-navy-300 mb-4 leading-relaxed">
            {subtitle}
          </p>
        )}

        {/* Author + Date */}
        <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-100 dark:border-navy-700">
          <div className="w-8 h-8 rounded-full bg-sage-100 dark:bg-sage-900/40 flex items-center justify-center text-sage-700 dark:text-sage-400 font-bold text-sm">
            {(article.profiles as any)?.full_name?.charAt(0) ?? 'R'}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {(article.profiles as any)?.full_name ?? 'Reset Yoga'}
            </p>
            <p className="text-xs text-gray-400 dark:text-navy-400">
              {new Date(article.created_at).toLocaleDateString(
                locale === 'ja' ? 'ja-JP' : 'en-US',
                { year: 'numeric', month: 'long', day: 'numeric' }
              )}
            </p>
          </div>
        </div>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image_url} alt={title} className="w-full h-56 object-cover" />
          </div>
        )}

        {/* Content */}
        {content ? (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {content.split('\n').map((paragraph: string, i: number) =>
              paragraph.trim() ? (
                <p key={i} className="text-gray-700 dark:text-gray-200 leading-relaxed mb-4">
                  {paragraph}
                </p>
              ) : (
                <br key={i} />
              )
            )}
          </div>
        ) : (
          <p className="text-gray-400 dark:text-navy-400 italic">
            {locale === 'ja' ? '（本文は近日公開予定）' : '(Content coming soon)'}
          </p>
        )}
      </main>

      <Footer />
    </div>
  )
}
