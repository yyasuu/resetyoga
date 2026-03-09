import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InquiryForm } from '@/components/corporate/InquiryForm'
import { Check, Users, BookOpen, BarChart2, Calendar, Zap, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Reset for Teams | Corporate Wellness | Reset Yoga',
  description: 'Live yoga & mindfulness sessions for your team — combined with an on-demand wellness library. Built for remote and hybrid teams.',
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 199,
    annual: 169,
    tagline: 'For small teams building a wellness habit',
    members: 'Up to 20 members',
    features: [
      '2 live sessions / month (45 min)',
      'Wellness library access — all 20 members',
      'Session recordings (14 days)',
      'Monthly team wellness pulse',
      'Email support',
    ],
    cta: 'Get started',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 399,
    annual: 339,
    tagline: 'For growing teams that want consistent results',
    members: 'Up to 50 members',
    features: [
      '4 live sessions / month (45 min)',
      'Wellness library access — all 50 members',
      'Session recordings (90 days)',
      'Dedicated instructor — same person every session',
      'Custom session focus (stress, sleep, focus, energy)',
      'Full monthly wellness report PDF',
      'Priority support',
    ],
    cta: 'Get started',
    highlight: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    price: 799,
    annual: 679,
    tagline: 'For teams that make wellness a strategic priority',
    members: 'Unlimited members',
    features: [
      '8 live sessions / month (2× per week)',
      'Wellness library — unlimited team access',
      'Session recordings — unlimited',
      'Dedicated senior instructor',
      'Quarterly wellness strategy session',
      'Custom team onboarding page',
      'Annual wellness impact report',
      'Dedicated account manager',
    ],
    cta: 'Talk to us',
    highlight: false,
  },
]

const FEATURES = [
  {
    icon: Calendar,
    title: 'Live, not recorded',
    titleJa: 'ライブセッション',
    body: 'Every session is a real instructor, in real time. Your team shows up together — that\'s what builds habits.',
    bodyJa: '録画ではなく、毎回リアルタイムの講師がライブで対応。チームが一緒に動くことで習慣が生まれます。',
  },
  {
    icon: BookOpen,
    title: 'Library between sessions',
    titleJa: 'セッション間のライブラリ',
    body: 'Members access 100+ guided videos and articles anytime — so wellness doesn\'t stop when the call ends.',
    bodyJa: 'セッション外でも100本以上のガイド動画・記事にアクセス可能。ウェルネスは週1回に限りません。',
  },
  {
    icon: Users,
    title: 'One instructor, every time',
    titleJa: '専任講師制',
    body: 'Pro and Scale plans match your team with the same instructor. Continuity is the difference between a one-off and a culture shift.',
    bodyJa: 'Pro・Scaleは毎回同じ講師が担当。継続性こそが"一過性"と"文化の変化"の違いを生みます。',
  },
  {
    icon: BarChart2,
    title: 'Wellness pulse, not guesswork',
    titleJa: 'ウェルネス指標',
    body: 'A monthly three-question survey gives you a team stress and energy score — simple enough to actually use.',
    bodyJa: '月次3問サーベイでチームのストレス・エネルギースコアを可視化。シンプルだからこそ続きます。',
  },
  {
    icon: Zap,
    title: 'No extra software',
    titleJa: '追加ツール不要',
    body: 'Sessions run on video call. Your team doesn\'t download anything new. Less friction = better attendance.',
    bodyJa: 'セッションはビデオ通話で完結。新しいアプリのダウンロードは不要。摩擦を減らすほど参加率が上がります。',
  },
  {
    icon: Shield,
    title: 'Multi-language instructors',
    titleJa: '多言語講師',
    body: 'English and Japanese instructors, time-zone aware scheduling. Works for global teams.',
    bodyJa: '日本語・英語の講師が在籍。時差を考慮したスケジューリングで、グローバルチームにも対応。',
  },
]

const FAQS = [
  {
    q: 'How does the free trial work?',
    qJa: '無料トライアルはどのように行われますか？',
    a: 'We offer one complimentary team session — no credit card required. Just fill in the inquiry form and we\'ll schedule it within a week.',
    aJa: 'クレジットカード不要でチームセッションを1回無料でご提供します。お問い合わせフォームからご連絡いただければ1週間以内に日程調整します。',
  },
  {
    q: 'What happens to unused sessions?',
    qJa: '未使用セッションはどうなりますか？',
    a: 'Sessions don\'t roll over, but we work with you to schedule at times that maximize attendance. Most teams use 90%+ of their sessions.',
    aJa: '繰り越しはありませんが、参加率が最大になるよう日程調整をサポートします。多くのチームは90%以上を消化しています。',
  },
  {
    q: 'Can we change plans?',
    qJa: 'プランを途中で変更できますか？',
    a: 'Yes, you can upgrade at any time. Downgrades take effect at the next billing cycle.',
    aJa: 'アップグレードはいつでも可能です。ダウングレードは次の請求サイクルから適用されます。',
  },
  {
    q: 'Do you offer annual billing?',
    qJa: '年間払いはありますか？',
    a: 'Yes — annual plans are ~15% less than monthly. Ask about it in your inquiry.',
    aJa: 'はい。年間払いは月払いより約15%お得です。お問い合わせ時にお伝えください。',
  },
  {
    q: 'What time zones do you cover?',
    qJa: 'どのタイムゾーンに対応していますか？',
    a: 'Our instructor pool covers Japan, India, South Asia, and North America. We can accommodate most business hour windows.',
    aJa: '日本・インド・南アジア・北米の講師が在籍。ほとんどのビジネス時間帯に対応できます。',
  },
]

