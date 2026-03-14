import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Heart, Globe, UserCheck, Video, Star, ArrowRight, Quote } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Our Vision | Reset Yoga',
  description: 'Why we built Reset Yoga — a live, human, 45-minute yoga platform for people who keep putting themselves last.',
}

const BELIEFS = [
  {
    icon: Heart,
    en: 'Yoga belongs to everyone — not just those with time, money, or a perfect body.',
    ja: 'ヨガは、時間やお金や体型に関係なく、すべての人のものだと信じています。',
  },
  {
    icon: Video,
    en: 'A real human on the other side of a screen makes all the difference.',
    ja: '画面の向こうに「本物の人間」がいることが、すべてを変えると信じています。',
  },
  {
    icon: UserCheck,
    en: 'The best instructor is the one who knows your name, your week, and your body.',
    ja: 'あなたの名前を、あなたの一週間を、あなたの体を知る講師が、最高の先生だと信じています。',
  },
  {
    icon: Globe,
    en: 'Small, consistent practice outlasts any 30-day challenge.',
    ja: '小さく続ける練習が、どんな30日チャレンジにも勝ると信じています。',
  },
]

const DIFFERENCES = [
  {
    recorded: { en: 'Nobody is watching', ja: '誰も見ていない' },
    reset: { en: 'Your instructor sees you', ja: '講師があなたを見ている' },
  },
  {
    recorded: { en: 'No adjustments for your body', ja: '体型に合わせてもらえない' },
    reset: { en: 'Guided for your body, every session', ja: 'あなたの体に合わせた指導' },
  },
  {
    recorded: { en: '"I\'ll do it later" — and you don\'t', ja: '「後でやろう」でやらない' },
    reset: { en: 'Booked. Committed. Done.', ja: '予約があるから続く' },
  },
  {
    recorded: { en: 'Self-correcting habits go unchecked', ja: '自己流になりがち' },
    reset: { en: 'Real-time form feedback', ja: '正しいフォームをその場で確認' },
  },
]

const STATS = [
  { number: '4.9', label: { en: 'Average instructor rating', ja: '講師の平均評価' } },
  { number: '45', label: { en: 'Minutes per session', ja: '分 / セッション' } },
  { number: '2', label: { en: 'Free sessions to start', ja: '回 無料体験' } },
  { number: '10+', label: { en: 'Countries represented', ja: 'カ国以上の講師・生徒' } },
]

const TESTIMONIALS = [
  {
    quote: {
      en: 'As a mom of two, I was exhausted every day. Now yoga is my only time for myself — I feel so much lighter when I wake up.',
      ja: '2人の子育てで毎日へとへとでした。今はヨガが自分だけの時間。朝目覚めたとき、体がとても軽くなりました。',
    },
    name: 'M.K.',
    role: { en: '30s, mother of two', ja: '30代 / 2児の母' },
  },
  {
    quote: {
      en: 'Overtime left me with stiff shoulders and sleepless nights. My instructor was patient and thorough — now I can\'t imagine my week without yoga.',
      ja: '残業で肩こりと不眠が続いていました。講師がとても丁寧で根気強く教えてくれて、今では週のヨガがないと考えられません。',
    },
    name: 'T.S.',
    role: { en: '40s, office worker', ja: '40代 / 会社員' },
  },
  {
    quote: {
      en: 'I used to feel guilty about taking time for myself. Being online means I can practice during a work break — it\'s been life-changing.',
      ja: '自分の時間を取ることに罪悪感があった。オンラインなので仕事の合間にできる。本当に人生が変わりました。',
    },
    name: 'A.Y.',
    role: { en: '30s, freelancer', ja: '30代 / フリーランス' },
  },
]

