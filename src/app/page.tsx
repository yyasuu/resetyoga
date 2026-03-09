import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, Video, Clock, Heart, Sparkles, Globe, Play, BookOpen, Layers, ArrowRight } from 'lucide-react'
import { CONCERNS } from '@/lib/concerns'
import { POSE_FAMILIES, DIFFICULTY_LEVELS } from '@/lib/poses'

export default async function LandingPage() {
  const t = await getTranslations('landing')

  let profile: Profile | null = null
  let instructors: any[] = []
  let user: { id: string } | null = null
  let previewVideo: any = null
  let previewArticles: any[] = []
  let previewPose: any = null
  let locale = 'en'

  try {
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    user = authData.user

    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }

    const { data: instructorData } = await supabase
      .from('profiles')
      .select('*, instructor_profiles(*)')
      .eq('role', 'instructor')
      .eq('instructor_profiles.is_approved', true)
      .limit(6)
    instructors = instructorData?.filter((i: any) => i.instructor_profiles) || []

    const cookieStore = await cookies()
    locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

    // Use admin client to bypass RLS — these are public preview cards
    const adminSupabase = await createAdminClient()
    const [{ data: vData }, { data: aData }, { data: pData }] = await Promise.all([
      adminSupabase
        .from('wellness_videos')
        .select('id, title_ja, title_en, thumbnail_url, duration_label, category, concerns')
        .eq('is_published', true)
        .order('created_at', { ascending: true })
        .limit(1),
      adminSupabase
        .from('wellness_articles')
        .select('id, title_ja, title_en, category, concerns, cover_image_url, image_urls')
        .eq('is_published', true)
        .eq('is_premium', false)
        .order('created_at', { ascending: true })
        .limit(3),
      adminSupabase
        .from('yoga_poses')
        .select('id, name_sanskrit, name_en, name_ja, image_url_ja, image_url_en, image_url, description_ja, description_en, pose_family, difficulty, concerns, access_level')
        .eq('is_published', true)
        .eq('access_level', 'public')
        .order('created_at', { ascending: true })
        .limit(1),
    ])
    previewVideo = vData?.[0] ?? null
    previewArticles = aData ?? []
    previewPose = pData?.[0] ?? null
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="min-h-screen">
      <Navbar user={profile} />

      {/* ── Fixed hero background (shows only behind hero section) ───── */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <Image
          src="/toppage_hero.png"
          alt="Woman practicing yoga online at home"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-navy-900/35" />
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-[calc(100svh-72px)] flex flex-col items-center justify-center px-4 text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
          <Heart className="h-4 w-4 fill-rose-300 text-rose-300" />
          {t('eyebrow')}
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 drop-shadow-lg">
          {t('hero_title')}
        </h1>
        <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto leading-relaxed drop-shadow">
          {t('hero_subtitle')}
        </p>
        <p className="text-base text-white/75 mb-10">
          {t('hero_tagline')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href={user ? '/instructors' : '/register'}>
            <Button
              size="lg"
              className="bg-white text-navy-700 hover:bg-linen-100 px-10 py-4 text-lg h-auto rounded-full shadow-lg hover:shadow-xl transition-all font-bold"
            >
              {t('cta_start')} →
            </Button>
          </Link>
          <Link href="/instructors">
            <Button
              size="lg"
              className="border border-white/70 text-white bg-transparent hover:bg-white/15 px-10 py-4 text-lg h-auto rounded-full backdrop-blur-sm shadow-none"
            >
              {t('cta_browse')}
            </Button>
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
          <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-300 fill-yellow-300" /> {t('trust_rating')}</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-sage-300" /> {t('trust_certified')}</span>
          <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-white/70" /> {t('trust_global')}</span>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <div className="w-5 h-8 border border-white/40 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-0.5 h-1.5 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ── Manifesto ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-px h-16 bg-sage-200 dark:bg-sage-800 mx-auto mb-16" />
          <p className="text-lg sm:text-xl text-navy-700 dark:text-linen-100 leading-loose font-light whitespace-nowrap">
            {t('manifesto_line1')}
          </p>
          <p className="text-base sm:text-lg text-sage-600 dark:text-sage-400 leading-loose font-light mt-3 whitespace-nowrap">
            {t('manifesto_line2')}
          </p>
          <div className="w-px h-16 bg-sage-200 dark:bg-sage-800 mx-auto mt-16" />
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-sage-50 dark:bg-navy-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-4">{t('pain_label')}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 break-keep">
            {t('pain_title')}
          </h2>
          <div className="divide-y divide-sage-100 dark:divide-navy-800 max-w-lg mx-auto mt-10">
            {[t('pain_1'), t('pain_2'), t('pain_3'), t('pain_4')].map((text) => (
              <div key={text} className="flex items-center gap-5 py-5">
                <div className="w-1.5 h-1.5 rounded-full bg-sage-400 dark:bg-sage-500 flex-shrink-0" />
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          {/* Before / After image */}
          <div className="mt-10 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src="/yoga_before_after.png"
              alt="Before and after yoga – from exhausted to refreshed"
              width={1440}
              height={720}
              className="w-full object-cover"
            />
          </div>

          <p className="mt-10 text-xl text-navy-700 dark:text-linen-200 font-bold">
            {t('pain_cta')}<br />
            <span className="text-sage-600 dark:text-sage-400">{t('pain_cta_highlight')}</span>
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-linen-50 dark:bg-navy-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('features_label')}</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            {t('features_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-navy-700 text-center">
              <div className="w-14 h-14 bg-navy-100 dark:bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Star className="h-7 w-7 text-navy-600 dark:text-navy-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('feature_1_title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('feature_1_desc')}</p>
            </div>
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-navy-700 text-center">
              <div className="w-14 h-14 bg-sage-100 dark:bg-sage-900/40 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Clock className="h-7 w-7 text-sage-600 dark:text-sage-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('feature_2_title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('feature_2_desc')}</p>
            </div>
            <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-navy-700 text-center">
              <div className="w-14 h-14 bg-linen-200 dark:bg-navy-800 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Video className="h-7 w-7 text-navy-600 dark:text-navy-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('feature_3_title')}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t('feature_3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-linen-100 dark:bg-navy-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('how_label')}</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('how_title')}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">{t('how_subtitle')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: t('how_1'), detail: t('how_detail_1') },
              { step: t('how_2'), detail: t('how_detail_2') },
              { step: t('how_3'), detail: t('how_detail_3') },
              { step: t('how_4'), detail: t('how_detail_4') },
            ].map(({ step, detail }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 border border-sage-300 dark:border-sage-700 text-sage-600 dark:text-sage-400 rounded-full flex items-center justify-center text-xl font-light mb-4 group-hover:scale-105 transition-transform">
                  {i + 1}
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-bold mb-1">{step}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Free Member Content ──────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-sage-50 dark:bg-navy-800">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('free_content_label')}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('free_content_title')}
          </h2>
          <p className="text-center text-gray-500 dark:text-navy-400 mb-12">{t('free_content_subtitle')}</p>

          {/* Two large clickable boxes → Wellness Library */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Meditation Videos */}
            <Link href="/wellness" className="block group">
              <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 border border-sage-100 dark:border-navy-700 shadow-sm hover:shadow-md hover:border-sage-300 dark:hover:border-sage-700 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-sage-100 dark:bg-sage-900/40 rounded-xl flex items-center justify-center mb-5">
                  <Play className="h-6 w-6 text-sage-600 dark:text-sage-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-sage-700 dark:group-hover:text-sage-400 transition-colors">{t('free_meditation_title')}</h3>
                <p className="text-gray-500 dark:text-navy-300 text-sm mb-5 leading-relaxed">{t('free_meditation_desc')}</p>
                <ul className="space-y-2.5 mb-5">
                  {[t('free_meditation_1'), t('free_meditation_2'), t('free_meditation_3')].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-sage-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-sage-600 dark:text-sage-400 font-semibold">
                  {locale === 'ja' ? 'ライブラリを見る →' : 'View Library →'}
                </p>
              </div>
            </Link>

            {/* Wellness Columns */}
            <Link href="/wellness" className="block group">
              <div className="bg-white dark:bg-navy-900 rounded-2xl p-8 border border-sage-100 dark:border-navy-700 shadow-sm hover:shadow-md hover:border-navy-200 dark:hover:border-navy-500 transition-all cursor-pointer">
                <div className="w-12 h-12 bg-linen-200 dark:bg-navy-700 rounded-xl flex items-center justify-center mb-5">
                  <BookOpen className="h-6 w-6 text-navy-600 dark:text-navy-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">{t('free_column_title')}</h3>
                <p className="text-gray-500 dark:text-navy-300 text-sm mb-5 leading-relaxed">{t('free_column_desc')}</p>
                <ul className="space-y-2.5 mb-5">
                  {[t('free_column_1'), t('free_column_2'), t('free_column_3')].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-navy-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-navy-600 dark:text-sage-400 font-semibold">
                  {locale === 'ja' ? 'ライブラリを見る →' : 'View Library →'}
                </p>
              </div>
            </Link>
          </div>

          {/* Preview content cards: 1 video + 3 articles (oldest) */}
          {(previewVideo || previewArticles.length > 0) && (
            <div className="mb-10">
              <p className="text-xs font-semibold text-gray-400 dark:text-navy-400 uppercase tracking-wider mb-5 text-center">
                {locale === 'ja' ? 'コンテンツをチェック' : 'Browse Content'}
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Video card */}
                {previewVideo && (
                  <Link href={`/wellness/videos/${previewVideo.id}`} className="block group">
                    <div className="bg-white dark:bg-navy-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow h-full">
                      <div className="h-36 relative bg-gradient-to-br from-sage-100 to-linen-100 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center">
                        {previewVideo.thumbnail_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={previewVideo.thumbnail_url}
                            alt={locale === 'ja' ? previewVideo.title_ja : previewVideo.title_en}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : null}
                        <div className="w-10 h-10 bg-white/80 dark:bg-navy-900/80 rounded-full flex items-center justify-center shadow-md relative z-10 group-hover:scale-110 transition-transform">
                          <Play className="h-4 w-4 text-sage-600 dark:text-sage-400 ml-0.5" />
                        </div>
                        {previewVideo.duration_label && (
                          <span className="absolute bottom-2 right-2 text-xs bg-navy-900/60 text-white px-1.5 py-0.5 rounded-full z-10">
                            {previewVideo.duration_label}
                          </span>
                        )}
                        <span className="absolute top-2 left-2 text-xs bg-sage-500/90 text-white px-2 py-0.5 rounded-full z-10 font-medium">
                          {locale === 'ja' ? '動画' : 'Video'}
                        </span>
                      </div>
                      <div className="p-4">
                        {(previewVideo.concerns ?? []).length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-1.5">
                            {(previewVideo.concerns as string[]).slice(0, 2).map((cId: string) => {
                              const c = CONCERNS.find(x => x.id === cId)
                              if (!c) return null
                              return (
                                <span key={c.id} className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sage-700 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 px-1.5 py-0.5 rounded-full">
                                  {c.icon} {locale === 'ja' ? c.ja : c.en}
                                </span>
                              )
                            })}
                          </div>
                        )}
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-sage-700 dark:group-hover:text-sage-400 transition-colors">
                          {locale === 'ja' ? previewVideo.title_ja : previewVideo.title_en}
                        </h3>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Article cards */}
                {previewArticles.map((article: any) => {
                  const coverImage = article.image_urls?.[0] ?? article.cover_image_url ?? null
                  return (
                    <Link key={article.id} href={`/wellness/articles/${article.id}`} className="block group">
                      <div className="bg-white dark:bg-navy-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className="h-36 relative bg-gradient-to-br from-linen-200 to-sage-50 dark:from-navy-800 dark:to-navy-700 flex items-center justify-center overflow-hidden">
                          {coverImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={coverImage}
                              alt={locale === 'ja' ? article.title_ja : article.title_en}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <BookOpen className="h-8 w-8 text-navy-300 dark:text-navy-500" />
                          )}
                          <span className="absolute top-2 left-2 text-xs bg-navy-600/90 text-white px-2 py-0.5 rounded-full z-10 font-medium">
                            {locale === 'ja' ? 'コラム' : 'Article'}
                          </span>
                        </div>
                        <div className="p-4">
                          {(article.concerns ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-1.5">
                              {(article.concerns as string[]).slice(0, 2).map((cId: string) => {
                                const c = CONCERNS.find(x => x.id === cId)
                                if (!c) return null
                                return (
                                  <span key={c.id} className="inline-flex items-center gap-0.5 text-[10px] font-medium text-sage-700 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 px-1.5 py-0.5 rounded-full">
                                    {c.icon} {locale === 'ja' ? c.ja : c.en}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
                            {locale === 'ja' ? article.title_ja : article.title_en}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-10">
            <Link href={user ? '/wellness' : '/register'}>
              <Button size="lg" className="bg-sage-500 hover:bg-sage-600 text-white px-10 py-4 h-auto rounded-full shadow-md">
                {user ? t('free_content_view') : t('free_content_cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Yoga Pose Preview ─────────────────────────────────────────── */}
      {previewPose && (
        <section className="relative z-10 py-20 px-4 bg-linen-50 dark:bg-navy-900">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">
              {locale === 'ja' ? 'ヨガポーズライブラリ' : 'Yoga Pose Library'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
              {locale === 'ja' ? '今日のポーズ' : 'Pose of the Day'}
            </h2>
            <p className="text-center text-gray-500 dark:text-navy-400 mb-10">
              {locale === 'ja'
                ? 'お悩み・難易度・部位から絞り込んで、あなたに合ったポーズを見つけましょう。'
                : 'Filter by concern, difficulty, or pose family to find your perfect pose.'}
            </p>

            <div className="max-w-sm mx-auto">
              <Link href={`/wellness/poses/${previewPose.id}`} className="block group">
                <div className="bg-white dark:bg-navy-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-lg transition-shadow">
                  {/* Image */}
                  {(locale === 'ja' ? (previewPose.image_url_ja ?? previewPose.image_url) : (previewPose.image_url_en ?? previewPose.image_url)) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={locale === 'ja' ? (previewPose.image_url_ja ?? previewPose.image_url) : (previewPose.image_url_en ?? previewPose.image_url)}
                      alt={locale === 'ja' ? previewPose.name_ja : previewPose.name_en}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-linen-100 to-sage-50 dark:from-navy-700 dark:to-navy-800 flex items-center justify-center">
                      <span className="text-7xl">🧘</span>
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs text-sage-600 dark:text-sage-400 font-semibold tracking-wide mb-1">
                      {previewPose.name_sanskrit}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
                      {locale === 'ja' ? previewPose.name_ja : previewPose.name_en}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-navy-300 mb-3">
                      {locale === 'ja' ? previewPose.name_en : previewPose.name_ja}
                    </p>
                    {previewPose.description_ja || previewPose.description_en ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                        {locale === 'ja' ? previewPose.description_ja : previewPose.description_en}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-2 mt-4">
                      {previewPose.pose_family && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-linen-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 border border-linen-200 dark:border-navy-600 font-medium">
                          {(() => { const f = POSE_FAMILIES.find(f => f.value === previewPose.pose_family); return f ? (locale === 'ja' ? f.ja : f.en) : previewPose.pose_family })()}
                        </span>
                      )}
                      {previewPose.difficulty && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          previewPose.difficulty === 'advanced' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : previewPose.difficulty === 'intermediate' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {(() => { const d = DIFFICULTY_LEVELS.find(d => d.value === previewPose.difficulty); return d ? (locale === 'ja' ? d.ja : d.en) : previewPose.difficulty })()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="text-center mt-10">
              <Link href="/wellness/poses">
                <Button size="lg" variant="outline" className="border-navy-300 dark:border-navy-600 text-navy-700 dark:text-navy-200 px-8 py-3 h-auto rounded-full hover:bg-navy-50 dark:hover:bg-navy-800">
                  {locale === 'ja' ? 'ポーズライブラリを見る' : 'View Pose Library'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('testimonials_label')}</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            {t('testimonials_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { quote: t('t1_quote'), name: t('t1_name'), role: t('t1_role'), stars: 5 },
              { quote: t('t2_quote'), name: t('t2_name'), role: t('t2_role'), stars: 5 },
              { quote: t('t3_quote'), name: t('t3_name'), role: t('t3_role'), stars: 5 },
            ].map(({ quote, name, role, stars }) => (
              <div key={name} className="bg-white dark:bg-navy-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-navy-700">
                <div className="text-5xl text-sage-100 dark:text-sage-900 font-serif leading-none mb-3 select-none">"</div>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-sm">
                  "{quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sage-100 dark:bg-sage-900/40 flex items-center justify-center text-sage-700 dark:text-sage-300 font-bold text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{name}</p>
                    <p className="text-xs text-gray-400">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Instructors ─────────────────────────────────────── */}
      {instructors.length > 0 && (
        <section className="relative z-10 py-20 px-4 bg-sage-50 dark:bg-navy-900">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('instructors_label')}</p>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
              {t('instructors_title')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor: any) => (
                <Link key={instructor.id} href={`/instructors/${instructor.id}`} className="block">
                  <div className="border border-gray-200 dark:border-navy-700 rounded-2xl p-4 sm:p-6 hover:shadow-lg hover:border-navy-200 dark:hover:border-navy-500 transition-all cursor-pointer group bg-white dark:bg-navy-800">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-100 to-sage-100 dark:from-navy-700 dark:to-sage-900/40 flex items-center justify-center text-navy-600 dark:text-navy-200 text-lg font-bold flex-shrink-0">
                        {instructor.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors break-words">
                          {instructor.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {instructor.instructor_profiles?.rating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">
                            {t('years_exp_short', { count: instructor.instructor_profiles?.years_experience || 0 })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {instructor.instructor_profiles?.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
                        {instructor.instructor_profiles.bio}
                      </p>
                    )}
                    {instructor.instructor_profiles?.yoga_styles?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {instructor.instructor_profiles.yoga_styles.slice(0, 3).map((s: string) => (
                          <span
                            key={s}
                            className="text-xs bg-sage-50 dark:bg-sage-900/30 text-sage-700 dark:text-sage-300 px-2 py-1 rounded-full border border-sage-100 dark:border-sage-800"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/instructors">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-navy-300 dark:border-navy-500 text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800 rounded-full px-8"
                >
                  {t('instructors_btn')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-br from-linen-200 to-sage-50 dark:from-navy-800 dark:to-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">{t('pricing_label')}</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('pricing_title')}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">{t('pricing_subtitle')}</p>
          <div className="grid sm:grid-cols-3 gap-6">

            {/* Trial */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-navy-700 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{t('pricing_trial')}</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                ¥0
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t('pricing_trial_sessions')}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[t('trial_f1'), t('trial_f2'), t('trial_f3'), t('trial_f4')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle className="h-4 w-4 text-sage-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full bg-navy-600 hover:bg-navy-700 text-white rounded-full">
                  {t('cta_start')}
                </Button>
              </Link>
            </div>

            {/* Monthly */}
            <div className="bg-navy-600 dark:bg-navy-700 rounded-2xl p-8 border border-navy-600 shadow-xl relative overflow-hidden flex flex-col scale-105">
              <div className="absolute top-4 right-4 bg-sage-400 text-navy-900 text-xs font-bold px-3 py-1 rounded-full">
                {t('pricing_monthly_badge')}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('pricing_monthly')}</h3>
              <p className="text-4xl font-extrabold text-white mb-1">
                $19.99
              </p>
              <p className="text-sm text-navy-200 mb-6">{t('pricing_monthly_period')}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[t('monthly_f1'), t('monthly_f2'), t('monthly_f3'), t('monthly_f4')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 text-sage-300 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full bg-white text-navy-600 hover:bg-linen-100 rounded-full font-bold">
                  {t('pricing_monthly_btn')}
                </Button>
              </Link>
            </div>

            {/* Premium (Coming soon) */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 border-2 border-dashed border-gray-200 dark:border-navy-600 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> {t('pricing_premium_badge')}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{t('pricing_premium')}</h3>
              <p className="text-4xl font-extrabold text-gray-400 dark:text-gray-500 mb-1">
                ¥—
              </p>
              <p className="text-sm text-gray-400 mb-6">{t('pricing_premium_coming')}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[t('premium_f1'), t('premium_f2'), t('premium_f3'), t('premium_f4')].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full rounded-full bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-navy-700 dark:text-navy-400">
                {t('pricing_premium_btn')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 py-24 px-4 bg-navy-700 dark:bg-navy-900">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-sage-300 mx-auto mb-6" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 leading-tight break-keep">
            {t('final_cta_title')}
          </h2>
          <p className="text-navy-200 text-lg mb-10">
            {t('final_cta_subtitle')}
          </p>
          <Link href={user ? '/instructors' : '/register'}>
            <Button
              size="lg"
              className="bg-white text-navy-700 hover:bg-linen-100 px-12 py-4 text-lg h-auto rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              {t('final_cta_btn')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Instructor CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-0 bg-linen-50 dark:bg-navy-900 border-t border-sage-100 dark:border-navy-800 overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center">
          {/* Image */}
          <div className="w-full md:w-1/2 flex-shrink-0">
            <Image
              src="/yogainstructor_airi.png"
              alt="Airi Yukiyoshi – Yoga Instructor"
              width={1440}
              height={816}
              className="w-full h-80 md:h-full object-cover object-right-top"
            />
          </div>
          {/* Text */}
          <div className="w-full md:w-1/2 px-8 py-12 md:px-16 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('instructor_cta_title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">{t('instructor_cta_desc')}</p>
            <Link href="/register?role=instructor">
              <Button
                size="lg"
                variant="outline"
                className="border-navy-300 dark:border-navy-500 text-navy-700 dark:text-navy-200 hover:bg-navy-50 dark:hover:bg-navy-800 px-8 rounded-full"
              >
                {t('instructor_cta_btn')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
