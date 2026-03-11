import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { WaitlistForm } from '@/components/premium/WaitlistForm'
import { CheckCircle, Star, Clock, Shield, Zap, Users, Globe } from 'lucide-react'

export const metadata = { title: 'Reset Yoga Premium | Curated, Tiered, Matched Yoga' }

const CATEGORIES = [
  { id: 'desk',      icon: '💻', name_ja: 'デスクワーカー回復',    name_en: 'Desk Recovery',       desc_ja: '肩・首・腰の不調をピンポイントで解決', desc_en: 'Targeted recovery for neck, shoulder, and lower-back strain.' },
  { id: 'sleep',     icon: '🌙', name_ja: '睡眠・神経系',          name_en: 'Sleep & Nervous System', desc_ja: '自律神経を整え、深い眠りへ', desc_en: 'Regulate your nervous system and improve sleep quality.' },
  { id: 'womens',    icon: '🌸', name_ja: '女性のバランス',         name_en: "Women's Balance",     desc_ja: '産前産後・ホルモンバランス・女性特有の不調', desc_en: 'Support for prenatal, postnatal, and hormonal wellbeing.' },
  { id: 'elite',     icon: '🏆', name_ja: 'エリートマスター',       name_en: 'Elite Yogi / Master', desc_ja: '深い専門性と実績を持つ上級講師', desc_en: 'Advanced specialists with deep expertise and proven outcomes.' },
  { id: 'beginner',  icon: '🌱', name_ja: 'ビギナーガイド',         name_en: 'Gentle Beginner',     desc_ja: '初めてでも安心、丁寧な指導', desc_en: 'Beginner-safe instruction with careful pacing and support.' },
  { id: 'athletic',  icon: '⚡', name_ja: 'アスリートモビリティ',   name_en: 'Athletic Flow',       desc_ja: '筋力・可動域・パフォーマンス向上', desc_en: 'Build strength, mobility, and performance with focused training.' },
  { id: 'luxury',    icon: '💎', name_ja: 'マインドフルラグジュアリー', name_en: 'Mindful Luxury',   desc_ja: 'リトリートのような上質な体験', desc_en: 'A premium, retreat-like experience for deep reset and clarity.' },
  { id: 'english',   icon: '🌍', name_ja: 'English Global Class',  name_en: 'English Global',      desc_ja: '英語で受講できる国際クラス', desc_en: 'International classes delivered in English.' },
  { id: 'celebrity', icon: '⭐', name_ja: 'セレブリティ講師',       name_en: 'Celebrity / Influencer', desc_ja: 'フォロワー数万人の人気講師', desc_en: 'Popular instructors with large audiences and unique style.' },
  { id: 'japanese',  icon: '🎋', name_ja: 'ジャパニーズカーム',     name_en: 'Japanese Calm',       desc_ja: '静けさを大切にした、日本語の丁寧なクラス', desc_en: 'Quiet, mindful classes with a calm Japanese teaching style.' },
]

const TIERS = [
  { id: 'tier1', badge: 'Tier 1', name_ja: '一般Premium講師',    name_en: 'Core Premium Instructor', price: '¥2,500〜4,500',  desc_ja: '認定資格を持ち、品質審査を通過した講師', desc_en: 'Certified instructors who passed Reset Yoga quality review.' },
  { id: 'tier2', badge: 'Tier 2', name_ja: '認定・高評価講師',   name_en: 'Certified High-Rated Instructor', price: '¥4,500〜8,000',  desc_ja: '継続率・満足度が高く、実績のある専門講師', desc_en: 'Specialist instructors with strong retention and satisfaction.' },
  { id: 'tier3', badge: 'Tier 3', name_ja: '有名講師・希少テーマ', name_en: 'Famous Instructor / Rare Specialty', price: '¥8,000〜20,000', desc_ja: '希少な専門性を持つ、または著名な認定講師', desc_en: 'Recognized experts or instructors with rare specialization.' },
  { id: 'tier4', badge: 'Tier 4', name_ja: '1on1・少人数特別枠', name_en: '1:1 / Small Private Format', price: '¥15,000〜50,000', desc_ja: 'マンツーマン・プライベートの完全個別指導', desc_en: 'Highly personalized one-on-one or private small-group coaching.' },
]