export default async function VisionPage() {
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

      {/* ── 1. Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-sage-600/10 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sage-500/10 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 sm:py-36 text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-sage-400 uppercase mb-6">
            {ja ? 'Reset Yoga について' : 'Our Vision'}
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-8 max-w-3xl mx-auto">
            {ja
              ? <>あなたが後回しにしてきた<br className="hidden sm:block" />45分のために。</>
              : <>We built Reset Yoga for the<br className="hidden sm:block" /> 45 minutes you keep putting off.</>}
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            {ja
              ? '「リセット」は、言葉ではなく瞬間のこと。忙しい一日の中で、あなただけのために刻む、静かな45分。'
              : 'Reset is more than a word. It\'s the quiet 45 minutes you carve out of a busy day — just for yourself.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-7 py-3.5 bg-sage-500 hover:bg-sage-600 text-white font-semibold rounded-full text-base transition-colors"
            >
              {ja ? '無料で始める' : 'Start Free'}
            </Link>
            <Link
              href="/instructors"
              className="px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-base transition-colors border border-white/20"
            >
              {ja ? '講師を見る' : 'Meet Our Instructors'}
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/40">
            {ja ? '最初の2回は無料 · クレジットカード不要' : '2 free sessions · No credit card required'}
          </p>
        </div>
      </section>

      {/* ── 2. Why We Exist ───────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-4">
          {ja ? 'なぜ作ったか' : 'Why we exist'}
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
          {ja
            ? <>自分のための時間は、<br className="hidden sm:block" />いつも明日に持ち越される。</>
            : <>Self-care keeps getting pushed<br className="hidden sm:block" /> to tomorrow.</>}
        </h2>
        <p className="text-gray-500 dark:text-navy-300 leading-relaxed mb-12 text-lg">
          {ja
            ? 'あなたのせいではありません。時間がないのではなく、続けられる仕組みがなかっただけです。'
            : "It's not a willpower problem. It's a structure problem. The right system makes 45 minutes feel possible — even on the hardest days."}
        </p>
        <div className="grid sm:grid-cols-2 gap-5 text-left">
          {[
            {
              en: { label: 'Work stress keeping you up at night', body: 'The tension doesn\'t leave when you close your laptop. It stays in your shoulders, your breath, your sleep.' },
              ja: { label: '仕事のストレスで眠れない夜', body: 'パソコンを閉じても緊張は消えない。肩に、呼吸に、眠りに残り続ける。' },
            },
            {
              en: { label: 'Childcare leaving zero time for yourself', body: 'You give everything to everyone else. When does your recovery happen?' },
              ja: { label: '育児で自分の時間がゼロ', body: 'すべてを周りに与え続ける。自分が回復する時間は、いつ？' },
            },
            {
              en: { label: 'Wanting to move, but no time for a gym', body: 'Commuting, changing, waiting for equipment. Too many barriers between you and actually exercising.' },
              ja: { label: '動きたいのにジムに行けない', body: '通勤、着替え、器具の順番待ち。運動とあなたの間に障壁が多すぎる。' },
            },
            {
              en: { label: 'Guilt about taking time for yourself', body: '"I should be doing something productive." You deserve to rest — and rest is productive.' },
              ja: { label: '自分の時間を取ることへの罪悪感', body: '「何か生産的なことをしなければ」。でも、回復こそが生産性。' },
            },
          ].map((item, i) => (
            <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700">
              <p className="font-bold text-gray-900 dark:text-white mb-2">
                {ja ? item.ja.label : item.en.label}
              </p>
              <p className="text-sm text-gray-500 dark:text-navy-300 leading-relaxed">
                {ja ? item.ja.body : item.en.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-lg font-semibold text-navy-700 dark:text-white">
          {ja ? 'だから私たちがいます。' : "That's why we exist."}
        </p>
      </section>

      {/* ── 3. Our Vision — "We Believe" ─────────────────────────────────── */}
      <section className="bg-navy-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-sage-400 uppercase tracking-widest mb-4">
              {ja ? '私たちのビジョン' : 'Our vision'}
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight">
              {ja ? '45分が、すべてを変える世界へ。' : 'A world where 45 minutes changes everything.'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {BELIEFS.map((b, i) => (
              <div key={i} className="flex gap-4 bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="w-10 h-10 flex-shrink-0 bg-sage-500/20 rounded-xl flex items-center justify-center mt-0.5">
                  <b.icon className="h-5 w-5 text-sage-400" />
                </div>
                <p className="text-white/80 leading-relaxed text-sm sm:text-base">
                  {ja ? b.ja : b.en}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Our Difference ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-navy-800 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
              {ja ? 'Reset Yoga の違い' : 'What makes us different'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {ja
                ? '世界中にヨガ動画は何百万とある。\n私たちが届けるのは、それとは違うもの。'
                : 'The internet has millions of yoga videos.\nWe offer something different.'}
            </h2>
          </div>

          {/* 3 pillars */}
          <div className="grid sm:grid-cols-3 gap-6 mb-14">
            {[
              { label: { en: 'Human', ja: '本物の人間' }, desc: { en: 'A real instructor, not an algorithm', ja: 'アルゴリズムではなく、本物の講師' }, color: 'bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400' },
              { label: { en: 'Live', ja: 'ライブ' }, desc: { en: 'Real-time, not pre-recorded', ja: '録画ではなく、リアルタイム' }, color: 'bg-navy-100 dark:bg-navy-700/50 text-navy-700 dark:text-navy-200' },
              { label: { en: 'Personal', ja: 'パーソナル' }, desc: { en: 'Tailored to your body and your week', ja: 'あなたの体と、あなたの一週間に合わせた指導' }, color: 'bg-linen-200 dark:bg-navy-700/50 text-navy-700 dark:text-navy-200' },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-6 text-center ${p.color}`}>
                <p className="text-2xl font-extrabold mb-2">{ja ? p.label.ja : p.label.en}</p>
                <p className="text-sm opacity-75 leading-relaxed">{ja ? p.desc.ja : p.desc.en}</p>
              </div>
            ))}
          </div>

          {/* comparison table */}
          <div className="rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
            <div className="grid grid-cols-2 bg-gray-50 dark:bg-navy-700 text-sm font-bold text-center">
              <div className="py-3 px-4 text-gray-400 dark:text-navy-300">
                {ja ? '録画動画' : 'Recorded videos'}
              </div>
              <div className="py-3 px-4 text-sage-600 dark:text-sage-400 border-l border-gray-200 dark:border-navy-600">
                {ja ? 'Reset Yoga (ライブ)' : 'Reset Yoga (live)'}
              </div>
            </div>
            {DIFFERENCES.map((row, i) => (
              <div key={i} className={`grid grid-cols-2 text-sm ${i % 2 === 0 ? 'bg-white dark:bg-navy-800' : 'bg-gray-50/50 dark:bg-navy-800/50'}`}>
                <div className="py-4 px-4 text-gray-500 dark:text-navy-300 border-b border-gray-100 dark:border-navy-700">
                  {ja ? row.recorded.ja : row.recorded.en}
                </div>
                <div className="py-4 px-4 text-gray-900 dark:text-white font-medium border-l border-b border-gray-100 dark:border-navy-700">
                  ✓ {ja ? row.reset.ja : row.reset.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Instructors ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold tracking-widest text-sage-600 dark:text-sage-400 uppercase mb-4">
                {ja ? '認定講師' : 'Our instructors'}
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
                {ja
                  ? <>インドと日本から。<br />本場の実践を届ける。</>
                  : <>Certified. From India and Japan.\nHere for you.</>}
              </h2>
              <p className="text-gray-500 dark:text-navy-300 leading-relaxed mb-6">
                {ja
                  ? 'すべての講師は審査・承認制。認定資格と実績を持つ講師のみが在籍しています。大手プラットフォームが欧米中心のインストラクターを揃える中、Reset Yogaはヨガ発祥の地・インドと、日本の講師が中心です。'
                  : 'Every instructor on Reset Yoga is personally vetted. Certified credentials and real experience — not just a nice profile photo. While big platforms source from the West, our instructors come from yoga\'s origins: India and Japan.'}
              </p>
              <div className="flex items-center gap-6 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-extrabold text-navy-900 dark:text-white">4.9</p>
                  <p className="text-xs text-gray-500 dark:text-navy-300">{ja ? '平均評価' : 'Avg rating'}</p>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-navy-700" />
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <Link
                href="/instructors"
                className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-semibold rounded-full text-sm transition-colors hover:bg-navy-700 dark:hover:bg-gray-100"
              >
                {ja ? '講師一覧を見る' : 'Meet all instructors'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative">
                  <Image
                    src="/yogainstructor_airi.png"
                    alt="Certified yoga instructor Airi"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 40vw, 20vw"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden aspect-[3/4] relative mt-8">
                  <Image
                    src="/yogainstructor.png"
                    alt="Certified yoga instructor"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 40vw, 20vw"
                  />
                </div>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-navy-800 rounded-full px-4 py-2 shadow-lg border border-gray-100 dark:border-navy-700 text-xs font-semibold text-gray-700 dark:text-white whitespace-nowrap">
                {ja ? '全講師が審査・認定済み' : 'All instructors vetted & certified'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Global Footprint ───────────────────────────────────────────── */}
      <section className="py-24 bg-linen-50 dark:bg-navy-950 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-14">
            <p className="text-xs font-bold tracking-[0.2em] text-sage-600 dark:text-sage-400 uppercase mb-3">
              {ja ? 'グローバルの実績' : 'In the field'}
            </p>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight max-w-lg">
              {ja ? <>どこにいても、<br />本物の実践を。</> : <>Anywhere you need us.</>}
            </h2>
            <p className="mt-4 text-base text-gray-500 dark:text-navy-300 max-w-md leading-relaxed">
              {ja
                ? 'チェンナイの寺院から、フランスの郊外まで。そして、あなたの自宅でも。'
                : 'From a 2,000-year-old temple in South India to a session in southern France — and to your home too.'}
            </p>
          </div>

          <div className="grid grid-cols-12 gap-3 sm:gap-4 h-[480px] sm:h-[560px]">
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

            <div className="col-span-3 rounded-2xl bg-navy-900 dark:bg-navy-700 flex flex-col justify-between p-5 sm:p-7">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] text-sage-400 uppercase mb-3">
                  {ja ? 'あなたの自宅で' : 'Your home'}
                </p>
                <p className="text-white font-bold text-base sm:text-lg leading-snug mb-3">
                  {ja
                    ? <>画面の向こうに、\n本物の講師が\nいます。</>
                    : <>A real instructor,<br />on the other<br />side of your screen.</>}
                </p>
                <p className="text-navy-300 text-xs leading-relaxed">
                  {ja
                    ? 'スタジオでも、自宅でも。大切なのは場所ではなく、そこにいる人。'
                    : 'Studio or living room — what matters is who\'s there with you.'}
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-sage-500 hover:bg-sage-600 px-3.5 py-2 rounded-full transition-colors self-start mt-4"
              >
                {ja ? '無料で始める' : 'Start Free'}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. The Numbers ────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-navy-800 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
            {ja ? '数字の向こうに、人がいる' : 'The numbers are people'}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-14">
            {ja ? '小さく始めて、確かに変わる。' : 'Small steps. Real change.'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-extrabold text-navy-900 dark:text-white mb-2">{s.number}</p>
                <p className="text-sm text-gray-500 dark:text-navy-300">{ja ? s.label.ja : s.label.en}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Student Stories ────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-linen-50 dark:bg-navy-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-sage-600 dark:text-sage-400 uppercase tracking-widest mb-3">
              {ja ? '生徒の声' : 'Student stories'}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {ja ? '週に45分が、どう感じられるか。' : 'What 45 minutes a week feels like.'}
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-navy-800 rounded-2xl p-6 border border-gray-100 dark:border-navy-700 flex flex-col">
                <Quote className="h-6 w-6 text-sage-400 mb-4 flex-shrink-0" />
                <p className="text-gray-700 dark:text-navy-200 text-sm leading-relaxed flex-1 mb-5">
                  {ja ? t.quote.ja : t.quote.en}
                </p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 dark:text-navy-400">{ja ? t.role.ja : t.role.en}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. For Instructors ────────────────────────────────────────────── */}
      <section className="bg-sage-50 dark:bg-navy-800 py-20 px-4 border-t border-sage-100 dark:border-navy-700">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-bold tracking-widest text-sage-600 dark:text-sage-400 uppercase mb-4">
              {ja ? '講師の方へ' : 'For instructors'}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-5 leading-tight">
              {ja
                ? <>本気の生徒と<br />繋がりたいヨガ講師へ。</>
                : <>Are you a yoga teacher looking<br />for students who show up?</>}
            </h2>
            <p className="text-gray-500 dark:text-navy-300 leading-relaxed mb-6">
              {ja
                ? 'Reset Yogaでは、スケジュール管理・集客・決済をすべてプラットフォームが行います。あなたは教えることに集中できます。インド・日本・北米に在籍する認定講師コミュニティに参加しませんか。'
                : "We handle scheduling, discovery, and payments. You focus on teaching. Join a community of certified instructors from India, Japan, and North America — and build a practice you're proud of."}
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 dark:bg-white text-white dark:text-navy-900 font-semibold rounded-full text-sm transition-colors hover:bg-navy-700 dark:hover:bg-gray-100"
            >
              {ja ? '講師として応募する' : 'Apply as an instructor'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
            <Image
              src="/yogainstructor_airi.png"
              alt="Yoga instructor teaching a live session"
              fill
              className="object-cover object-top"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </div>
        </div>
      </section>

      {/* ── 10. Final CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white py-24 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-sage-400 uppercase tracking-widest mb-5">
            {ja ? '今日から始める' : 'Start today'}
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            {ja ? 'あなたの45分は、今日から始まる。' : 'Your 45 minutes start today.'}
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            {ja
              ? '最初の2セッションは完全無料。クレジットカードは不要です。まず試してみてください。'
              : 'Your first 2 sessions are completely free. No credit card needed. Just show up.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-sage-500 hover:bg-sage-600 text-white font-bold rounded-full text-base transition-colors"
            >
              {ja ? '無料で始める' : 'Start Free — 2 Sessions on Us'}
            </Link>
            <Link
              href="/instructors"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full text-base transition-colors border border-white/20"
            >
              {ja ? '講師を探す' : 'Browse Instructors'}
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/40">
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
