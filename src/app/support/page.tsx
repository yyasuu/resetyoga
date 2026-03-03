import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'
import {
  HelpCircle,
  User,
  Gift,
  CreditCard,
  Calendar,
  Laptop,
  RefreshCw,
  Mail,
  CheckCircle,
  Phone,
} from 'lucide-react'

export const metadata = {
  title: 'サポートセンター | Reset Yoga',
}

export default async function SupportJaPage() {
  let profile: Profile | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">

        {/* ── ヘッダー ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
              サポートセンター
            </h1>
            <p className="text-gray-500 dark:text-navy-400 text-sm mt-1">
              よくあるご質問と使い方ガイド
            </p>
          </div>
          <a
            href="/support/en"
            className="text-sm text-navy-600 dark:text-sage-400 hover:underline whitespace-nowrap ml-4 mt-1"
          >
            View in English →
          </a>
        </div>

        {/* クイックリンク */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 mb-10">
          {[
            { icon: Gift, label: '無料体験',   href: '#trial' },
            { icon: Calendar, label: 'レッスン予約', href: '#booking' },
            { icon: CreditCard, label: 'お支払い',  href: '#payment' },
            { icon: Mail, label: 'お問い合わせ', href: '#contact' },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl py-3 px-2 text-xs font-medium text-navy-700 dark:text-navy-200 hover:border-navy-400 dark:hover:border-sage-400 hover:shadow-sm transition-all text-center"
            >
              <Icon className="h-5 w-5 text-sage-500 dark:text-sage-400" />
              {label}
            </a>
          ))}
        </div>

        <div className="space-y-6">

          {/* ──────────────────────────────────────────────────────────
              1. はじめての方へ
          ──────────────────────────────────────────────────────────── */}
          <Section icon={HelpCircle} color="sage" title="はじめての方へ">
            <QA q="Reset Yoga とはどんなサービスですか？">
              認定ヨガ講師とオンラインでライブヨガセッションを行うサービスです。
              自宅にいながら、ビデオ通話（ブラウザのみ・アプリ不要）で45分間のレッスンを受けることができます。
              まずは2回無料でお試しいただけます。
            </QA>

            <QA q="始めるのに何が必要ですか？">
              <ul className="list-none space-y-2 mt-1">
                <StepItem n={1}>カメラとマイクが付いたパソコン・スマートフォン・タブレット</StepItem>
                <StepItem n={2}>安定したインターネット接続（Wi-Fi推奨）</StepItem>
                <StepItem n={3}>メールアドレス（無料アカウント登録に使用）</StepItem>
                <StepItem n={4}>クレジットカード（無料体験に必要ですが、体験中は請求なし）</StepItem>
              </ul>
            </QA>

            <QA q="どうやって始めればいいですか？ステップを教えてください。">
              <ol className="list-none space-y-3 mt-2">
                <StepItem n={1}>
                  <span className="font-semibold">無料アカウントを作成</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">右上の「新規登録」からメールアドレスで登録、または Google アカウントでサインイン。</span>
                </StepItem>
                <StepItem n={2}>
                  <span className="font-semibold">カードを登録（無料体験用）</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">体験中は一切請求されません。体験終了後も自動的に有料になることはありません。</span>
                </StepItem>
                <StepItem n={3}>
                  <span className="font-semibold">講師を選んでレッスンを予約</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">ダッシュボードから講師一覧を見て、空いている日時を選ぶだけ。</span>
                </StepItem>
                <StepItem n={4}>
                  <span className="font-semibold">予約時間にログインしてレッスン開始</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">ブラウザだけで参加できます。事前にカメラとマイクの動作確認をしておくと安心です。</span>
                </StepItem>
              </ol>
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              2. アカウント・ログイン
          ──────────────────────────────────────────────────────────── */}
          <Section icon={User} color="navy" title="アカウント・ログイン" id="account">
            <QA q="アカウントの登録方法を教えてください。">
              サイト右上の「新規登録」ボタンをクリックし、メールアドレスとパスワードを入力してください。
              登録後、確認メールが届きますので、メール内のリンクをクリックして認証を完了させてください。
              Google アカウントをお持ちの場合は「Googleでログイン」からも登録できます。
            </QA>

            <QA q="確認メールが届きません。">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>迷惑メールフォルダをご確認ください。</li>
                <li>登録したメールアドレスが正しいかご確認ください。</li>
                <li>数分待っても届かない場合は、登録ページから再送信できます。</li>
                <li>上記を試しても届かない場合は、<ContactLink /> までご連絡ください。</li>
              </ul>
            </QA>

            <QA q="パスワードを忘れてしまいました。">
              ログインページの「パスワードをお忘れですか？」リンクをクリックし、登録したメールアドレスを入力してください。
              パスワード再設定メールが届きますので、メール内のリンクから新しいパスワードを設定してください。
            </QA>

            <QA q="Google アカウントでもログインできますか？">
              はい。ログインページの「Google でログイン」ボタンからご利用いただけます。
              初回ログイン時は自動的にアカウントが作成されます。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              3. 無料体験
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Gift} color="sage" title="無料体験について" id="trial">
            <QA q="無料体験とはどんな内容ですか？">
              アカウント登録後、2回分のヨガセッションを完全無料でお試しいただけます。
              セッションの内容・講師の選び方・予約方法など、すべて月額会員と同じ条件でご体験いただけます。
            </QA>

            <QA q="無料体験にクレジットカードの登録が必要なのはなぜですか？">
              セッションの予約確保のためにカード情報の登録をお願いしています。
              ただし、<strong>無料体験中は一切請求されません</strong>。
              体験終了後も自動的に有料プランへ移行することはなく、ご自身でお申し込みいただく形になります。
            </QA>

            <QA q="体験後、自動的に有料になりますか？">
              なりません。無料体験（2回）が終了しても、自動的に月額プランへ切り替わることはありません。
              引き続きご利用されたい場合は、「サブスクリプション」ページから月額プランへお申し込みください。
            </QA>

            <QA q="無料体験は何回でも使えますか？">
              お一人のアカウントにつき1回限りです。2回のセッションをご体験いただけます。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              4. レッスンの予約・受け方
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Calendar} color="navy" title="レッスンの予約・受け方" id="booking">
            <QA q="レッスンの予約方法を教えてください。">
              <ol className="list-none space-y-2 mt-1">
                <StepItem n={1}>ログイン後、ダッシュボードの「講師を探す」または「Instructors」ページへ。</StepItem>
                <StepItem n={2}>気になる講師のプロフィールを開き、「予約する」をクリック。</StepItem>
                <StepItem n={3}>カレンダーから希望の日時（空き枠）を選択。</StepItem>
                <StepItem n={4}>内容を確認して「予約を確定」すれば完了です。確認メールが届きます。</StepItem>
              </ol>
            </QA>

            <QA q="レッスンはどうやって受ければいいですか？">
              予約時間になったらログインし、ダッシュボードまたは「予約一覧」から予約を確認して「参加する」ボタンをクリックしてください。
              ブラウザ上でビデオ通話が始まります。<strong>Zoom などのアプリのダウンロードは不要です。</strong>
              初回は事前にカメラとマイクへのアクセスを許可してください。
            </QA>

            <QA q="レッスン前に準備することはありますか？">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>ヨガマット（床が滑らないよう）</li>
                <li>動きやすい服装</li>
                <li>画面に全身が映る程度のスペース</li>
                <li>ブラウザは最新版の Chrome 推奨</li>
                <li>レッスン開始の5分前にログインして接続確認しておくと安心です。</li>
              </ul>
            </QA>

            <QA q="予約のキャンセル・変更はできますか？">
              レッスン開始の<strong>24時間前まで</strong>であれば、予約一覧からキャンセルまたは変更が可能です。
              24時間を切った後のキャンセルはセッション消費としてカウントされます。
            </QA>

            <QA q="講師が現れない・接続できなかった場合はどうなりますか？">
              講師都合でセッションが実施できなかった場合は、そのセッション分のクレジットを返還いたします。
              お困りの際は <ContactLink /> までご連絡ください。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              5. お支払い・サブスクリプション
          ──────────────────────────────────────────────────────────── */}
          <Section icon={CreditCard} color="sage" title="お支払い・サブスクリプション" id="payment">
            <QA q="料金はいくらですか？">
              月額 <strong>US$19.99</strong>（税別）で、月4回（各45分）のライブセッションを受けられます。
              無料体験は2回分無料でご利用いただけます。
            </QA>

            <QA q="使えるカードの種類を教えてください。">
              Visa・Mastercard・American Express 等、主要なクレジットカードをご利用いただけます。
              決済は Stripe, Inc. の安全なシステムを通じて処理されます。カード情報は Reset Yoga のサーバーには保存されません。
            </QA>

            <QA q="請求はいつ発生しますか？">
              月額プランへお申し込みいただいた日に初回請求が発生し、以降は毎月同日に自動更新・自動引き落としとなります。
              解約手続きをされない限り、毎月継続して請求されます。
            </QA>

            <QA q="請求書・領収書は発行してもらえますか？">
              Stripe の決済システムから自動的に領収書メールが送信されます。
              再発行が必要な場合は <ContactLink /> までお知らせください。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              6. 解約・返金
          ──────────────────────────────────────────────────────────── */}
          <Section icon={RefreshCw} color="navy" title="解約・返金" id="cancel">
            <QA q="解約方法を教えてください。">
              <ol className="list-none space-y-2 mt-1">
                <StepItem n={1}>ログイン後、ナビゲーションメニューの「サブスクリプション」を開く。</StepItem>
                <StepItem n={2}>「解約する」ボタンをクリック。</StepItem>
                <StepItem n={3}>確認画面で「解約を確定する」を選択。</StepItem>
              </ol>
              <p className="mt-2 text-sm text-gray-500 dark:text-navy-400">
                解約に手数料・違約金は一切かかりません。いつでも手続きできます。
              </p>
            </QA>

            <QA q="解約後もサービスは使えますか？">
              はい。解約後も、すでにお支払いいただいた期間の末日まではサービスをご利用いただけます。
              たとえば月の途中で解約した場合も、その月の終わりまでレッスンを受けることができます。
            </QA>

            <QA q="返金はしてもらえますか？">
              デジタルサービスの性質上、お客様都合による返金は原則お受けしておりません（法令上必要な場合を除く）。
              ただし、以下の場合は対応いたします：
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                <li>講師都合でセッションが実施できなかった場合 → セッションクレジットを返還</li>
                <li>システム障害など当社都合でサービスを提供できなかった場合 → 代替セッションまたは返金</li>
                <li>二重請求が発生した場合 → 速やかに返金または取消</li>
              </ul>
              詳しくは <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">返金・キャンセルポリシー</a> をご覧ください。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              7. 技術的なご質問
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Laptop} color="sage" title="技術的なご質問" id="technical">
            <QA q="動作環境を教えてください。">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>カメラとマイクが付いたデバイス（PC・Mac・スマートフォン・タブレット）</li>
                <li>安定したインターネット接続（Wi-Fi または 4G/5G 推奨）</li>
                <li>ブラウザ：最新版の Chrome（推奨）、Safari、Firefox、Edge</li>
                <li>専用アプリのダウンロードは不要です。</li>
              </ul>
            </QA>

            <QA q="カメラ・マイクが認識されません。">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>ブラウザのアドレスバー左にある🔒アイコンをクリックし、カメラ・マイクのアクセスを「許可」に変更してください。</li>
                <li>他のアプリ（Zoom など）がカメラを使用中の場合は終了してください。</li>
                <li>ページを再読み込みしてもう一度お試しください。</li>
                <li>解決しない場合は Chrome の設定 → プライバシーとセキュリティ → カメラ・マイク の許可状況をご確認ください。</li>
              </ul>
            </QA>

            <QA q="映像・音声が途切れます。">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>Wi-Fi ルーターに近い場所でお試しください。</li>
                <li>同一ネットワーク上で動画視聴や大容量ダウンロードをしているデバイスがあれば、一時的に停止してください。</li>
                <li>ブラウザのタブを他に多く開いている場合は閉じてください。</li>
                <li>接続速度の目安：下り・上り 2Mbps 以上が必要です。</li>
              </ul>
            </QA>

            <QA q="スマートフォンからも参加できますか？">
              はい。iOS（Safari）および Android（Chrome）のブラウザからご参加いただけます。
              画面が小さいため、できれば横向きでのご利用をおすすめします。
              カメラとマイクのアクセス許可をブラウザに与えてください。
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              8. お問い合わせ
          ──────────────────────────────────────────────────────────── */}
          <div id="contact" className="bg-navy-900 dark:bg-navy-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-sage-400 flex-shrink-0" />
              <h2 className="text-xl font-bold">お問い合わせ</h2>
            </div>
            <p className="text-navy-300 mb-6 leading-relaxed">
              上記で解決しない場合は、お気軽にご連絡ください。
              担当スタッフが丁寧にご対応いたします。
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-sage-400" />
                  <span className="font-semibold text-sm">メール</span>
                </div>
                <a
                  href="mailto:support@tryresetyoga.com"
                  className="text-sage-300 hover:text-white underline break-all"
                >
                  support@tryresetyoga.com
                </a>
                <p className="text-navy-400 text-xs mt-1">24時間受付・通常2営業日以内に返信</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-sage-400" />
                  <span className="font-semibold text-sm">電話</span>
                </div>
                <p className="text-sage-300">090-8094-4582</p>
                <p className="text-navy-400 text-xs mt-1">平日 10:00〜18:00（土日祝除く）</p>
              </div>
            </div>

            <a
              href="mailto:support@tryresetyoga.com"
              className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Mail className="h-4 w-4" />
              メールでお問い合わせ
            </a>
          </div>

        </div>

        <p className="text-xs text-gray-400 dark:text-navy-500 mt-8 text-right">
          最終更新：2026年3月
        </p>
      </main>

      <Footer />
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const colorMap = {
  sage: {
    bg: 'bg-sage-50 dark:bg-navy-800',
    border: 'border-sage-300 dark:border-sage-700',
    icon: 'text-sage-600 dark:text-sage-400',
    title: 'text-sage-800 dark:text-sage-300',
  },
  navy: {
    bg: 'bg-blue-50 dark:bg-navy-800',
    border: 'border-navy-300 dark:border-navy-600',
    icon: 'text-navy-600 dark:text-navy-300',
    title: 'text-navy-800 dark:text-navy-200',
  },
}

function Section({
  icon: Icon,
  color,
  title,
  id,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: 'sage' | 'navy'
  title: string
  id?: string
  children: React.ReactNode
}) {
  const c = colorMap[color]
  return (
    <div id={id} className={`rounded-2xl border ${c.bg} ${c.border} overflow-hidden`}>
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${c.border}`}>
        <Icon className={`h-5 w-5 flex-shrink-0 ${c.icon}`} />
        <h2 className={`text-base font-bold ${c.title}`}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-navy-700">
        {children}
      </div>
    </div>
  )
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <p className="font-semibold text-navy-800 dark:text-white mb-2 flex items-start gap-2">
        <span className="text-sage-500 dark:text-sage-400 font-bold flex-shrink-0">Q.</span>
        {q}
      </p>
      <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-6">
        {children}
      </div>
    </div>
  )
}

function StepItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-500 dark:bg-sage-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-gray-600 dark:text-gray-300">{children}</span>
    </li>
  )
}

function ContactLink() {
  return (
    <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
      support@tryresetyoga.com
    </a>
  )
}
