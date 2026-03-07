import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Pencil, Library, ArrowRight } from 'lucide-react'

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
  if (!user) redirect(`/login?from=/wellness/articles/${id}`)

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

        {/* Images */}
        {(() => {
          const imgs: string[] = [
            ...((article.image_urls as string[] | null) ?? []),
            ...(article.cover_image_url && !(article.image_urls as string[] | null)?.includes(article.cover_image_url)
              ? [article.cover_image_url]
              : []),
          ].filter(Boolean)
          if (imgs.length === 0) return null
          return (
            <div className="mb-8 space-y-3">
              {/* First image: full width */}
              <div className="rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[0]} alt={title} className="w-full h-64 object-cover" />
              </div>
              {/* Remaining images: side by side */}
              {imgs.length > 1 && (
                <div className={`grid gap-3 ${imgs.length === 2 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {imgs.slice(1).map((url, i) => (
                    <div key={i} className="rounded-xl overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-48 object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* Content */}
        {content ? (
          <div
            className="prose prose-gray dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
              prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
              prose-p:text-gray-700 dark:prose-p:text-gray-200 prose-p:leading-relaxed
              prose-strong:text-gray-900 dark:prose-strong:text-white
              prose-em:text-gray-700 dark:prose-em:text-gray-200
              prose-ul:text-gray-700 dark:prose-ul:text-gray-200
              prose-ol:text-gray-700 dark:prose-ol:text-gray-200
              prose-hr:border-gray-200 dark:prose-hr:border-navy-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="text-gray-400 dark:text-navy-400 italic">
            {locale === 'ja' ? '（本文は近日公開予定）' : '(Content coming soon)'}
          </p>
        )}

        {/* Wellness Library Banner */}
        <Link href="/wellness" className="block group mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-500 to-navy-700 dark:from-sage-600 dark:to-navy-800 p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Big icon */}
              <div className="flex-shrink-0 w-20 h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                <Library className="h-10 w-10 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1 text-center sm:text-left">
                <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                  {locale === 'ja' ? 'コンテンツをもっと見る' : 'Explore More Content'}
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  {locale === 'ja' ? 'ウェルネスライブラリ' : 'Wellness Library'}
                </h2>
                <p className="text-white/75 text-sm leading-relaxed">
                  {locale === 'ja'
                    ? '瞑想動画・ヨガ動画・ウェルネスコラムなど、豊富なコンテンツが揃っています。'
                    : 'Explore meditation videos, yoga sessions, and wellness articles — all in one place.'}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-1 transition-all">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </Link>
      </main>

      <Footer />
    </div>
  )
}