export default async function CorporatePage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'
  const ja = locale === 'ja'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        {/* subtle texture circles */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-sage-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-sage-500/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-32 text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-sage-400 uppercase mb-5">
            Reset for Teams
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 max-w-3xl mx-auto">
            {ja
              ? <>チームに、<br className="sm:hidden" />週45分の<br className="sm:hidden" />リセットを。</>
              : <>Your team deserves<br className="hidden sm:block" /> 45 minutes.</>}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            {ja
              ? 'ライブヨガ・マインドフルネスセッション＋オンデマンドウェルネスライブラリ。リモート・ハイブリッドチームのための習慣設計。'
              : 'Live yoga and mindfulness sessions, combined with an on-demand wellness library — built for remote and hybrid teams that want to make wellbeing a habit.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#inquiry"
              className="px-7 py-3.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold rounded-full text-base transition-colors"
            >
              {ja ? '無料セッションをリクエスト' : 'Request a free team session'}
            </a>
            <a
              href="#plans"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-base transition-colors border border-white/20"
            >
              {ja ? 'プランを見る' : 'See plans'}
            </a>
          </div>
          <p className="mt-5 text-sm text-white/40">
            {ja ? 'クレジットカード不要 · 1営業日以内にご返信' : 'No credit card · Reply within one business day'}
          </p>
        </div>
      </section>

      {/* ── The problem ──────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-4">
          {ja ? '現状の問題' : 'The problem'}
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {ja
            ? 'ウェルネス施策は、<br/>なぜ続かないのか。'
            : 'Why most workplace wellness doesn\'t stick.'}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6 mt-10 text-left">
          {[
            {
              label: ja ? 'アプリは使われない' : 'Apps go unused',
              body: ja
                ? 'ライセンスを買っても90日後に誰も開かない。自己学習ツールは意志力に依存する。'
                : 'Licenses get bought, then ignored. Self-directed tools rely on willpower — which runs out.',
            },
            {
              label: ja ? '単発イベントは忘れる' : 'One-offs are forgotten',
              body: ja
                ? '年1回のウェルネスデーは気分を上げるが、翌週には何も変わっていない。'
                : 'A yearly wellness day feels good in the moment, but nothing changes the week after.',
            },
            {
              label: ja ? '成果が見えない' : 'No data, no buy-in',
              body: ja
                ? 'チームが楽しんでいるかどうかわからない。予算の正当化ができない。'
                : 'No way to know if it\'s working. Impossible to justify the budget to anyone.',
            },
          ].map(item => (
            <div key={item.label} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700">
              <p className="font-bold text-gray-900 dark:text-white mb-2">{item.label}</p>
              <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-navy-800 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
              {ja ? '提供内容' : 'What you get'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {ja ? 'ライブ×ライブラリ×データ' : 'Live. Library. Data.'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="flex gap-4">
                <div className="w-10 h-10 flex-shrink-0 bg-sage-100 dark:bg-sage-900/30 rounded-xl flex items-center justify-center mt-0.5">
                  <f.icon className="h-5 w-5 text-sage-600 dark:text-sage-400" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white mb-1">
                    {ja ? f.titleJa : f.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                    {ja ? f.bodyJa : f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── In the Field ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-linen-50 dark:bg-navy-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-sage-600 dark:text-sage-400 uppercase mb-3">
              {ja ? 'フィールドから' : 'In the field'}
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight max-w-lg">
              {ja ? <>どこにいても、<br />本物の実践を。</> : <>Anywhere you need us.</>}
            </h2>
            <p className="mt-4 text-base text-gray-500 dark:text-navy-300 max-w-md leading-relaxed">
              {ja
                ? 'チェンナイの寺院から、フランスの郊外まで。あなたの街でも。Reset Yogaの講師はどこへでも行きます。'
                : 'From a 2,000-year-old temple in South India to a session in southern France — and to your city too.'}
            </p>
          </div>

          {/* Editorial photo grid — asymmetric 3-panel */}
          <div className="grid grid-cols-12 gap-3 sm:gap-4 h-[480px] sm:h-[560px]">

            {/* Chennai — tall portrait hero, left */}
            <div className="col-span-5 relative rounded-2xl overflow-hidden group">
              <Image
                src="/yoga-chennai.jpeg"
                alt="Group yoga session at the Kapaleeshwarar Temple, Chennai, India"
                fill
                className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 38vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 sm:p-6">
                <p className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase mb-1.5">
                  Chennai, India
                </p>
                <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                  {ja ? 'カパレーシュワラル寺院\nグループ研修' : <>Immersion at<br />Kapaleeshwarar Temple</>}
                </p>
              </div>
            </div>

            {/* France — tall portrait, center */}
            <div className="col-span-4 relative rounded-2xl overflow-hidden group">
              <Image
                src="/yoga-france.jpeg"
                alt="Yoga retreat session in southern France"
                fill
                className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-700"
                sizes="(max-width: 768px) 40vw, 30vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/85 via-navy-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-5 sm:p-6">
                <p className="text-[9px] font-bold tracking-[0.2em] text-white/50 uppercase mb-1.5">
                  France
                </p>
                <p className="text-white font-semibold text-sm sm:text-base leading-snug">
                  {ja ? 'フランス招待\nセッション' : <>Invited instructor<br />retreat</>}
                </p>
              </div>
            </div>

            {/* Your city — dark text card, right */}
            <div className="col-span-3 rounded-2xl bg-navy-900 dark:bg-navy-700 flex flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-sage-400 uppercase mb-3">
                  {ja ? 'あなたの街で' : 'Your city'}
                </p>
                <p className="text-white font-bold text-base sm:text-lg leading-snug mb-3">
                  {ja
                    ? <>あなたの街で<br />ヨガ研修を<br />開催できる。</>
                    : <>Bring a session<br />to wherever<br />your team is.</>}
                </p>
                <p className="text-navy-300 text-xs leading-relaxed">
                  {ja
                    ? '認定講師があなたの元へ。場所はあなたが決める。'
                    : 'Certified instructors travel to your office, studio, or retreat space.'}
                </p>
              </div>
              <Link
                href="/instructors"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 px-3.5 py-2 rounded-full transition-colors self-start mt-4"
              >
                {ja ? '講師を探す' : 'Find an instructor'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────────────── */}
      <section id="plans" className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
            {ja ? 'プラン' : 'Plans'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {ja ? 'シンプルな料金体系' : 'Simple pricing'}
          </h2>
          <p className="text-gray-500 dark:text-navy-300">
            {ja ? '年払いで約15%割引。最低契約期間なし。' : 'Annual billing saves ~15%. No minimum commitment.'}
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {PLANS.map(plan => (
            <div
              key={plan.id}
              className={`rounded-2xl border-2 flex flex-col ${
                plan.highlight
                  ? 'border-sage-500 bg-white dark:bg-navy-800 shadow-xl relative'
                  : 'border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-sage-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {ja ? '最も人気' : 'Most popular'}
                  </span>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <p className="font-bold text-lg text-gray-900 dark:text-white">{plan.name}</p>
                <p className="text-xs text-gray-500 dark:text-navy-400 mt-0.5 mb-5">{plan.tagline}</p>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-sm text-gray-400 dark:text-navy-400"> /mo</span>
                </div>
                <p className="text-xs text-sage-600 dark:text-sage-400 mb-5">
                  {ja ? `年払い $${plan.annual}/月` : `$${plan.annual}/mo billed annually`}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-navy-300 uppercase tracking-wide mb-3">{plan.members}</p>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="h-4 w-4 text-sage-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#inquiry"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    plan.highlight
                      ? 'bg-sage-500 hover:bg-sage-600 text-white'
                      : 'bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600 text-navy-700 dark:text-navy-200'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-navy-400 mt-8">
          {ja
            ? '全プランにチームセッション1回無料トライアルが含まれます。まずお問い合わせください。'
            : 'All plans include a free trial session for your team. No credit card needed to get started.'}
        </p>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-navy-800 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 text-center">
            {ja ? 'よくある質問' : 'Frequently asked questions'}
          </h2>
          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 dark:border-navy-700 pb-6">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {ja ? faq.qJa : faq.q}
                </p>
                <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                  {ja ? faq.aJa : faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inquiry form ─────────────────────────────────────────────────── */}
      <section id="inquiry" className="max-w-2xl mx-auto px-4 py-20 w-full">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
            {ja ? 'お問い合わせ' : 'Get in touch'}
          </p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {ja ? 'まず1回、試してみてください。' : 'Start with one free session.'}
          </h2>
          <p className="text-gray-500 dark:text-navy-300">
            {ja
              ? 'クレジットカード不要。フォームを送っていただければ1営業日以内にご連絡します。'
              : 'No credit card. Fill this in and we\'ll reach out within one business day to schedule.'}
          </p>
        </div>

        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-8 shadow-sm">
          <InquiryForm locale={locale as 'en' | 'ja'} />
        </div>

        <p className="text-center text-sm text-gray-400 dark:text-navy-400 mt-6">
          {ja ? '質問がある場合は ' : 'Questions? Email us at '}
          <a href="mailto:support@tryresetyoga.com" className="text-sage-600 dark:text-sage-400 hover:underline">
            support@tryresetyoga.com
          </a>
        </p>
      </section>

      <Footer />
    </div>
  )
}
