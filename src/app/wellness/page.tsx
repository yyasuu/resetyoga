import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import { Play, BookOpen } from 'lucide-react'

export const metadata = {
  title: 'Wellness Library | Reset Yoga',
}

const meditationVideos = [
  {
    id: 1,
    titleJa: '朝のリセット瞑想',
    titleEn: 'Morning Reset Meditation',
    duration: '5 min',
    descJa: '一日を穏やかに始めるための5分間の朝の瞑想。呼吸を整え、心を静かに落ち着けます。',
    descEn: 'A 5-minute morning meditation to start your day with calm and clarity.',
    gradient: 'from-linen-200 to-sage-100 dark:from-navy-700 dark:to-navy-800',
  },
  {
    id: 2,
    titleJa: '呼吸で心を整える',
    titleEn: 'Breathe to Center',
    duration: '7 min',
    descJa: '仕事の合間や午後のリフレッシュに。腹式呼吸で副交感神経を整えます。',
    descEn: 'A midday reset using deep belly breathing to calm your nervous system.',
    gradient: 'from-sage-100 to-linen-100 dark:from-navy-800 dark:to-navy-700',
  },
  {
    id: 3,
    titleJa: '眠りへの準備瞑想',
    titleEn: 'Sleep Preparation',
    duration: '10 min',
    descJa: '就寝前の10分間。体の緊張を解放し、深い眠りへと自然に導きます。',
    descEn: 'A 10-minute wind-down to release tension and prepare for deep, restful sleep.',
    gradient: 'from-navy-100 to-sage-50 dark:from-navy-900 dark:to-navy-800',
  },
]

const wellnessColumns = [
  {
    id: 1,
    category: 'Ayurveda',
    categoryJa: 'アーユルヴェーダ',
    titleJa: '体質（ドーシャ）とヨガスタイルの選び方',
    titleEn: 'Finding Your Yoga Style by Dosha Type',
    excerptJa:
      'アーユルヴェーダでは人の体質をヴァータ・ピッタ・カパの3つに分類します。自分のドーシャを知ることで、より効果的なヨガスタイルと呼吸法を選ぶことができます。心身のバランスを整えるための第一歩として、ぜひ自分の体質を探ってみましょう。',
    excerptEn:
      'Ayurveda classifies body types into Vata, Pitta, and Kapha. Understanding your dosha helps you choose the most effective yoga style and breathing practice for your unique constitution.',
  },
  {
    id: 2,
    category: 'Nutrition',
    categoryJa: '食事',
    titleJa: 'ヨガ前後の食事ガイド — 体を内側から整える',
    titleEn: 'What to Eat Before & After Yoga',
    excerptJa:
      'ヨガの効果を最大化するには、食事のタイミングと内容が重要です。セッション前は消化の良い軽めの食事を、セッション後は回復を助けるタンパク質と水分を中心に摂りましょう。',
    excerptEn:
      'Timing and food choices matter for getting the most from your practice. Keep it light and easily digestible before your session, then focus on protein and hydration afterward.',
  },
  {
    id: 3,
    category: 'Breathing',
    categoryJa: '呼吸法',
    titleJa: 'プラナヤマ入門 — 呼吸が変わると人生が変わる',
    titleEn: 'Introduction to Pranayama',
    excerptJa:
      'ヨガの呼吸法（プラナヤマ）は、単なる呼吸練習ではありません。不安を和らげ、集中力を高め、エネルギーを調整する強力なツールです。まずは「腹式呼吸」と「片鼻呼吸」から始めてみましょう。',
    excerptEn:
      'Pranayama is far more than breathing exercises. It is a powerful tool to reduce anxiety, sharpen focus, and regulate your vital energy. Start with belly breathing and alternate nostril breathing.',
  },
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
            {meditationVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`h-40 bg-gradient-to-br ${video.gradient} flex items-center justify-center relative`}
                >
                  <div className="w-14 h-14 bg-white/80 dark:bg-navy-900/80 rounded-full flex items-center justify-center shadow-md">
                    <Play className="h-6 w-6 text-sage-600 dark:text-sage-400 ml-0.5" />
                  </div>
                  <span className="absolute bottom-3 right-3 text-xs bg-navy-900/60 text-white px-2 py-0.5 rounded-full">
                    {video.duration}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    {locale === 'ja' ? video.titleJa : video.titleEn}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                    {locale === 'ja' ? video.descJa : video.descEn}
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
            {wellnessColumns.map((col) => (
              <div
                key={col.id}
                className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                  {locale === 'ja' ? col.categoryJa : col.category}
                </span>
                <h3 className="font-bold text-gray-900 dark:text-white mt-2 mb-3 leading-snug">
                  {locale === 'ja' ? col.titleJa : col.titleEn}
                </h3>
                <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                  {locale === 'ja' ? col.excerptJa : col.excerptEn}
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
