import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import { WellnessContent } from '@/components/wellness/WellnessContent'

export const metadata = {
  title: 'Wellness Library | Reset Yoga',
}

const STATIC_VIDEOS = [
  {
    id: 's1',
    title_ja: '朝のリセット瞑想',
    title_en: 'Morning Reset Meditation',
    description_ja: '一日を穏やかに始めるための5分間の朝の瞑想。',
    description_en: 'A 5-minute morning meditation to start your day with calm and clarity.',
    gradient: 'from-linen-200 to-sage-100 dark:from-navy-700 dark:to-navy-800',
    video_url: null,
    thumbnail_url: null,
    is_static: true as const,
  },
  {
    id: 's2',
    title_ja: '呼吸で心を整える',
    title_en: 'Breathe to Center',
    description_ja: '腹式呼吸で副交感神経を整えます。',
    description_en: 'A midday reset using deep belly breathing to calm your nervous system.',
    gradient: 'from-sage-100 to-linen-100 dark:from-navy-800 dark:to-navy-700',
    video_url: null,
    thumbnail_url: null,
    is_static: true as const,
  },
  {
    id: 's3',
    title_ja: '眠りへの準備瞑想',
    title_en: 'Sleep Preparation',
    description_ja: '体の緊張を解放し、深い眠りへと自然に導きます。',
    description_en: 'A 10-minute wind-down to release tension and prepare for restful sleep.',
    gradient: 'from-navy-100 to-sage-50 dark:from-navy-900 dark:to-navy-800',
    video_url: null,
    thumbnail_url: null,
    is_static: true as const,
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
    is_static: true as const,
  },
  {
    id: 'a2',
    category: 'nutrition',
    category_ja: '食事',
    title_ja: 'ヨガ前後の食事ガイド — 体を内側から整える',
    title_en: 'What to Eat Before & After Yoga',
    excerpt_ja: 'ヨガの効果を最大化するには、食事のタイミングと内容が重要です。',
    excerpt_en: 'Timing and food choices matter for getting the most from your practice.',
    is_static: true as const,
  },
  {
    id: 'a3',
    category: 'breathing',
    category_ja: '呼吸法',
    title_ja: 'プラナヤマ入門 — 呼吸が変わると人生が変わる',
    title_en: 'Introduction to Pranayama',
    excerpt_ja: 'ヨガの呼吸法（プラナヤマ）は、不安を和らげ、集中力を高め、エネルギーを調整する強力なツールです。',
    excerpt_en: 'Pranayama is a powerful tool to reduce anxiety, sharpen focus, and regulate your vital energy.',
    is_static: true as const,
  },
]

export default async function WellnessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  // Use admin client to bypass RLS — wellness library is public
  const adminSupabase = await createAdminClient()
  const [{ data: dbVideos }, { data: dbArticles }] = await Promise.all([
    adminSupabase.from('wellness_videos').select('*').eq('is_published', true).order('created_at', { ascending: false }),
    adminSupabase.from('wellness_articles').select('*, profiles(full_name)').eq('is_published', true).order('created_at', { ascending: false }),
  ])

  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* Header */}
      <div className="bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-900 px-4 py-14 text-center">
        <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
          {locale === 'ja' ? '無料会員コンテンツ' : 'Free Member Content'}
        </p>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">
          {locale === 'ja' ? 'ウェルネスライブラリ' : 'Wellness Library'}
        </h1>
        <p className="text-gray-500 dark:text-navy-300 max-w-xl mx-auto">
          {locale === 'ja'
            ? 'お悩みを選ぶと、あなたに合った瞑想動画とコラムが見つかります。'
            : 'Select a concern to find videos and articles tailored to your needs.'}
        </p>
        {!isLoggedIn && (
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 dark:bg-navy-800/70 backdrop-blur rounded-full border border-sage-200 dark:border-navy-600 text-navy-700 dark:text-navy-200">
              <span>🌿</span>
              <span>{locale === 'ja' ? '全体公開' : 'Public'}</span>
              <span className="text-gray-400">·</span>
              <span className="text-sage-700 dark:text-sage-400 font-semibold inline-flex items-center gap-1">🔒 {locale === 'ja' ? '無料会員限定' : 'Members'}</span>
              <span className="text-gray-400">·</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold inline-flex items-center gap-1">✨ {locale === 'ja' ? 'プレミアム' : 'Premium'}</span>
            </div>
            <a href="/register" className="px-4 py-2 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold rounded-full transition-colors">
              {locale === 'ja' ? '無料登録 →' : 'Sign up free →'}
            </a>
          </div>
        )}
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-12">
        <WellnessContent
          dbVideos={(dbVideos ?? []) as any}
          dbArticles={(dbArticles ?? []) as any}
          staticVideos={STATIC_VIDEOS}
          staticArticles={STATIC_ARTICLES}
          locale={locale}
          gradients={[]}
          isLoggedIn={isLoggedIn}
        />
      </main>

      <Footer />
    </div>
  )
}
