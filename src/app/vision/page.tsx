import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ArrowRight, Leaf, Globe, Sparkles, Heart, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Vision | Reset Yoga',
  description:
    'Reset Yogaのビジョン — 世界中の人々に、ウェルネスを届ける。誰でも、どこでも、いつでも自分に合ったヨガと出会える世界を目指します。',
}

const VALUES = [
  {
    icon: Globe,
    title: { en: 'Wellness for everyone', ja: 'ウェルネスは、すべての人のもの' },
    body: {
      en: 'Wellness is not a privilege. It belongs to every person, regardless of where they live, how much they earn, or what their body looks like.',
      ja: 'ウェルネスは特権ではありません。どこに住んでいても、収入が多くても少なくても、どんな体型であっても、すべての人のものです。',
    },
  },
  {
    icon: Sparkles,
    title: { en: 'Quality without intimidation', ja: '本格的でありながら、親しみやすく' },
    body: {
      en: 'Authentic, high-quality yoga — made accessible. No judgment, no performance, no perfection required.',
      ja: '本物の質の高いヨガを、もっと身近に。評価もなく、見せ場もなく、完璧さも不要です。',
    },
  },
  {
    icon: RefreshCw,
    title: { en: 'Practice for real life', ja: '現実の暮らしに寄り添うPractice' },
    body: {
      en: 'Yoga that fits around your life — not the other way around. At home, while traveling, on a lunch break.',
      ja: 'あなたの生活に合わせるヨガ、逆ではありません。自宅でも、旅先でも、昼休みでも。',
    },
  },
  {
    icon: Heart,
    title: { en: 'Personal, not one-size-fits-all', ja: '一人ひとりに合うウェルネス' },
    body: {
      en: 'Your body, your goals, your pace. A practice that truly sees you as an individual.',
      ja: 'あなたの体、あなたの目標、あなたのペース。あなたを個人として本当に見てくれるPractice。',
    },
  },
  {
    icon: Leaf,
    title: { en: 'Consistency over perfection', ja: '完璧さより、続けられること' },
    body: {
      en: 'A quiet 20 minutes you keep is worth more than a perfect class you skip. Sustainable practice, above all else.',
      ja: '続けられる静かな20分は、完璧なクラスをスキップするより価値があります。何よりも、続けられること。',
    },
  },
]

