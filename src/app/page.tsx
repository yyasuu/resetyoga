import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'
import { Button } from '@/components/ui/button'
import { CheckCircle, Star, Video, Clock, Heart, Sparkles, Globe } from 'lucide-react'

export default async function LandingPage() {
  const t = await getTranslations('landing')

  let profile: Profile | null = null
  let instructors: any[] = []
  let user: { id: string } | null = null

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
  } catch {
    // Supabase not configured yet
  }

  return (
    <div className="min-h-screen bg-white dark:bg-navy-900">
      <Navbar user={profile} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-linen-200 via-sage-50 to-navy-50 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900 pt-24 pb-32 px-4 overflow-hidden">
        {/* Background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sage-100/40 dark:bg-sage-900/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-linen-300/40 dark:bg-navy-700/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-white/70 dark:bg-navy-800/70 backdrop-blur-sm border border-sage-200 dark:border-sage-800 text-sage-700 dark:text-sage-300 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
            仕事・育児に疲れた方に贈る、45分の自分時間
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-700 dark:text-linen-100 leading-tight mb-6">
            {t('hero_title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <p className="text-base text-gray-500 dark:text-gray-400 mb-10">
            まずは2回無料。クレジットカード不要。今すぐ始められます。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={user ? '/instructors' : '/register'}>
              <Button
                size="lg"
                className="bg-navy-600 hover:bg-navy-700 dark:bg-navy-500 dark:hover:bg-navy-400 text-white px-10 py-4 text-lg h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                {t('cta_start')} →
              </Button>
            </Link>
            <Link href="/instructors">
              <Button
                size="lg"
                variant="outline"
                className="border-navy-300 dark:border-navy-500 text-navy-700 dark:text-navy-200 px-10 py-4 text-lg h-auto rounded-full hover:bg-navy-50 dark:hover:bg-navy-800"
              >
                {t('cta_browse')}
              </Button>
            </Link>
          </div>

          {/* Trust bar */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> 平均評価 4.9</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-sage-500" /> 認定講師のみ在籍</span>
            <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-navy-400" /> インド・日本・世界の講師</span>
          </div>
        </div>
      </section>

      {/* ── Pain Points ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-navy-900">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-4">こんなお悩みありませんか？</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10">
            忙しい毎日に、<br className="sm:hidden" />自分の時間は後回しになっていませんか？
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {[
              { icon: '😔', text: '仕事のストレスで眠れない夜が続いている' },
              { icon: '👶', text: '育児に追われ、自分だけの時間がまったくない' },
              { icon: '🏃', text: '運動したいけどジムに行く時間も気力もない' },
              { icon: '🌫️', text: 'なんとなく体が重い、気分が晴れない日が多い' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-gray-50 dark:bg-navy-800 rounded-xl p-4 border border-gray-100 dark:border-navy-700">
                <span className="text-2xl leading-none mt-0.5">{icon}</span>
                <p className="text-gray-700 dark:text-gray-300 font-medium">{text}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-xl text-navy-700 dark:text-linen-200 font-bold">
            そのままにしておくのは、もったいない。<br />
            <span className="text-sage-600 dark:text-sage-400">45分のヨガが、あなたを変えます。</span>
          </p>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-linen-50 dark:bg-navy-800">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">Reset Yogaの特徴</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            続けられる理由があります
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
      <section className="py-20 px-4 bg-white dark:bg-navy-900">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">はじめ方</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('how_title')}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">登録から初セッションまで、最短5分。</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: t('how_1'), detail: '無料・1分で完了' },
              { step: t('how_2'), detail: 'スタイル・言語で絞り込み' },
              { step: t('how_3'), detail: '好きな日時を選ぶだけ' },
              { step: t('how_4'), detail: '自宅から、スマホでも' },
            ].map(({ step, detail }, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-navy-600 dark:bg-navy-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 group-hover:scale-110 transition-transform shadow-md">
                  {i + 1}
                </div>
                <p className="text-gray-800 dark:text-gray-200 font-bold mb-1">{step}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-sage-50 to-linen-100 dark:from-navy-800 dark:to-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">受講者の声</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
            はじめての方が変わっていきます
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: '育児で毎日くたくたでしたが、週1回45分のヨガが唯一の自分時間になりました。起きた時の体の軽さが全然違います。',
                name: 'M.K さん',
                role: '30代・2児の母',
                stars: 5,
              },
              {
                quote: '残業続きで肩こり・不眠に悩んでいました。先生が丁寧に教えてくれるので、ヨガ未経験でも安心。今では欠かせない習慣に。',
                name: 'T.S さん',
                role: '40代・会社員',
                stars: 5,
              },
              {
                quote: '「自分のための時間」を持つことへの罪悪感がなくなりました。オンラインだから仕事の合間でも受けられるのが最高です。',
                name: 'A.Y さん',
                role: '30代・フリーランス',
                stars: 5,
              },
            ].map(({ quote, name, role, stars }) => (
              <div key={name} className="bg-white dark:bg-navy-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-navy-700">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 text-sm">
                  「{quote}」
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
        <section className="py-20 px-4 bg-white dark:bg-navy-900">
          <div className="max-w-6xl mx-auto">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">講師紹介</p>
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-12">
              あなたを導く講師たち
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {instructors.map((instructor: any) => (
                <Link key={instructor.id} href={`/instructors/${instructor.id}`}>
                  <div className="border border-gray-200 dark:border-navy-700 rounded-2xl p-6 hover:shadow-lg hover:border-navy-200 dark:hover:border-navy-500 transition-all cursor-pointer group bg-white dark:bg-navy-800">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-100 to-sage-100 dark:from-navy-700 dark:to-sage-900/40 flex items-center justify-center text-navy-600 dark:text-navy-200 text-xl font-bold flex-shrink-0">
                        {instructor.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors">
                          {instructor.full_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-gray-600 dark:text-gray-400 font-medium">
                            {instructor.instructor_profiles?.rating?.toFixed(1) || '5.0'}
                          </span>
                          <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">
                            ({instructor.instructor_profiles?.years_experience || 0}年の経験)
                          </span>
                        </div>
                      </div>
                    </div>
                    {instructor.instructor_profiles?.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
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
                  すべての講師を見る →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-to-br from-linen-200 to-sage-50 dark:from-navy-800 dark:to-navy-900">
        <div className="max-w-5xl mx-auto">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest text-center mb-4">料金プラン</p>
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-4">
            {t('pricing_title')}
          </h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">まずは無料体験。続けたくなってから月額プランへ。</p>
          <div className="grid sm:grid-cols-3 gap-6">

            {/* Trial */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 border border-gray-200 dark:border-navy-700 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{t('pricing_trial')}</h3>
              <p className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1">
                ¥0
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">2セッション限定</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '2回の無料体験セッション',
                  'すべての講師にアクセス',
                  'Google Meet 込み',
                  'カード登録が必要（課金なし）',
                ].map((item) => (
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
                人気No.1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('pricing_monthly')}</h3>
              <p className="text-4xl font-extrabold text-white mb-1">
                ¥1,980
              </p>
              <p className="text-sm text-navy-200 mb-6">/ 月（税込）</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '月4回のライブセッション',
                  'すべての講師にアクセス',
                  'Google Meet 込み',
                  'いつでも解約可能',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white">
                    <CheckCircle className="h-4 w-4 text-sage-300 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button className="w-full bg-white text-navy-600 hover:bg-linen-100 rounded-full font-bold">
                  今すぐ始める
                </Button>
              </Link>
            </div>

            {/* Premium (Coming soon) */}
            <div className="bg-white dark:bg-navy-800 rounded-2xl p-8 border-2 border-dashed border-gray-200 dark:border-navy-600 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> 近日公開
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">プレミアム</h3>
              <p className="text-4xl font-extrabold text-gray-400 dark:text-gray-500 mb-1">
                ¥—
              </p>
              <p className="text-sm text-gray-400 mb-6">準備中</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {[
                  '世界のヨガインフルエンサーから学ぶ',
                  '月8回のプレミアムセッション',
                  '専任インストラクター指名',
                  '優先予約・特別コンテンツ',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full rounded-full bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-navy-700 dark:text-navy-400">
                準備中
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-navy-700 dark:bg-navy-900">
        <div className="max-w-2xl mx-auto text-center">
          <Sparkles className="h-10 w-10 text-sage-300 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            今日から、自分のための<br />45分を始めませんか？
          </h2>
          <p className="text-navy-200 text-lg mb-10">
            無料体験2回つき。クレジットカード不要。<br />いつでも解約OK。あなたのペースで続けられます。
          </p>
          <Link href={user ? '/instructors' : '/register'}>
            <Button
              size="lg"
              className="bg-white text-navy-700 hover:bg-linen-100 px-12 py-4 text-lg h-auto rounded-full font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              無料で体験する →
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Instructor CTA ───────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white dark:bg-navy-900 border-t border-gray-100 dark:border-navy-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('instructor_cta_title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('instructor_cta_desc')}</p>
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
      </section>

      <Footer />
    </div>
  )
}
