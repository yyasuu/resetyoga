import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import { Play, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { WellnessVideoCard } from '@/components/wellness/WellnessVideoCard'

export const metadata = {
  title: 'Wellness Library | Reset Yoga',
}

// Static fallback content if DB has no published items yet
const STATIC_VIDEOS = [
  {
    id: 's1',
    title_ja: '朝のリセット瞑想',
    title_en: 'Morning Reset Meditation',
    duration_label: '5 min',
    description_ja: '一日を穏やかに始めるための5分間の朝の瞑想。',
    description_en: 'A 5-minute morning meditation to start your day with calm and clarity.',
    gradient: 'from-linen-200 to-sage-100 dark:from-navy-700 dark:to-navy-800',
    video_url: null,
    thumbnail_url: null,
    is_static: true,
  },
  {
    id: 's2',
    title_ja: '呼吸で心を整える',
    title_en: 'Breathe to Center',
    duration_label: '7 min',
    description_ja: '腹式呼吸で副交感神経を整えます。',
    description_en: 'A midday reset using deep belly breathing to calm your nervous system.',
    gradient: 'from-sage-100 to-linen-100 dark:from-navy-800 dark:to-navy-700',
    video_url: null,
    thumbnail_url: null,
    is_static: true,
  },
  {
    id: 's3',
    title_ja: '眠りへの準備瞑想',
    title_en: 'Sleep Preparation',
    duration_label: '10 min',
    description_ja: '体の緊張を解放し、深い眠りへと自然に導きます。',
    description_en: 'A 10-minute wind-down to release tension and prepare for restful sleep.',
    gradient: 'from-navy-100 to-sage-50 dark:from-navy-900 dark:to-navy-800',
    video_url: null,
    thumbnail_url: null,
    is_static: true,
  },
]

const STATIC_ARTICLES = [
  {
    id: 'a1',
    category: 'ayurveda',
    category_ja: 'アーユルヴェーダ',
    title_ja: '体質（ドーシャ）とヨガスタイルの選び方',
    title_en: 'Finding Your Yoga Style by Dosha Type',
    excerpt_ja: 'アーユルヴェーダでは人の体質をヴァータ・ピッタ・カパの3つに分類します。自分のドーシャを知ることで、より効果的なヨガスタイルと呼吸法を選ぶことができます。',
    excerpt_en: 'Ayurveda classifies body types into Vata, Pitta, and Kapha. Understanding your dosha helps you choose the most effective yoga style for your constitution.',
    is_static: true,
  },
  {
    id: 'a2',
    category: 'nutrition',
    category_ja: '食事',
    title_ja: 'ヨガ前後の食事ガイド — 体を内側から整える',
    title_en: 'What to Eat Before & After Yoga',
    excerpt_ja: 'ヨガの効果を最大化するには、食事のタイミングと内容が重要です。',
    excerpt_en: 'Timing and food choices matter for getting the most from your practice.',
    is_static: true,
  },
  {
    id: 'a3',
    category: 'breathing',
    category_ja: '呼吸法',
    title_ja: 'プラナヤマ入門 — 呼吸が変わると人生が変わる',
    title_en: 'Introduction to Pranayama',
    excerpt_ja: 'ヨガの呼吸法（プラナヤマ）は、不安を和らげ、集中力を高め、エネルギーを調整する強力なツールです。',
    excerpt_en: 'Pranayama is a powerful tool to reduce anxiety, sharpen focus, and regulate your vital energy.',
    is_static: true,
  },
]

const GRADIENTS = [
  'from-linen-200 to-sage-100 dark:from-navy-700 dark:to-navy-800',
  'from-sage-100 to-linen-100 dark:from-navy-800 dark:to-navy-700',
  'from-navy-100 to-sage-50 dark:from-navy-900 dark:to-navy-800',
]

export default async function WellnessPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/register')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  // Fetch published content from DB
  const [{ data: dbVideos }, { data: dbArticles }] = await Promise.all([
    supabase.from('wellness_videos').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    supabase.from('wellness_articles').select('*, profiles(full_name)').eq('is_published', true).order('created_at', { ascending: false }),
  ])

  const hasDbVideos = dbVideos && dbVideos.length > 0
  const hasDbArticles = dbArticles && dbArticles.length > 0

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* Header */}
      <div className="bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-900 px-4 py-16 text-center">
        <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
          {locale === 'ja' ? '無料会員コンテンツ' : 'Free Member Content'}
        </p>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">
          {locale === 'ja' ? 'ウェルネスライブラリ' : 'Wellness Library'}
        </h1>
        <p className="text-gray-500 dark:text-navy-300 max-w-xl mx-auto">
          {locale === 'ja'
            ? '瞑想動画とウェルネスコラムで、ヨガの実践をさらに深めましょう。'
            : 'Deepen your practice with guided meditation videos and wellness columns.'}
        </p>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">

        {/* Meditation Videos */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sage-100 dark:bg-sage-900/40 rounded-xl flex items-center justify-center">
              <Play className="h-5 w-5 text-sage-600 dark:text-sage-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {locale === 'ja' ? '瞑想ガイド動画' : 'Guided Meditation Videos'}
              </h2>
              <p className="text-sm text-gray-400 dark:text-navy-400">
                {locale === 'ja' ? '5〜10分 · いつでも視聴できます' : '5–10 minutes · Watch anytime'}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {hasDbVideos
              ? dbVideos.map((video, i) => (
                  <WellnessVideoCard
                    key={video.id}
                    video={video}
                    gradient={GRADIENTS[i % GRADIENTS.length]}
                    locale={locale}
                  />
                ))
              : STATIC_VIDEOS.map((video) => (
                  <div
                    key={video.id}
                    className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm"
                  >
                    <div className={`h-40 bg-gradient-to-br ${video.gradient} flex items-center justify-center relative`}>
                      <div className="w-14 h-14 bg-white/80 dark:bg-navy-900/80 rounded-full flex items-center justify-center shadow-md">
                        <Play className="h-6 w-6 text-sage-600 dark:text-sage-400 ml-0.5" />
                      </div>
                      <span className="absolute bottom-3 right-3 text-xs bg-navy-900/60 text-white px-2 py-0.5 rounded-full">
                        {video.duration_label}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        {locale === 'ja' ? video.title_ja : video.title_en}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                        {locale === 'ja' ? video.description_ja : video.description_en}
                      </p>
                      <p className="text-xs text-sage-500 dark:text-sage-400 mt-3 font-medium">
                        {locale === 'ja' ? '近日公開' : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                ))}
          </div>
        </section>

        {/* Wellness Columns */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-linen-200 dark:bg-navy-700 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-navy-600 dark:text-navy-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {locale === 'ja' ? 'ウェルネスコラム' : 'Wellness Columns'}
              </h2>
              <p className="text-sm text-gray-400 dark:text-navy-400">
                {locale === 'ja'
                  ? 'アーユルヴェーダ · 食事 · 呼吸法'
                  : 'Ayurveda · Nutrition · Breathing'}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            {hasDbArticles
              ? dbArticles.map((article) => {
                  const coverImage = (article.image_urls as string[] | null)?.[0] ?? article.cover_image_url ?? null
                  return (
                    <Link
                      key={article.id}
                      href={`/wellness/articles/${article.id}`}
                      className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow block group"
                    >
                      {coverImage && (
                        <div className="h-40 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={coverImage}
                            alt={locale === 'ja' ? article.title_ja : article.title_en}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                          {article.category}
                        </span>
                        <h3 className="font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
                          {locale === 'ja' ? article.title_ja : article.title_en}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed line-clamp-3">
                          {(locale === 'ja' ? (article.content_ja ?? '') : (article.content_en ?? ''))
                            .replace(/<[^>]*>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim()}
                        </p>
                        <p className="text-xs text-navy-500 dark:text-sage-400 mt-4 font-medium">
                          {(article.profiles as any)?.full_name ?? 'Reset Yoga'} →
                        </p>
                      </div>
                    </Link>
                  )
                })
              : STATIC_ARTICLES.map((col) => (
                  <div
                    key={col.id}
                    className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 shadow-sm"
                  >
                    <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                      {locale === 'ja' ? col.category_ja : col.category}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug">
                      {locale === 'ja' ? col.title_ja : col.title_en}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                      {locale === 'ja' ? col.excerpt_ja : col.excerpt_en}
                    </p>
                    <p className="text-xs text-sage-500 dark:text-sage-400 mt-4 font-medium">
                      {locale === 'ja' ? '近日公開' : 'Coming soon'}
                    </p>
                  </div>
                ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
