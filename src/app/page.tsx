import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import {
  CheckCircle, Star, Video, Clock, Heart, Sparkles, Globe,
  Play, BookOpen, ArrowRight, Award, Leaf,
} from 'lucide-react'
import { CONCERNS } from '@/lib/concerns'
import { POSE_FAMILIES, DIFFICULTY_LEVELS } from '@/lib/poses'
import { AnimatedCounter } from '@/components/landing/AnimatedCounter'

export const metadata = {
  title: 'Reset Yoga — Live Yoga with World-Class Instructors',
  description:
    'Connect with certified yoga instructors from India, Japan and beyond. 2 free sessions. Reset your body and mind in 45 minutes.',
  openGraph: {
    title: 'Reset Yoga — Live Yoga with World-Class Instructors',
    description:
      'Live 1-on-1 yoga with certified instructors. Start with 2 free sessions — no commitment.',
    images: [{ url: '/toppage_hero.png', width: 1200, height: 630 }],
    type: 'website',
    url: 'https://tryresetyoga.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reset Yoga — Live Yoga with World-Class Instructors',
    description: '2 free sessions. Certified instructors from India, Japan & beyond.',
    images: ['/toppage_hero.png'],
  },
}

const SECOND_INSTRUCTOR_ID = '5ea101c5-e9dc-48be-b347-f6769f219b55'

const normalizeDigits = (s: string) =>
  s.replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0))

const inferYearsExperience = (profile: {
  years_experience?: number | null
  bio?: string | null
  tagline?: string | null
  career_history?: string | null
}) => {
  const direct = Number(profile.years_experience ?? 0)
  if (Number.isFinite(direct) && direct > 0) return direct
  const text = normalizeDigits(
    `${profile.bio ?? ''} ${profile.tagline ?? ''} ${profile.career_history ?? ''}`
  )
  const mEn = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i)
  if (mEn) return Number(mEn[1])
  const mJa = text.match(/(\d{1,2})\s*年/)
  if (mJa) return Number(mJa[1])
  return 0
}

type FeaturedInstructor = {
  id: string
  full_name: string | null
  avatar_url?: string | null
  avatar_position?: string | null
  avatar_zoom?: number | null
  created_at?: string | null
  instructor_profiles: {
    id?: string
    is_approved?: boolean
    years_experience?: number | null
    bio?: string | null
    tagline?: string | null
    career_history?: string | null
    certifications?: string[] | null
    rating?: number | null
    yoga_styles?: string[] | null
  } | null
}

const displayYears = (instructor: FeaturedInstructor) =>
  inferYearsExperience(instructor.instructor_profiles ?? {})

