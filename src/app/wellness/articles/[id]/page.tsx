import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft, BookOpen, Pencil, Library, ArrowRight, Sparkles, LogIn } from 'lucide-react'
import { PremiumPaywall } from '@/components/wellness/PremiumPaywall'

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

  // Auth is optional — guests see a preview + login CTA
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const admin = await createAdminClient()
  const { data: article } = await admin
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
    profile &&
    (profile.role === 'admin' || (profile.role === 'instructor' && article.author_id === user?.id))

  // ── Premium / paywall check ───────────────────────────────────────────────
  const isPremium = !!(article as any).is_premium
  const canAccessPremium = profile?.role === 'admin' || profile?.role === 'instructor'

  let hasActiveSubscription = false
  if (isPremium && !canAccessPremium && user) {
    const { data: sub } = await supabase
      .from('student_subscriptions')
      .select('status')
      .eq('student_id', user.id)
      .single()
    hasActiveSubscription = sub?.status === 'active'
  }

  const showPaywall = isPremium && !canAccessPremium && !hasActiveSubscription && !!user
  // Guest + premium article → show login gate
  // Guest + free article → show full content
  const showLoginGate = !user && isPremium

  // Preview text for guest gate and premium paywall
  const contentPlain = (content ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const contentPreview = contentPlain.slice(0, 300) + (contentPlain.length > 300 ? '…' : '')

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Back */}
        <Link
          href={user ? '/wellness' : '/'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja'
            ? (user ? 'ウェルネスライブラリへ戻る' : 'トップページへ戻る')
            : (user ? 'Back to Wellness Library' : 'Back to Home')}
        </Link>

        {/* Category badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {categoryLabel}
            </span>
            {isPremium && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                {locale === 'ja' ? 'プレミアム' : 'Premium'}
              </span>
            )}
          </div>
          {canEdit && (
            <Link href={`/wellness/articles/${id}/edit`} className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-navy-600 dark:hover:text-sage-400">
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
              <div className="rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgs[0]} alt={title} className="w-full h-64 object-cover" />
              </div>
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

        {/* Content — three states: guest gate / premium paywall / full content */}
        {showLoginGate ? (
          /* ── Guest: preview + login CTA ────────────────────────────── */
          <div>
            {contentPreview && (
              <div className="relative">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  {contentPreview}
                </p>
                {/* Gradient fade at bottom of preview */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-linen-50 dark:from-navy-900 to-transparent pointer-events-none" />
              </div>
            )}
            <div className="mt-6 rounded-2xl bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-700 border border-sage-200 dark:border-navy-600 p-6 text-center">
              <LogIn className="h-8 w-8 text-sage-600 dark:text-sage-400 mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                {locale === 'ja' ? 'この記事を読むにはログインが必要です' : 'Log in to read this article'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-navy-300 mb-5">
                {locale === 'ja'
                  ? '会員登録（無料）で、全ての無料コラム・動画にアクセスできます。'
                  : 'Create a free account to access all free articles and videos.'}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href={`/register?from=/wellness/articles/${id}`}
                  className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                >
                  {locale === 'ja' ? '無料で会員登録' : 'Sign up free'}
                </Link>
                <Link
                  href={`/login?from=/wellness/articles/${id}`}
                  className="inline-flex items-center gap-2 text-sage-700 dark:text-sage-400 text-sm font-semibold hover:underline"
                >
                  {locale === 'ja' ? 'ログイン' : 'Log in'}
                </Link>
              </div>
            </div>
          </div>
        ) : showPaywall ? (
          /* ── Member without subscription: premium paywall ───────────── */
          <PremiumPaywall locale={locale} contentPreview={contentPreview || null} />
        ) : content ? (
          /* ── Full content ────────────────────────────────────────────── */
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

        {/* Bottom CTA — members: library link / guests: register */}
        {user ? (
          <Link href="/wellness" className="block group mt-14">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-500 to-navy-700 dark:from-sage-600 dark:to-navy-800 p-8 sm:p-10 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3 pointer-events-none" />
              <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="flex-shrink-0 w-20 h-20 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Library className="h-10 w-10 text-white" />
                </div>
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
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 group-hover:translate-x-1 transition-all">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="mt-14 text-center">
            <p className="text-sm text-gray-400 dark:text-navy-400 mb-3">
              {locale === 'ja' ? 'もっとコンテンツを見たい方へ' : 'Want to read more?'}
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-navy-600 hover:bg-navy-700 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
            >
              {locale === 'ja' ? '無料会員登録してすべてのコンテンツへ' : 'Sign up free for full access'}
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
