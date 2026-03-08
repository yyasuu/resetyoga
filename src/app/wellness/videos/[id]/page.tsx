import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ChevronLeft, Library, ArrowRight, LogIn, Sparkles } from 'lucide-react'
import { PremiumPaywall } from '@/components/wellness/PremiumPaywall'

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  return null
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url) || url.includes('supabase.co/storage')
}

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  // Auth is optional
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const admin = await createAdminClient()
  const { data: video } = await admin
    .from('wellness_videos')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!video) notFound()

  const title = locale === 'ja' ? video.title_ja : video.title_en
  const description = locale === 'ja' ? video.description_ja : video.description_en
  const embedUrl = getEmbedUrl(video.video_url)
  const isDirect = isDirectVideo(video.video_url)

  // ── Premium / access check ───────────────────────────────────────────────
  const isPremium = !!(video as any).is_premium
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

  // Guest + premium video → login gate
  const showLoginGate = !user && isPremium
  // Member + premium + no subscription → paywall
  const showPaywall = isPremium && !canAccessPremium && !hasActiveSubscription && !!user
  // Can watch if: free, OR admin/instructor, OR subscriber
  const canWatch = !isPremium || canAccessPremium || hasActiveSubscription

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <Link
          href={user ? '/wellness' : '/wellness'}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja' ? 'ウェルネスライブラリへ戻る' : 'Back to Wellness Library'}
        </Link>

        {/* Title + premium badge */}
        <div className="flex items-start gap-3 mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-snug flex-1">
            {title}
          </h1>
          {isPremium && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full mt-1">
              <Sparkles className="h-3.5 w-3.5" />
              {locale === 'ja' ? 'プレミアム' : 'Premium'}
            </span>
          )}
        </div>

        {video.duration_label && (
          <p className="text-sm text-sage-600 dark:text-sage-400 mb-6">{video.duration_label}</p>
        )}

        {/* ── Three states: login gate / paywall / video player ── */}
        {showLoginGate ? (
          <div className="rounded-2xl bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-700 border border-sage-200 dark:border-navy-600 p-8 mb-8 text-center">
            <LogIn className="h-10 w-10 text-sage-600 dark:text-sage-400 mx-auto mb-4" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
              {locale === 'ja' ? 'この動画を視聴するにはログインが必要です' : 'Log in to watch this video'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-navy-300 mb-5">
              {locale === 'ja'
                ? 'プレミアム動画は定額プラン会員がご利用いただけます。'
                : 'Premium videos are available to subscribers.'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href={`/register?from=/wellness/videos/${id}`}
                className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                {locale === 'ja' ? '無料で会員登録' : 'Sign up free'}
              </Link>
              <Link
                href={`/login?from=/wellness/videos/${id}`}
                className="inline-flex items-center gap-2 text-sage-700 dark:text-sage-400 text-sm font-semibold hover:underline"
              >
                {locale === 'ja' ? 'ログイン' : 'Log in'}
              </Link>
            </div>
          </div>
        ) : showPaywall ? (
          <PremiumPaywall locale={locale} contentPreview={null} />
        ) : (
          /* Video Player */
          <div className="rounded-2xl overflow-hidden bg-black aspect-video mb-8 shadow-lg">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            ) : isDirect ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video src={video.video_url} className="w-full h-full" controls />
            ) : (
              <div className="flex items-center justify-center h-full text-white text-sm">
                <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="underline">
                  {locale === 'ja' ? '動画を開く' : 'Open Video'}
                </a>
              </div>
            )}
          </div>
        )}

        {description && canWatch && (
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base mb-12">
            {description}
          </p>
        )}

        {/* Guest + free video → soft signup CTA */}
        {!user && !isPremium && (
          <div className="rounded-2xl bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-700 border border-sage-200 dark:border-navy-600 p-6 mb-10 text-center">
            <LogIn className="h-8 w-8 text-sage-600 dark:text-sage-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
              {locale === 'ja' ? 'もっと動画・コラムを楽しもう' : 'Enjoy More Videos & Articles'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-navy-300 mb-4">
              {locale === 'ja'
                ? '会員登録（無料）でウェルネスライブラリの全コンテンツにアクセスできます。'
                : 'Create a free account to access the full Wellness Library — videos, articles, and more.'}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
              >
                {locale === 'ja' ? '無料で会員登録' : 'Sign up free'}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sage-700 dark:text-sage-400 text-sm font-semibold hover:underline"
              >
                {locale === 'ja' ? 'ログイン' : 'Log in'}
              </Link>
            </div>
          </div>
        )}

        {/* Wellness Library Banner */}
        <Link href="/wellness" className="block group mt-4">
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
      </main>

      <Footer />
    </div>
  )
}