export default async function LandingPage() {
  const t = await getTranslations('landing')

  let profile: Profile | null = null
  let instructors: FeaturedInstructor[] = []
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

    const adminSupabase = await createAdminClient()

    const { data: instructorData } = await adminSupabase
      .from('profiles')
      .select('*, instructor_profiles(*)')
      .eq('role', 'instructor')
      .eq('instructor_profiles.is_approved', true)
      .order('created_at', { ascending: true })
      .limit(200)

    const approvedInstructors = (
      instructorData?.filter(
        (i) => i.instructor_profiles && (i.full_name || '').trim().length > 0
      ) || []
    ) as FeaturedInstructor[]

    let second = approvedInstructors.find((i) => i.id === SECOND_INSTRUCTOR_ID) ?? null

    if (!second) {
      const { data: secondData } = await adminSupabase
        .from('profiles')
        .select('*, instructor_profiles(*)')
        .eq('id', SECOND_INSTRUCTOR_ID)
        .single()
      if (secondData && (secondData.full_name || '').trim().length > 0) {
        second = secondData as FeaturedInstructor
      }
    }

    const first = approvedInstructors.find((i) => i.id !== SECOND_INSTRUCTOR_ID) ?? null
    instructors = [first, second].filter((v): v is FeaturedInstructor => Boolean(v))

    const cookieStore = await cookies()
    locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

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
        .select(
          'id, name_sanskrit, name_en, name_ja, image_url_ja, image_url_en, image_url, description_ja, description_en, pose_family, difficulty, concerns, access_level'
        )
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

  const isJa = locale === 'ja'

  return (
    <div className="min-h-screen">
      <Navbar user={profile} />

      {/* ── Fixed Hero Background ─────────────────────────────────────── */}
      <div className="fixed top-0 left-0 w-full h-screen -z-10">
        <Image
          src="/toppage_hero.png"
          alt="Woman practicing yoga online at home"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/65 via-navy-900/45 to-navy-900/75" />
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100svh-72px)] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-sage-400/8 rounded-full blur-3xl pointer-events-none -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-navy-300/8 rounded-full blur-3xl pointer-events-none translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 text-white px-5 py-2.5 rounded-full text-sm font-medium mb-8">
            <Heart className="h-4 w-4 fill-rose-300 text-rose-300" />
            {t('eyebrow')}
          </div>

          {/* Main headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-extrabold text-white leading-[1.08] mb-6 drop-shadow-2xl font-[family-name:var(--font-playfair)] tracking-tight">
            {t('hero_title')}
          </h1>

          <p className="text-xl sm:text-2xl text-white/85 mb-4 max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <p className="text-white/55 text-sm mb-12">{t('hero_tagline')}</p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href={user ? '/instructors' : '/register'}>
              <Button
                size="lg"
                className="bg-white text-navy-700 hover:bg-linen-100 px-12 py-5 text-lg h-auto rounded-full shadow-2xl hover:shadow-3xl transition-all font-bold"
              >
                {t('cta_start')} →
              </Button>
            </Link>
            <Link href="/instructors">
              <Button
                size="lg"
                className="border-2 border-white/60 text-white bg-transparent hover:bg-white/15 px-12 py-5 text-lg h-auto rounded-full backdrop-blur-sm transition-all"
              >
                {t('cta_browse')}
              </Button>
            </Link>
          </div>

          {/* Trust pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                icon: <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />,
                text: t('trust_rating'),
              },
              {
                icon: <CheckCircle className="h-4 w-4 text-sage-300" />,
                text: t('trust_certified'),
              },
              {
                icon: <Globe className="h-4 w-4 text-blue-200" />,
                text: t('trust_global'),
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-black/25 backdrop-blur-sm border border-white/20 text-white/85 px-4 py-2 rounded-full text-sm"
              >
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1 h-2.5 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 2. IMPACT NUMBERS                                              */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-navy-900 py-20 relative overflow-hidden">
        {/* Subtle dot grid texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4">
          <p className="text-sage-400 text-xs font-bold tracking-[0.2em] uppercase text-center mb-14">
            {t('impact_label')}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {[
              { target: 12000, suffix: '+', label: t('impact_1_label'), decimals: 0 },
              { target: 45, suffix: '+', label: t('impact_2_label'), decimals: 0 },
              { target: 98, suffix: '%', label: t('impact_3_label'), decimals: 0 },
              { target: 4.9, suffix: '★', label: t('impact_4_label'), decimals: 1 },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl sm:text-6xl font-extrabold text-white mb-3 font-[family-name:var(--font-playfair)]">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    decimals={stat.decimals}
                  />
                </div>
                <div className="w-8 h-0.5 bg-sage-500 mx-auto mb-3" />
                <p className="text-sage-300/80 text-sm leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 3. MANIFESTO / MISSION                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-linen-50 py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-sage-400 to-transparent mx-auto mb-12" />
          <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-6">
            {t('mission_label')}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-800 leading-tight mb-6 font-[family-name:var(--font-playfair)]">
            {t('manifesto_line1')}
          </h2>
          <p className="text-xl sm:text-2xl text-navy-700 max-w-3xl mx-auto leading-relaxed mb-8 font-[family-name:var(--font-playfair)]">
            {t('manifesto_line2')}
          </p>
          <p className="text-base sm:text-lg text-navy-700/90 max-w-4xl mx-auto leading-relaxed">
            {t('mission_body')}
          </p>
          <div className="w-px h-20 bg-gradient-to-b from-sage-400 via-sage-300 to-transparent mx-auto mt-12" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 4. PAIN → TRANSFORMATION                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-sage-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('pain_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 leading-tight font-[family-name:var(--font-playfair)] max-w-3xl mx-auto">
              {t('pain_title')}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Pain points */}
            <div className="space-y-4">
              {[t('pain_1'), t('pain_2'), t('pain_3'), t('pain_4')].map((pain, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-sage-100"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-rose-400 text-sm font-bold">✕</span>
                  </div>
                  <p className="text-navy-700 leading-relaxed">{pain}</p>
                </div>
              ))}
              <div className="pt-4 pl-2">
                <p className="text-navy-600 font-medium">{t('pain_cta')}</p>
                <p className="text-sage-700 font-bold text-lg mt-1">{t('pain_cta_highlight')}</p>
              </div>
            </div>

            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <Image
                src="/yoga_before_after.png"
                alt="Yoga transformation"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-white font-bold text-xl font-[family-name:var(--font-playfair)]">
                  {t('pain_cta_highlight')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 5. FEATURES                                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-linen-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('features_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
              {t('features_title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award className="h-7 w-7 text-sage-600" />,
                bg: 'bg-sage-50 border-sage-200',
                title: t('feature_1_title'),
                desc: t('feature_1_desc'),
              },
              {
                icon: <Clock className="h-7 w-7 text-navy-600" />,
                bg: 'bg-navy-50 border-navy-100',
                title: t('feature_2_title'),
                desc: t('feature_2_desc'),
              },
              {
                icon: <Video className="h-7 w-7 text-rose-500" />,
                bg: 'bg-rose-50 border-rose-100',
                title: t('feature_3_title'),
                desc: t('feature_3_desc'),
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 shadow-sm border border-linen-200 hover:shadow-md transition-shadow group"
              >
                <div
                  className={`w-14 h-14 ${f.bg} border rounded-2xl flex items-center justify-center mb-6`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-navy-800 mb-3">{f.title}</h3>
                <p className="text-navy-600/65 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 6. GLOBAL COMMUNITY                                            */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-navy-800 py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sage-400/40 to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-400 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('global_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4 font-[family-name:var(--font-playfair)]">
              {t('global_title')}
            </h2>
            <p className="text-navy-300 text-lg max-w-2xl mx-auto">{t('global_subtitle')}</p>
          </div>

          {/* Country flags cloud */}
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            {[
              '🇯🇵', '🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷',
              '🇧🇷', '🇸🇬', '🇰🇷', '🇹🇭', '🇳🇿', '🇮🇩', '🇲🇾', '🇵🇭',
              '🇿🇦', '🇸🇪', '🇳🇱', '🇦🇪',
            ].map((flag, i) => (
              <div
                key={i}
                className="w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-2xl hover:bg-white/20 transition-colors cursor-default"
                title={flag}
              >
                {flag}
              </div>
            ))}
            <div className="w-12 h-12 bg-sage-500/30 border border-sage-400/30 rounded-full flex items-center justify-center text-sage-300 text-xs font-bold">
              +25
            </div>
          </div>

          <div className="text-center">
            <Link href={user ? '/instructors' : '/register'}>
              <Button className="bg-sage-500 hover:bg-sage-400 text-white px-10 py-4 rounded-full text-base h-auto font-semibold shadow-lg hover:shadow-xl transition-all">
                {t('global_cta')} →
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 7. HOW IT WORKS                                                */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-linen-100 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('how_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
              {t('how_title')}
            </h2>
            <p className="text-navy-500/60 mt-3">{t('how_subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: '01',
                step: t('how_1'),
                detail: t('how_detail_1'),
                bg: 'bg-sage-50 border-sage-200',
              },
              {
                num: '02',
                step: t('how_2'),
                detail: t('how_detail_2'),
                bg: 'bg-white border-linen-200',
              },
              {
                num: '03',
                step: t('how_3'),
                detail: t('how_detail_3'),
                bg: 'bg-sage-50 border-sage-200',
              },
              {
                num: '04',
                step: t('how_4'),
                detail: t('how_detail_4'),
                bg: 'bg-white border-linen-200',
              },
            ].map((s, i) => (
              <div key={i} className={`relative ${s.bg} border rounded-3xl p-7`}>
                <div className="text-4xl font-extrabold text-navy-200 mb-4 font-[family-name:var(--font-playfair)]">
                  {s.num}
                </div>
                <h3 className="font-bold text-navy-800 mb-2 leading-snug">{s.step}</h3>
                <p className="text-sm text-navy-500/65">{s.detail}</p>
                {i < 3 && (
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-navy-300 hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 8. FEATURED INSTRUCTORS                                        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {instructors.length > 0 && (
        <section className="bg-linen-50 py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-14">
              <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                {t('instructors_label')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
                {t('instructors_title')}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {instructors.map((instructor) => {
                const years = displayYears(instructor)
                const styles = instructor.instructor_profiles?.yoga_styles?.slice(0, 3) ?? []
                const rating = instructor.instructor_profiles?.rating
                const certifications = instructor.instructor_profiles?.certifications ?? []
                const tagline = instructor.instructor_profiles?.tagline ?? ''
                const avatarUrl = instructor.avatar_url
                const avatarPosition = instructor.avatar_position ?? 'center'
                const avatarZoom = instructor.avatar_zoom ?? 1

                return (
                  <Link key={instructor.id} href={`/instructors/${instructor.id}`} className="group">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-linen-200 hover:shadow-xl transition-all hover:-translate-y-1.5 duration-300">
                      {/* Photo */}
                      <div className="relative h-60 bg-sage-100 overflow-hidden">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt={instructor.full_name ?? 'Instructor'}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            style={{
                              objectPosition: avatarPosition,
                              transform: `scale(${avatarZoom})`,
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sage-200 to-linen-200">
                            <span className="text-6xl font-bold text-sage-600 font-[family-name:var(--font-playfair)]">
                              {(instructor.full_name ?? 'I')[0]}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/65 to-transparent" />
                        {rating && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-navy-800">
                              {rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                        <div className="absolute bottom-4 left-5 right-5">
                          <p className="text-white font-bold text-xl font-[family-name:var(--font-playfair)] drop-shadow">
                            {instructor.full_name}
                          </p>
                          {tagline && (
                            <p className="text-white/75 text-sm mt-1 line-clamp-1">{tagline}</p>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-4">
                          {years > 0 && (
                            <span className="px-3 py-1 bg-sage-50 text-sage-700 text-xs font-semibold rounded-full border border-sage-200">
                              {t('years_exp_short', { count: years })}
                            </span>
                          )}
                          {styles.map((style, j) => (
                            <span
                              key={j}
                              className="px-3 py-1 bg-linen-100 text-navy-600 text-xs rounded-full border border-linen-200"
                            >
                              {style}
                            </span>
                          ))}
                        </div>
                        {certifications.length > 0 && (
                          <p className="text-xs text-navy-500/55 mb-4 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-sage-500 flex-shrink-0" />
                            <span className="line-clamp-1">{certifications[0]}</span>
                          </p>
                        )}
                        <div className="flex items-center text-sage-600 text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                          {isJa ? 'プロフィールを見る' : 'View Profile'}
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="text-center">
              <Link href="/instructors">
                <Button className="bg-navy-700 hover:bg-navy-600 text-white px-10 py-3.5 rounded-full text-base h-auto font-semibold shadow-md hover:shadow-lg transition-all">
                  {t('instructors_btn')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 9. TESTIMONIALS (6 cards)                                      */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-sage-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('testimonials_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
              {t('testimonials_title')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                quote: t('t1_quote'),
                name: t('t1_name'),
                role: t('t1_role'),
                bg: 'bg-white border border-linen-200',
                dark: false,
                accent: 'text-sage-600',
              },
              {
                quote: t('t2_quote'),
                name: t('t2_name'),
                role: t('t2_role'),
                bg: 'bg-navy-800',
                dark: true,
                accent: 'text-sage-300',
              },
              {
                quote: t('t3_quote'),
                name: t('t3_name'),
                role: t('t3_role'),
                bg: 'bg-white border border-linen-200',
                dark: false,
                accent: 'text-sage-600',
              },
              {
                quote: t('t4_quote'),
                name: t('t4_name'),
                role: t('t4_role'),
                bg: 'bg-sage-700',
                dark: true,
                accent: 'text-sage-200',
              },
              {
                quote: t('t5_quote'),
                name: t('t5_name'),
                role: t('t5_role'),
                bg: 'bg-white border border-linen-200',
                dark: false,
                accent: 'text-sage-600',
              },
              {
                quote: t('t6_quote'),
                name: t('t6_name'),
                role: t('t6_role'),
                bg: 'bg-linen-200 border border-linen-300',
                dark: false,
                accent: 'text-sage-700',
              },
            ].map((item, i) => (
              <div key={i} className={`${item.bg} rounded-3xl p-7 shadow-sm`}>
                <div
                  className={`text-5xl leading-none mb-4 font-serif ${item.dark ? 'text-white/15' : 'text-sage-200'}`}
                >
                  &ldquo;
                </div>
                <p
                  className={`leading-relaxed mb-6 text-sm ${item.dark ? 'text-white/90' : 'text-navy-700'}`}
                >
                  {item.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${item.dark ? 'bg-white/20' : 'bg-sage-100'} flex items-center justify-center flex-shrink-0`}
                  >
                    <span
                      className={`font-bold text-sm ${item.dark ? 'text-white' : 'text-sage-700'}`}
                    >
                      {item.name[0]}
                    </span>
                  </div>
                  <div>
                    <p
                      className={`font-bold text-sm ${item.dark ? 'text-white' : 'text-navy-800'}`}
                    >
                      {item.name}
                    </p>
                    <p className={`text-xs ${item.accent}`}>{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 10. FREE CONTENT LIBRARY                                       */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-linen-50 py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('free_content_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)] max-w-2xl mx-auto leading-tight">
              {t('free_content_title')}
            </h2>
            <p className="text-navy-500/55 mt-4 max-w-xl mx-auto">{t('free_content_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Meditation videos card */}
            <Link
              href="/wellness?tab=videos"
              className="group bg-gradient-to-br from-navy-800 to-navy-900 rounded-3xl p-8 text-white hover:from-navy-700 hover:to-navy-800 transition-all shadow-lg hover:shadow-xl"
            >
              <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center mb-6">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 font-[family-name:var(--font-playfair)]">
                {t('free_meditation_title')}
              </h3>
              <p className="text-white/65 text-sm leading-relaxed mb-6">
                {t('free_meditation_desc')}
              </p>
              <ul className="space-y-2 mb-6">
                {[t('free_meditation_1'), t('free_meditation_2'), t('free_meditation_3')].map(
                  (item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                      <div className="w-1.5 h-1.5 bg-sage-400 rounded-full flex-shrink-0" />
                      {item}
                    </li>
                  )
                )}
              </ul>
              <div className="flex items-center gap-1 text-sage-300 text-sm font-semibold group-hover:gap-2 transition-all">
                {isJa ? '動画を見る' : 'View Videos'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Wellness columns card */}
            <Link
              href="/wellness"
              className="group bg-white border border-linen-200 rounded-3xl p-8 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-sage-50 border border-sage-200 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-6 w-6 text-sage-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-800 mb-3 font-[family-name:var(--font-playfair)]">
                {t('free_column_title')}
              </h3>
              <p className="text-navy-500/65 text-sm leading-relaxed mb-6">
                {t('free_column_desc')}
              </p>
              <ul className="space-y-2 mb-6">
                {[t('free_column_1'), t('free_column_2'), t('free_column_3')].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-navy-600">
                    <div className="w-1.5 h-1.5 bg-sage-500 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-1 text-sage-600 text-sm font-semibold group-hover:gap-2 transition-all">
                {isJa ? 'コラムを読む' : 'Read Articles'}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Dynamic preview cards */}
          {(previewVideo || previewArticles.length > 0) && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {previewVideo && (() => {
                const videoTitle = isJa ? previewVideo.title_ja : previewVideo.title_en
                const concern = CONCERNS.find((c) => previewVideo.concerns?.includes(c.id))
                return (
                  <Link
                    href="/wellness?tab=videos"
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-linen-200 hover:shadow-md transition-all"
                  >
                    <div className="relative h-32 bg-navy-100">
                      {previewVideo.thumbnail_url ? (
                        <Image
                          src={previewVideo.thumbnail_url}
                          alt={videoTitle ?? ''}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-700 to-navy-900">
                          <Play className="h-10 w-10 text-white/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-navy-900/30 group-hover:bg-navy-900/15 transition-colors" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
                          <Play className="h-4 w-4 text-navy-700 ml-0.5" />
                        </div>
                      </div>
                      {previewVideo.duration_label && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                          {previewVideo.duration_label}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      {concern && (
                        <span className="text-xs text-sage-600 font-medium">
                          {isJa ? concern.ja : concern.en}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-navy-800 line-clamp-2 mt-1">
                        {videoTitle}
                      </p>
                    </div>
                  </Link>
                )
              })()}

              {previewArticles.map((article: any) => {
                const articleTitle = isJa ? article.title_ja : article.title_en
                const concern = CONCERNS.find((c) => article.concerns?.includes(c.id))
                const img = article.cover_image_url || article.image_urls?.[0]
                return (
                  <Link
                    key={article.id}
                    href={`/wellness/articles/${article.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-linen-200 hover:shadow-md transition-all"
                  >
                    {img ? (
                      <div className="relative h-32 bg-sage-100">
                        <Image
                          src={img}
                          alt={articleTitle ?? ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-gradient-to-br from-sage-100 to-linen-200 flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-sage-400" />
                      </div>
                    )}
                    <div className="p-4">
                      {concern && (
                        <span className="text-xs text-sage-600 font-medium">
                          {isJa ? concern.ja : concern.en}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-navy-800 line-clamp-2 mt-1">
                        {articleTitle}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/wellness">
              <Button
                variant="outline"
                className="border-2 border-sage-300 text-sage-700 hover:bg-sage-50 px-8 py-3 rounded-full h-auto"
              >
                {t('free_content_view')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 11. YOGA POSE PREVIEW                                          */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      {previewPose && (() => {
        const imgUrl = isJa
          ? previewPose.image_url_ja || previewPose.image_url
          : previewPose.image_url_en || previewPose.image_url
        const poseName = isJa ? previewPose.name_ja : previewPose.name_en
        const poseDesc = isJa ? previewPose.description_ja : previewPose.description_en
        const poseFamily = POSE_FAMILIES.find((f) => f.value === previewPose.pose_family)
        const difficulty = DIFFICULTY_LEVELS.find((d) => d.value === previewPose.difficulty)
        return (
          <section className="bg-linen-100 py-20">
            <div className="max-w-5xl mx-auto px-4">
              <div className="text-center mb-10">
                <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                  {t('pose_section_label')}
                </p>
                <h2 className="text-3xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
                  {t('pose_section_title')}
                </h2>
              </div>

              <Link href="/poses" className="group block max-w-3xl mx-auto">
                <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-linen-200">
                  <div className="grid sm:grid-cols-2">
                    <div className="relative h-64 sm:h-auto bg-sage-50 flex items-center justify-center p-8">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={poseName ?? ''}
                          fill
                          className="object-contain p-8 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <Leaf className="h-20 w-20 text-sage-300" />
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      {previewPose.name_sanskrit && (
                        <p className="text-sage-500 text-sm font-medium italic mb-2">
                          {previewPose.name_sanskrit}
                        </p>
                      )}
                      <h3 className="text-2xl font-extrabold text-navy-800 mb-3 font-[family-name:var(--font-playfair)]">
                        {poseName}
                      </h3>
                      <div className="flex gap-2 mb-4 flex-wrap">
                        {poseFamily && (
                          <span className="px-3 py-1 bg-sage-50 text-sage-700 text-xs rounded-full border border-sage-200">
                            {isJa ? poseFamily.ja : poseFamily.en}
                          </span>
                        )}
                        {difficulty && (
                          <span className="px-3 py-1 bg-linen-100 text-navy-600 text-xs rounded-full border border-linen-200">
                            {isJa ? difficulty.ja : difficulty.en}
                          </span>
                        )}
                      </div>
                      {poseDesc && (
                        <p className="text-navy-600/65 text-sm leading-relaxed line-clamp-3 mb-6">
                          {poseDesc}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-sage-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        {isJa ? 'ポーズを探索する' : 'Explore Poses'}
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </section>
        )
      })()}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 12. PRICING                                                    */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-b from-linen-200 to-sage-50 py-24">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
              {t('pricing_label')}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 font-[family-name:var(--font-playfair)]">
              {t('pricing_title')}
            </h2>
            <p className="text-navy-500/55 mt-3">{t('pricing_subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Free Trial */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-linen-200">
              <p className="text-sage-600 font-semibold text-sm mb-2">{t('pricing_trial')}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-navy-800">¥0</span>
              </div>
              <p className="text-navy-500/55 text-sm mb-6">{t('pricing_trial_desc')}</p>
              <Link href={user ? '/instructors' : '/register'}>
                <Button className="w-full bg-navy-700 hover:bg-navy-600 text-white rounded-full py-3 h-auto">
                  {t('cta_start')}
                </Button>
              </Link>
              <ul className="mt-6 space-y-3">
                {[t('trial_f1'), t('trial_f2'), t('trial_f3'), t('trial_f4')].map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-600">
                    <CheckCircle className="h-4 w-4 text-sage-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Monthly — Popular */}
            <div className="bg-navy-800 rounded-3xl p-8 shadow-xl relative ring-2 ring-sage-400 -mt-4 md:-mt-6 -mb-4 md:-mb-6">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-bold px-5 py-1.5 rounded-full whitespace-nowrap">
                {t('pricing_monthly_badge')}
              </div>
              <p className="text-sage-300 font-semibold text-sm mb-2">{t('pricing_monthly')}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-white">$19.99</span>
                <span className="text-white/45 text-sm">{t('pricing_monthly_period')}</span>
              </div>
              <p className="text-white/45 text-sm mb-6">{t('pricing_monthly_desc')}</p>
              <Link href={user ? '/subscription' : '/register'}>
                <Button className="w-full bg-sage-500 hover:bg-sage-400 text-white rounded-full py-3 h-auto font-bold">
                  {t('pricing_monthly_btn')}
                </Button>
              </Link>
              <ul className="mt-6 space-y-3">
                {[t('monthly_f1'), t('monthly_f2'), t('monthly_f3'), t('monthly_f4')].map(
                  (f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-sage-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Premium — Coming Soon */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-linen-200 opacity-70">
              <div className="inline-block bg-linen-200 text-navy-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                {t('pricing_premium_badge')}
              </div>
              <p className="text-navy-400 font-semibold text-sm mb-2">{t('pricing_premium')}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold text-navy-300">
                  {t('pricing_premium_tbd')}
                </span>
              </div>
              <p className="text-navy-400/50 text-sm mb-6">{t('pricing_premium_coming')}</p>
              <Button
                disabled
                className="w-full bg-navy-100 text-navy-400 rounded-full py-3 h-auto cursor-not-allowed"
              >
                {t('pricing_premium_btn')}
              </Button>
              <ul className="mt-6 space-y-3">
                {[t('premium_f1'), t('premium_f2'), t('premium_f3'), t('premium_f4')].map(
                  (f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-navy-400">
                      <CheckCircle className="h-4 w-4 text-navy-300 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 13. SHARE / VIRAL CTA                                         */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-sage-700 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-8 w-8 text-white fill-white" />
          </div>
          <p className="text-sage-200 text-xs font-bold tracking-[0.2em] uppercase mb-4">
            {t('share_label')}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-4 font-[family-name:var(--font-playfair)]">
            {t('share_title')}
          </h2>
          <p className="text-sage-100/75 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {t('share_subtitle')}
          </p>
          <Link href={user ? '/dashboard' : '/register'}>
            <Button className="bg-white text-sage-800 hover:bg-linen-50 px-10 py-4 rounded-full text-base h-auto font-bold shadow-xl hover:shadow-2xl transition-all">
              {t('share_btn')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 14. FINAL CTA                                                  */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-navy-700 py-28">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sparkles className="h-10 w-10 text-sage-300 mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 font-[family-name:var(--font-playfair)]">
            {t('final_cta_title')}
          </h2>
          <p className="text-white/55 text-lg mb-12 max-w-xl mx-auto">{t('final_cta_subtitle')}</p>
          <Link href={user ? '/instructors' : '/register'}>
            <Button
              size="lg"
              className="bg-white text-navy-700 hover:bg-linen-100 px-14 py-5 text-xl h-auto rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all"
            >
              {t('final_cta_btn')}
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* 15. INSTRUCTOR RECRUITMENT                                     */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <section className="bg-linen-50 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2">
            <div className="relative h-72 lg:h-auto min-h-[320px] overflow-hidden">
              <Image
                src="/yogainstructor_airi.png"
                alt="Yoga instructor teaching online"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-navy-900/20" />
            </div>
            <div className="p-12 lg:p-16 xl:p-20 flex flex-col justify-center bg-linen-100">
              <p className="text-sage-600 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                For Instructors
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-800 leading-tight mb-4 font-[family-name:var(--font-playfair)]">
                {t('instructor_cta_title')}
              </h2>
              <p className="text-navy-600/65 mb-8 leading-relaxed">{t('instructor_cta_desc')}</p>
              <Link href="/register?role=instructor" className="w-fit">
                <Button className="bg-navy-700 hover:bg-navy-600 text-white px-10 py-4 rounded-full h-auto font-semibold shadow-md hover:shadow-lg transition-all">
                  {t('instructor_cta_btn')} →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