const PLANS = [
  {
    id: 'select',
    name: 'Premium Select',
    price: '¥9,800〜14,800',
    period_ja: '/月',
    period_en: '/month',
    highlight: false,
    features_ja: ['月8回までPremiumクラス', 'Tier 1〜2講師を中心に', '優先予約', 'アーカイブ一部開放'],
    features_en: ['Up to 8 premium classes per month', 'Best for Tier 1-2 instructors', 'Priority booking', 'Partial archive access'],
  },
  {
    id: 'studio_pass',
    name: 'Premium Studio Pass',
    price: '¥19,800〜29,800',
    period_ja: '/月',
    period_en: '/month',
    highlight: true,
    features_ja: ['月10〜15クレジット', 'Tier 1〜3全講師アクセス', 'マッチングサポート', '限定シリーズ参加権', '優先予約'],
    features_en: ['10-15 monthly credits', 'Access to all Tier 1-3 instructors', 'Matching support', 'Exclusive series access', 'Priority booking'],
  },
  {
    id: 'signature',
    name: 'Signature Program',
    price: '¥29,800〜59,800',
    period_ja: '/4週間',
    period_en: '/4 weeks',
    highlight: false,
    features_ja: ['テーマ集中型プログラム', '小グループ（定員6名）', '課題＋チャットフォロー', '修了証書'],
    features_en: ['Theme-focused intensive program', 'Small group (max 6 people)', 'Assignments + chat follow-up', 'Completion certificate'],
  },
  {
    id: 'private',
    name: 'Private / Semi-Private',
    price: '¥12,000〜',
    period_ja: '/回',
    period_en: '/session',
    highlight: false,
    features_ja: ['講師Tierで価格変動', '完全マンツーマン', '自分に合わせたプログラム', 'チャットでの事前相談'],
    features_en: ['Price varies by instructor tier', 'Fully one-on-one format', 'Program tailored to your needs', 'Pre-session consultation via chat'],
  },
]

const USP = [
  { icon: Shield,   text_ja: '審査・承認制の品質保証',             text_en: 'Curated quality — every instructor is reviewed' },
  { icon: Zap,      text_ja: '不調から逆算してマッチング',          text_en: 'Matched by concern, not just popularity' },
  { icon: Clock,    text_ja: '5分〜60分、生活に合わせて受講',       text_en: '5–60 min sessions that fit your schedule' },
  { icon: Star,     text_ja: 'Tier制による透明な価格設計',          text_en: 'Transparent pricing via instructor tiers' },
  { icon: Users,    text_ja: '少人数・1on1まで選べる',              text_en: 'From group classes to personal coaching' },
  { icon: Globe,    text_ja: '世界中の講師、日本語・英語で受講可',   text_en: 'Global instructors, Japanese & English classes' },
]

