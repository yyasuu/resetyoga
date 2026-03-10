import { createClient, createAdminClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import { PoseLibraryContent } from '@/components/wellness/PoseLibraryContent'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'Yoga Pose Library | Reset Yoga',
}

export default async function PosesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const adminSupabase = await createAdminClient()
  const { data: poses } = await adminSupabase
    .from('yoga_poses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  const isLoggedIn = !!user

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* Header */}
      <div className="bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-900 px-4 py-14 text-center">
        <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
          {locale === 'ja' ? 'ウェルネスライブラリ' : 'Wellness Library'}
        </p>
        <h1 className="text-3xl font-bold text-navy-800 dark:text-white mb-3">
          {locale === 'ja' ? 'ヨガポーズ集' : 'Yoga Pose Library'}
        </h1>
        <p className="text-gray-500 dark:text-navy-300 max-w-xl mx-auto">
          {locale === 'ja'
            ? 'ポーズの名前・部位・難易度で絞り込んで、自分に合ったポーズを見つけましょう。'
            : 'Filter by concern, pose family, or difficulty to find the perfect poses for your practice.'}
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
        <div className="mb-6">
          <Link
            href="/wellness"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? 'ウェルネスライブラリへ戻る' : 'Back to Wellness Library'}
          </Link>
        </div>

        {/* Yoga Styles World Map — editorial infographic */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sage-500 dark:text-sage-400 mb-1">
              {locale === 'ja' ? 'ヨガスタイル全体マップ' : 'Complete Yoga Style Map'}
            </p>
            <p className="text-xs text-gray-400 dark:text-navy-400 max-w-sm mx-auto">
              {locale === 'ja'
                ? '主要なヨガスタイルと身体・心・感情への効能を一枚に。'
                : 'Major yoga traditions and their physical, mental & emotional benefits at a glance.'}
            </p>
          </div>
          <div className="relative max-w-2xl mx-auto rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/5">
            <Image
              src="/yoga-styles-map.jpg"
              alt="The Complete World Map of Yoga Styles and Their Benefits"
              width={900}
              height={1013}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        {poses && poses.length > 0 ? (
          <PoseLibraryContent
            poses={poses as any}
            locale={locale}
            isLoggedIn={isLoggedIn}
          />
        ) : (
          <div className="py-20 text-center">
            <p className="text-6xl mb-5">🧘</p>
            <h2 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">
              {locale === 'ja' ? 'ポーズは近日公開予定です' : 'Poses coming soon'}
            </h2>
            <p className="text-sm text-gray-400 dark:text-navy-400">
              {locale === 'ja'
                ? 'ヨガポーズライブラリは現在準備中です。お楽しみに！'
                : 'The yoga pose library is currently being prepared. Stay tuned!'}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
