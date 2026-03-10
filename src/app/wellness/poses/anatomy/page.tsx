import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { cookies } from 'next/headers'
import { AnatomyContent } from '@/components/wellness/AnatomyContent'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'Human Anatomy & Yoga | Reset Yoga',
  description: 'How yoga and meditation interact with every organ system in the body — from cellular biology to the reproductive system.',
}

export default async function AnatomyPage() {
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

      {/* Header */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-4 py-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-500/10 rounded-full -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full translate-y-1/2 blur-3xl" />
        </div>
        <div className="relative">
          <p className="text-xs font-bold text-sage-400 uppercase tracking-[0.2em] mb-3">
            {locale === 'ja' ? 'ヨガポーズライブラリ' : 'Yoga Pose Library'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            {locale === 'ja' ? '人体とヨガ 解剖学ガイド' : 'Human Anatomy & Yoga'}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto text-sm leading-relaxed">
            {locale === 'ja'
              ? '細胞・骨格・神経から内分泌・消化器まで、人体の11カテゴリーとヨガ・瞑想の関わりを医学研究のエビデンスとともに解説。'
              : 'From cells and bones to nerves and hormones — 11 body categories and how yoga & meditation interact with each, backed by medical research.'}
          </p>

          {/* System count badges */}
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {[
              { icon: '🔬', ja: '細胞', en: 'Cell' },
              { icon: '🦴', ja: '骨格', en: 'Skeletal' },
              { icon: '💪', ja: '筋', en: 'Muscular' },
              { icon: '🧠', ja: '神経', en: 'Nervous' },
              { icon: '⚗️', ja: '内分泌', en: 'Endocrine' },
              { icon: '🫁', ja: '呼吸器', en: 'Respiratory' },
              { icon: '🫀', ja: '心臓血管', en: 'Cardiovascular' },
              { icon: '🛡️', ja: 'リンパ', en: 'Lymphatic' },
              { icon: '🌿', ja: '消化器', en: 'Digestive' },
              { icon: '💧', ja: '泌尿器', en: 'Urinary' },
              { icon: '🌸', ja: '生殖器', en: 'Reproductive' },
            ].map(s => (
              <span key={s.en} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-white/70 backdrop-blur border border-white/10">
                {s.icon} {locale === 'ja' ? s.ja : s.en}
              </span>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6 pb-16">
        <div className="mb-8">
          <Link
            href="/wellness/poses"
            className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-navy-300 hover:text-navy-600 dark:hover:text-sage-400"
          >
            <ChevronLeft className="h-4 w-4" />
            {locale === 'ja' ? 'ヨガポーズ集へ戻る' : 'Back to Pose Library'}
          </Link>
        </div>

        <AnatomyContent locale={locale} />
      </main>

      <Footer />
    </div>
  )
}