export default async function PremiumPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-navy-800 via-navy-700 to-sage-800 dark:from-navy-900 dark:to-navy-800 text-white px-4 py-24 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #7A8F6B 0%, transparent 60%), radial-gradient(circle at 70% 30%, #1B2B4B 0%, transparent 60%)' }} />
        <div className="relative max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-sage-500/30 border border-sage-400/40 text-sage-200 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
            {locale === 'ja' ? '✦ Coming Soon — 先行登録受付中' : '✦ Coming Soon — Early access now open'}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
            {locale === 'ja'
              ? <>今の不調に合う、<br /><span className="text-sage-300">世界の厳選講師</span>から。</>
              : <>The world&apos;s best instructors,<br /><span className="text-sage-300">matched to your recovery.</span></>
            }
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-4 leading-relaxed">
            {locale === 'ja'
              ? '肩こり・睡眠・ストレス・育児疲れ…あなたの不調に特化した講師と、5〜60分で回復する体験を。'
              : 'Shoulder pain, poor sleep, burnout — matched to a specialist who gets it, in sessions from 5 to 60 minutes.'}
          </p>
          <p className="text-sm text-white/50 mb-10">
            {locale === 'ja' ? '審査制・Tier制・マッチング型のプレミアムヨガプラットフォーム' : 'Curated · Tiered · Matched to you'}
          </p>
          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-400 text-white font-semibold px-8 py-3.5 rounded-full text-base shadow-lg transition-colors"
          >
            {locale === 'ja' ? '先行登録する（無料）→' : 'Join the waitlist (free) →'}
          </a>
        </div>
      </section>

      {/* ── Why Premium ── */}
      <section className="py-20 px-4 bg-white dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
            {locale === 'ja' ? 'なぜPremiumか' : 'Why Premium'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white mb-3">
            {locale === 'ja' ? '「講師を売る」のではなく、「不調を解決する」' : 'Not "selling instructors" — solving your body\'s problems'}
          </h2>
          <p className="text-gray-500 dark:text-navy-300 max-w-xl mx-auto mb-12 text-sm leading-relaxed">
            {locale === 'ja'
              ? 'Reset Yoga PremiumはNetflixのような見放題ではありません。ClassPass × MasterClass × 温かい回復伴走の中間を取った、不調起点の専門マッチングです。'
              : 'Not a Netflix-style unlimited pass. Think ClassPass × MasterClass × personal recovery support — matched by concern, not just clicks.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USP.map(({ icon: Icon, text_ja, text_en }) => (
              <div key={text_ja} className="flex items-start gap-3 text-left bg-linen-50 dark:bg-navy-700 rounded-2xl p-5 border border-linen-200 dark:border-navy-600">
                <div className="w-9 h-9 bg-sage-100 dark:bg-sage-900/40 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-4 w-4 text-sage-600 dark:text-sage-400" />
                </div>
                <p className="text-sm font-medium text-navy-700 dark:text-white leading-snug">
                  {locale === 'ja' ? text_ja : text_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instructor Categories ── */}
      <section className="py-20 px-4 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-3">
            {locale === 'ja' ? '講師カテゴリ' : 'Instructor Categories'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-navy-800 dark:text-white mb-3">
            {locale === 'ja' ? '10の専門カテゴリから選べる' : '10 specialist categories to choose from'}
          </h2>
          <p className="text-center text-gray-500 dark:text-navy-300 text-sm mb-10">
            {locale === 'ja' ? '悩みに合った専門講師を、一画面で比較できます。' : 'Compare specialist instructors matched to your concern.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-white dark:bg-navy-800 rounded-2xl p-5 border border-gray-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <p className="font-bold text-sm text-navy-800 dark:text-white mb-1 leading-snug">
                  {locale === 'ja' ? cat.name_ja : cat.name_en}
                </p>
                <p className="text-xs text-gray-500 dark:text-navy-300 leading-relaxed">
                  {locale === 'ja' ? cat.desc_ja : cat.desc_en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works: 3-step match ── */}
      <section className="py-20 px-4 bg-sage-50 dark:bg-navy-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
            {locale === 'ja' ? '使い方' : 'How It Works'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-navy-800 dark:text-white mb-10">
            {locale === 'ja' ? '3つの質問で、あなたに合う講師が見つかる' : '3 questions. Your perfect instructor found.'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '01', q_ja: '今つらい場所は？', q_en: 'What hurts today?',   ex_ja: '肩・首・腰・眠れない・疲れが取れない など', ex_en: 'Shoulder, neck, sleep, fatigue…' },
              { step: '02', q_ja: '使える時間は？',   q_en: 'How much time?',      ex_ja: '5分 / 20分 / 45分 / 60分以上',              ex_en: '5, 20, 45, or 60+ minutes' },
              { step: '03', q_ja: '好きな雰囲気は？', q_en: 'Preferred vibe?',     ex_ja: 'おだやか / 動く / 瞑想寄り / リトリート感',  ex_en: 'Calm / Dynamic / Meditative / Retreat' },
            ].map(({ step, q_ja, q_en, ex_ja, ex_en }) => (
              <div key={step} className="bg-white dark:bg-navy-700 rounded-2xl p-7 border border-gray-100 dark:border-navy-600 text-left">
                <p className="text-4xl font-light text-sage-300 dark:text-sage-600 mb-3">{step}</p>
                <p className="font-bold text-navy-800 dark:text-white text-lg mb-2">{locale === 'ja' ? q_ja : q_en}</p>
                <p className="text-sm text-gray-400 dark:text-navy-300">{locale === 'ja' ? ex_ja : ex_en}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-sm text-gray-400 dark:text-navy-300">
            {locale === 'ja' ? '→ 回答するだけで、今のあなたに合ったPremium講師が自動でピックアップされます。' : '→ Your answers surface the right Premium instructor instantly.'}
          </p>
        </div>
      </section>

      {/* ── Instructor Tiers ── */}
      <section className="py-20 px-4 bg-white dark:bg-navy-800">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-3">
            {locale === 'ja' ? '講師Tier制' : 'Instructor Tier System'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-navy-800 dark:text-white mb-3">
            {locale === 'ja' ? '価格は「見えない品質」ではなく、透明なTier制' : 'Transparent pricing by instructor tier, not guesswork'}
          </h2>
          <p className="text-center text-gray-500 dark:text-navy-300 text-sm mb-10">
            {locale === 'ja' ? '全講師は運営の審査・承認を経てTierが決定します。価格の意味が崩れません。' : 'Every tier is reviewed and approved by Reset Yoga — price integrity guaranteed.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIERS.map((tier, i) => (
              <div key={tier.id} className={`rounded-2xl p-5 border ${i === 1 ? 'border-sage-400 bg-sage-50 dark:bg-sage-900/20 dark:border-sage-600' : 'border-gray-100 dark:border-navy-700 bg-linen-50 dark:bg-navy-700'}`}>
                <span className="text-xs font-bold text-sage-600 dark:text-sage-400 uppercase tracking-wide">{tier.badge}</span>
                <p className="font-bold text-navy-800 dark:text-white mt-1 mb-1 text-sm">{locale === 'ja' ? tier.name_ja : tier.name_en}</p>
                <p className="text-lg font-bold text-sage-600 dark:text-sage-400 mb-2">
                  {tier.price}
                  <span className="text-xs font-normal text-gray-400">{locale === 'ja' ? '/クラス' : '/class'}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-navy-300 leading-relaxed">{locale === 'ja' ? tier.desc_ja : tier.desc_en}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-navy-400 mt-4">
            {locale === 'ja' ? '※ 講師が価格を提案し、運営がTierを承認します。完全自由価格ではありません。' : '* Instructors propose, Reset Yoga approves. No unregulated pricing.'}
          </p>
        </div>
      </section>

      {/* ── Subscription Plans ── */}
      <section className="py-20 px-4 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-3">
            {locale === 'ja' ? '料金プラン' : 'Pricing Plans'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-navy-800 dark:text-white mb-3">
            {locale === 'ja' ? '生活に合わせて選べる4プラン' : '4 plans for every lifestyle'}
          </h2>
          <p className="text-center text-gray-500 dark:text-navy-300 text-sm mb-10">
            {locale === 'ja' ? '月額 + クレジット制で、使いたいだけ使える柔軟な設計。' : 'Subscription + credit system — flexible to match how you practice.'}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 border relative ${plan.highlight
                  ? 'border-sage-400 bg-gradient-to-b from-sage-50 to-white dark:from-sage-900/30 dark:to-navy-800 dark:border-sage-500 shadow-md'
                  : 'border-gray-100 dark:border-navy-700 bg-white dark:bg-navy-800 shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sage-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {locale === 'ja' ? '人気' : 'Popular'}
                  </span>
                )}
                <p className="font-bold text-navy-800 dark:text-white text-sm mb-1">{plan.name}</p>
                <p className="text-2xl font-bold text-sage-600 dark:text-sage-400">{plan.price}</p>
                <p className="text-xs text-gray-400 mb-4">{locale === 'ja' ? plan.period_ja : plan.period_en}</p>
                <ul className="space-y-2">
                  {(locale === 'ja' ? plan.features_ja : plan.features_en).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-navy-200">
                      <CheckCircle className="h-3.5 w-3.5 text-sage-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Waitlist ── */}
      <section id="waitlist" className="py-20 px-4 bg-gradient-to-br from-navy-800 to-navy-900 text-white">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs font-semibold text-sage-400 uppercase tracking-widest mb-3">
            {locale === 'ja' ? '先行登録' : 'Early Access'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            {locale === 'ja' ? '先行登録で、ローンチ特典を受け取る' : 'Join the waitlist for launch benefits'}
          </h2>
          <p className="text-white/70 text-sm mb-8">
            {locale === 'ja'
              ? '先行登録者には、ローンチ時の割引・優先予約・限定講師クラスの招待をお届けします。'
              : 'Early registrants receive launch discounts, priority booking, and exclusive class invitations.'}
          </p>
          <WaitlistForm locale={locale} />
        </div>
      </section>

      <Footer />
    </div>
  )
}
