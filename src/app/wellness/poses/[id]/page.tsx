import { createClient, createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import Link from 'next/link'
import {
  ChevronLeft, Library, ArrowRight, Sparkles, LogIn, Lock
} from 'lucide-react'
import { PremiumPaywall } from '@/components/wellness/PremiumPaywall'
import { CONCERNS } from '@/lib/concerns'
import { POSE_FAMILIES, DIFFICULTY_LEVELS } from '@/lib/poses'

export default async function PoseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  // Auth is optional — guests see public content
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const admin = await createAdminClient()
  const { data: pose } = await admin
    .from('yoga_poses')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!pose) notFound()

  const poseConcerns = ((pose.concerns ?? []) as string[])
    .map(cid => CONCERNS.find(c => c.id === cid))
    .filter(Boolean) as typeof CONCERNS

  const imageUrl = locale === 'ja'
    ? ((pose.image_url_ja as string | null) ?? (pose.image_url as string | null))
    : ((pose.image_url_en as string | null) ?? (pose.image_url as string | null))

  const familyLabel = (() => {
    const f = POSE_FAMILIES.find(f => f.value === pose.pose_family)
    return f ? (locale === 'ja' ? f.ja : f.en) : pose.pose_family ?? ''
  })()

  const difficultyLabel = (() => {
    const d = DIFFICULTY_LEVELS.find(d => d.value === pose.difficulty)
    return d ? (locale === 'ja' ? d.ja : d.en) : pose.difficulty ?? ''
  })()

  // ── Access level check ──────────────────────────────────────────────────
  const accessLevel: string = pose.access_level ?? 'public'
  const isPremium = accessLevel === 'premium'
  const isMemberOnly = accessLevel === 'member'
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

  // Logged-in member + premium + no subscription → paywall
  const showPaywall = isPremium && !canAccessPremium && !hasActiveSubscription && !!user
  // Guest + member or premium → inline login gate
  const showLoginGate = !user && (isMemberOnly || isPremium)

  const title = locale === 'ja' ? pose.name_ja : pose.name_en

  const howToSteps = (() => {
    const raw = locale === 'ja' ? pose.how_to_ja : pose.how_to_en
    if (!raw) return []
    return raw.split('\n').map((s: string) => s.trim()).filter(Boolean)
  })()

  const description = locale === 'ja' ? pose.description_ja : pose.description_en

  // Preview for paywall
  const descriptionPreview = description ? description.slice(0, 200) + (description.length > 200 ? '…' : '') : null

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-12">
        {/* Back */}
        <Link
          href="/wellness/poses"
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400 mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {locale === 'ja' ? 'ポーズライブラリへ戻る' : 'Back to Pose Library'}
        </Link>

        {/* Hero Image */}
        {imageUrl ? (
          <div className="rounded-2xl overflow-hidden mb-8 border border-gray-100 dark:border-navy-700">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto"
            />
          </div>
        ) : (
          <div className="rounded-2xl bg-gradient-to-br from-linen-100 to-sage-50 dark:from-navy-700 dark:to-navy-800 mb-8 h-48 flex items-center justify-center border border-gray-100 dark:border-navy-700">
            <span className="text-7xl">🧘</span>
          </div>
        )}

        {/* Concern tags + access badge */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {poseConcerns.length > 0 && poseConcerns.map(c => (
            <span key={c.id} className="inline-flex items-center gap-1 text-xs font-medium text-sage-700 dark:text-sage-400 bg-sage-50 dark:bg-sage-900/30 border border-sage-200 dark:border-sage-800 px-2.5 py-1 rounded-full">
              {c.icon} {locale === 'ja' ? c.ja : c.en}
            </span>
          ))}
          {isPremium && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
              <Sparkles className="h-3 w-3" />
              {locale === 'ja' ? 'プレミアム' : 'Premium'}
            </span>
          )}
          {isMemberOnly && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 px-2 py-0.5 rounded-full">
              <Lock className="h-3 w-3" />
              {locale === 'ja' ? '無料会員限定' : 'Members Only'}
            </span>
          )}
        </div>

        {/* Sanskrit name */}
        <p className="text-sm text-sage-600 dark:text-sage-400 font-semibold tracking-wide mb-1">
          {pose.name_sanskrit}
        </p>

        {/* Title + secondary name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-1 leading-tight">
          {title}
        </h1>
        <p className="text-base text-gray-500 dark:text-navy-300 mb-4">
          {locale === 'ja' ? pose.name_en : pose.name_ja}
        </p>

        {/* Pose family + difficulty badges */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {familyLabel && (
            <span className="text-sm px-3 py-1 rounded-full bg-linen-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 border border-linen-200 dark:border-navy-600 font-medium">
              {familyLabel}
            </span>
          )}
          {difficultyLabel && (
            <span className={`text-sm px-3 py-1 rounded-full font-medium ${
              pose.difficulty === 'advanced'
                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : pose.difficulty === 'intermediate'
                ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            }`}>
              {difficultyLabel}
            </span>
          )}
          {pose.variation_number && pose.variation_number > 1 && (
            <span className="text-sm px-3 py-1 rounded-full bg-gray-100 dark:bg-navy-700 text-gray-500 dark:text-navy-300 font-medium">
              {locale === 'ja' ? `バリエーション ${pose.variation_number}` : `Variation ${pose.variation_number}`}
            </span>
          )}
        </div>

        {/* ── Gated content area ─────────────────────────────────────────── */}
        {showLoginGate ? (
          // Guest hitting member/premium content → login gate
          <div className="rounded-2xl border border-sage-200 dark:border-navy-700 overflow-hidden">
            {/* Preview */}
            {description && (
              <div className="relative px-6 pt-6 pb-2 overflow-hidden" style={{ maxHeight: '120px' }}>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-linen-50/70 to-linen-50 dark:via-navy-900/70 dark:to-navy-900 pointer-events-none" />
              </div>
            )}
            <div className="bg-white dark:bg-navy-800 px-6 py-8 text-center">
              <div className="w-14 h-14 bg-sage-100 dark:bg-sage-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-7 w-7 text-sage-600 dark:text-sage-400" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {locale === 'ja' ? 'ログインしてポーズの詳細を見る' : 'Log in to view full pose details'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed mb-6 max-w-sm mx-auto">
                {locale === 'ja'
                  ? 'ステップ手順や詳しい説明を見るには、無料会員登録またはログインが必要です。'
                  : 'Sign up free or log in to access step-by-step instructions and full descriptions.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Link
                  href={`/login?from=/wellness/poses/${id}`}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold rounded-full transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  {locale === 'ja' ? 'ログイン' : 'Log in'}
                </Link>
                <Link
                  href={`/register?from=/wellness/poses/${id}`}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-navy-700 border border-gray-200 dark:border-navy-600 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-full hover:bg-gray-50 dark:hover:bg-navy-600 transition-colors"
                >
                  {locale === 'ja' ? '無料登録' : 'Sign up free'}
                </Link>
              </div>
            </div>
          </div>
        ) : showPaywall ? (
          // Logged-in member, premium content, no subscription → paywall
          <PremiumPaywall locale={locale} contentPreview={descriptionPreview} />
        ) : (
          // Access granted
          <div className="space-y-8">
            {/* Description */}
            {description && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {locale === 'ja' ? 'このポーズについて' : 'About this pose'}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {description}
                </p>
              </section>
            )}

            {/* How-to Steps */}
            {howToSteps.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {locale === 'ja' ? 'やり方' : 'How to do it'}
                </h2>
                <ol className="space-y-3">
                  {howToSteps.map((step: string, i: number) => (
                    <li key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-sage-100 dark:bg-sage-900/40 text-sage-700 dark:text-sage-400 text-sm font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-200 leading-relaxed pt-0.5">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Variation badge */}
            {pose.variation_number && pose.variation_number > 1 && (
              <div className="px-4 py-3 bg-linen-50 dark:bg-navy-800 rounded-xl border border-linen-200 dark:border-navy-700 text-sm text-gray-600 dark:text-navy-200">
                {locale === 'ja'
                  ? `このポーズには ${pose.variation_number} つのバリエーションがあります。`
                  : `This pose has ${pose.variation_number} variations.`}
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-navy-700">
          {user ? (
            <div className="flex items-center justify-between">
              <Link
                href="/wellness/poses"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-600 dark:text-sage-400 hover:underline"
              >
                <Library className="h-4 w-4" />
                {locale === 'ja' ? 'ポーズライブラリへ' : 'Pose Library'}
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-navy-300 mb-4">
                {locale === 'ja'
                  ? '無料会員登録でもっと多くのポーズと機能が使えます。'
                  : 'Sign up free to access more poses and features.'}
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage-500 hover:bg-sage-600 text-white text-sm font-semibold rounded-full transition-colors"
              >
                {locale === 'ja' ? '無料登録して始める' : 'Get started for free'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