export default async function VisionPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'
  const ja = locale === 'ja'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* ── 1. Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-linen-50 dark:bg-navy-900">
        {/* Subtle decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-sage-100/60 dark:bg-sage-900/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-[400px] h-[400px] rounded-full bg-linen-200/80 dark:bg-navy-800/60 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-24 sm:pt-36 sm:pb-32">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-8">
            {ja ? 'Reset Yoga — Vision' : 'Reset Yoga — Vision'}
          </p>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-navy-900 dark:text-white leading-[1.05] tracking-tight max-w-3xl mb-8">
            {ja ? (
              <>
                世界中の人々に、
                <br />
                ウェルネスを届ける。
              </>
            ) : (
              <>
                Delivering wellness
                <br />
                to everyone,
                <br className="hidden sm:block" />
                everywhere.
              </>
            )}
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-navy-300 max-w-2xl leading-relaxed">
            {ja
              ? '私たちは、ウェルネスを一部の人のための贅沢ではなく、すべての人の日常に必要なものだと考えています。Reset Yogaは、誰でも、どこでも、いつでも、自分に合ったヨガと出会える世界を目指します。'
              : 'We believe wellness is not a luxury for the few — it is something every person needs in their daily life. Reset Yoga exists to create a world where anyone, anywhere, anytime can find the yoga practice that is right for them.'}
          </p>
        </div>
      </section>

      {/* ── 2. Vision Statement ────────────────────────────────────────────── */}
      <section className="bg-navy-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-400 mb-10">
            {ja ? 'Our Vision' : 'Our Vision'}
          </p>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light leading-relaxed text-white/90 max-w-3xl">
            {ja ? (
              <>
                世界中の人々のウェルネスを高めること。
                <br className="hidden sm:block" />
                心と身体を整える機会を、国や環境、
                <br className="hidden sm:block" />
                ライフスタイルに関係なく、
                <br className="hidden sm:block" />
                すべての人へ届けること。
                <br />
                <span className="block mt-6 text-lg sm:text-xl text-white/60 font-normal">
                  それがReset YogaのVisionです。
                </span>
              </>
            ) : (
              <>
                To elevate the wellness of people around the world.
                <br className="hidden sm:block" />
                To make the opportunity to reset — mind and body —
                <br className="hidden sm:block" />
                available to everyone, regardless of country,
                <br className="hidden sm:block" />
                circumstance, or lifestyle.
                <span className="block mt-6 text-lg sm:text-xl text-white/60 font-normal">
                  That is the Vision of Reset Yoga.
                </span>
              </>
            )}
          </blockquote>
        </div>
      </section>

      {/* ── 3. Why it matters ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-navy-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left: text */}
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-6">
                {ja ? 'なぜ、今このVisionが必要か' : 'Why it matters'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-8 leading-tight">
                {ja
                  ? '多くの人が、\n整える必要を感じながら\nも、その方法を持てずにいます。'
                  : 'Most people feel the need to reset — but lack the means to do so.'}
              </h2>
              <div className="space-y-5 text-gray-600 dark:text-navy-300 leading-relaxed">
                <p>
                  {ja
                    ? '現代の暮らしは、便利になった一方で、心と身体に負荷がかかりやすくなっています。忙しさ、ストレス、疲労、集中力の低下。多くの人が、整える必要を感じながらも、その時間や方法を持てずにいます。'
                    : 'Modern life has become more convenient, but also harder on the mind and body. Busyness, stress, fatigue, and difficulty focusing. Many people sense the need to find balance — yet lack the time or means to act on it.'}
                </p>
                <p>
                  {ja
                    ? '私たちは、ウェルネスが一部の人のための特別な体験ではなく、すべての人がアクセスできるものであるべきだと考えています。'
                    : "We believe wellness should not be a special experience reserved for a select few. It should be something anyone can access."}
                </p>
              </div>
            </div>

            {/* Right: barriers cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  en: { label: 'Time', body: 'A packed schedule leaves no room for self-care.' },
                  ja: { label: '時間', body: '忙しいスケジュールでは、自分の時間が取れない。' },
                },
                {
                  en: { label: 'Location', body: 'Studios are not always nearby or accessible.' },
                  ja: { label: '場所', body: 'スタジオがいつも近くにあるわけではない。' },
                },
                {
                  en: { label: 'Cost', body: 'Quality wellness can feel out of reach financially.' },
                  ja: { label: '価格', body: '質の高いウェルネスは、経済的に届きにくいことがある。' },
                },
                {
                  en: { label: 'Psychological barriers', body: "\"I'm not flexible enough\" or \"I don't know where to start.\"" },
                  ja: { label: '心理的ハードル', body: '「柔軟性がない」「何から始めればいいかわからない」。' },
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 dark:border-navy-700 bg-linen-50 dark:bg-navy-700/40 p-6"
                >
                  <p className="font-bold text-navy-900 dark:text-white mb-2 text-sm">
                    {ja ? item.ja.label : item.en.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-navy-300 leading-relaxed">
                    {ja ? item.ja.body : item.en.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. How Reset Yoga helps ────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-6">
              {ja ? 'どう実現するか' : 'How Reset Yoga helps'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white max-w-2xl mx-auto leading-tight">
              {ja
                ? '質の高いヨガを、もっと自由で身近なものに。'
                : 'Making high-quality yoga more free and more accessible.'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                number: '01',
                en: { title: 'Anywhere, anytime', body: 'At home, while traveling, or during a lunch break. Your practice fits around your life.' },
                ja: { title: '誰でも、どこでも、いつでも', body: '自宅でも、旅先でも、昼休みでも。あなたの生活に合わせたPractice。' },
              },
              {
                number: '02',
                en: { title: 'Tailored to you', body: "Your body, your goals, your rhythm. We don't offer one-size-fits-all yoga." },
                ja: { title: 'あなたに寄り添う', body: 'あなたの体、あなたの目標、あなたのリズム。画一的なヨガではありません。' },
              },
              {
                number: '03',
                en: { title: 'World-class quality', body: 'Certified instructors. Structured sessions. A standard you can trust.' },
                ja: { title: '世界水準の品質', body: '認定講師。体系的なセッション。信頼できる水準。' },
              },
              {
                number: '04',
                en: { title: 'A habit, not a moment', body: "We're not after a 30-day challenge. We're here to help you build something lasting." },
                ja: { title: '習慣として続く', body: '30日チャレンジが目的ではありません。続けられる習慣をつくるお手伝いをします。' },
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white dark:bg-navy-800 rounded-2xl p-7 border border-gray-100 dark:border-navy-700"
              >
                <p className="text-3xl font-extrabold text-sage-200 dark:text-sage-900 mb-5 leading-none">
                  {item.number}
                </p>
                <p className="font-bold text-navy-900 dark:text-white mb-3 text-base leading-snug">
                  {ja ? item.ja.title : item.en.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                  {ja ? item.ja.body : item.en.body}
                </p>
              </div>
            ))}
          </div>

          {/* Instructor image accent */}
          <div className="mt-16 rounded-3xl overflow-hidden relative h-64 sm:h-80">
            <Image
              src="/yoga-chennai.jpeg"
              alt="Yoga practice in Chennai, India"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 900px"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-end p-8 sm:p-12">
              <p className="text-white text-xl sm:text-2xl font-bold max-w-sm leading-snug">
                {ja
                  ? '一時的な気分転換ではなく、整うことが自然に続く毎日を。'
                  : 'Not a momentary escape — a daily rhythm of feeling well.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. What we believe ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-navy-800">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-6">
              {ja ? 'Reset Yogaが大切にする価値観' : 'What we believe'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white max-w-xl leading-tight">
              {ja
                ? '5つの柱が、\nこのブランドをつくっています。'
                : 'Five principles that\ndefine this brand.'}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 border ${
                  i === 4
                    ? 'sm:col-span-2 bg-navy-900 dark:bg-navy-700 border-navy-800 dark:border-navy-600'
                    : 'bg-linen-50 dark:bg-navy-700/40 border-gray-100 dark:border-navy-700'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${
                    i === 4
                      ? 'bg-sage-500/20'
                      : 'bg-sage-100 dark:bg-sage-900/30'
                  }`}
                >
                  <v.icon
                    className={`h-5 w-5 ${
                      i === 4 ? 'text-sage-400' : 'text-sage-600 dark:text-sage-400'
                    }`}
                  />
                </div>
                <p
                  className={`font-bold mb-3 text-base leading-snug ${
                    i === 4 ? 'text-white' : 'text-navy-900 dark:text-white'
                  }`}
                >
                  {ja ? v.title.ja : v.title.en}
                </p>
                <p
                  className={`text-sm leading-relaxed ${
                    i === 4 ? 'text-white/60' : 'text-gray-500 dark:text-navy-300'
                  }`}
                >
                  {ja ? v.body.ja : v.body.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. What this means for you ─────────────────────────────────────── */}
      <section className="py-24 px-6 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5]">
              <Image
                src="/yogastudent.png"
                alt="Yoga student practicing at home"
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 480px"
              />
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-6">
                {ja ? 'あなたにとっての意味' : 'What this means for you'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-8 leading-tight">
                {ja
                  ? 'Reset Yogaは、クラスを提供する場所ではありません。'
                  : 'Reset Yoga is not just a place to take classes.'}
              </h2>
              <div className="space-y-5 text-gray-600 dark:text-navy-300 leading-relaxed text-lg">
                <p>
                  {ja
                    ? '自分の呼吸に戻ること。疲れをため込む前に整えること。忙しい日々の中でも、自分を大切にする感覚を取り戻すこと。'
                    : 'It is a place to return to your breath. To find balance before exhaustion sets in. To reclaim, even in a busy life, the feeling of caring for yourself.'}
                </p>
                <p>
                  {ja
                    ? 'この場所が、あなたにとってそんな習慣の入口になれたらと願っています。'
                    : 'We hope Reset Yoga can be the doorway to that kind of practice for you.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Looking ahead ───────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white dark:bg-navy-800">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-600 dark:text-sage-400 mb-6">
                {ja ? '未来へ' : 'Looking ahead'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-8 leading-tight">
                {ja
                  ? 'オンラインの枠を超えて、もっと多くの人へ。'
                  : 'Beyond online. To more people, in more places.'}
              </h2>
              <p className="text-gray-600 dark:text-navy-300 leading-relaxed text-lg mb-6">
                {ja
                  ? '私たちは、オンラインの枠を超えて、より多くの人にウェルネスを届ける方法を広げていきます。個人の日常から、企業、教育、コミュニティ、そして世界中のさまざまな地域へ。'
                  : 'We are expanding beyond online, finding new ways to bring wellness to more people. From individual daily routines to businesses, education, communities, and diverse regions around the world.'}
              </p>
              <p className="text-gray-600 dark:text-navy-300 leading-relaxed text-lg">
                {ja
                  ? 'Reset Yogaは、ウェルネスへのアクセスを広げるプラットフォームへ進化していきます。'
                  : 'Reset Yoga is evolving into a platform that expands access to wellness for all.'}
              </p>
            </div>

            {/* Pillars */}
            <div className="space-y-4">
              {[
                { en: 'Individual daily practice', ja: '個人の日常のPractice' },
                { en: 'Workplace wellness programs', ja: '企業のウェルネスプログラム' },
                { en: 'Educational institutions', ja: '教育機関' },
                { en: 'Community & local initiatives', ja: 'コミュニティ・地域の取り組み' },
                { en: 'Global reach, local care', ja: 'グローバルな展開、ローカルな思いやり' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 dark:border-navy-700 bg-linen-50 dark:bg-navy-700/40"
                >
                  <span className="w-2 h-2 rounded-full bg-sage-500 flex-shrink-0" />
                  <p className="text-navy-900 dark:text-white font-medium">
                    {ja ? item.ja : item.en}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-28 px-6 bg-navy-900 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.25em] uppercase text-sage-400 mb-8">
            {ja ? 'はじめの一歩' : 'Begin'}
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            {ja
              ? 'あなたの毎日にも、ウェルネスを。'
              : 'Bring wellness into your everyday life.'}
          </h2>
          <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-lg mx-auto">
            {ja
              ? 'まず体験してみてください。最初の2セッションは完全無料。クレジットカードは不要です。'
              : 'Start with a free experience. Your first 2 sessions are completely free. No credit card required.'}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/instructors"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-full text-base transition-colors"
            >
              {ja ? '自分に合うPracticeを探す' : 'Find your practice'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-base transition-colors border border-white/20"
            >
              {ja ? 'Reset Yogaをはじめる' : 'Get started free'}
            </Link>
          </div>

          <p className="mt-7 text-sm text-white/30">
            {ja
              ? 'クレジットカード不要 · いつでもキャンセル可 · 認定講師のみ在籍'
              : 'No credit card · Cancel anytime · Certified instructors only'}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
