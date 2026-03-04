import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: '特定商取引法に基づく表記 | Reset Yoga',
}

export default async function TokushoJaPage() {
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
            特定商取引法に基づく表記
          </h1>
          <a
            href="/tokusho/en"
            className="text-sm text-navy-600 dark:text-sage-400 hover:underline whitespace-nowrap ml-4"
          >
            View in English →
          </a>
        </div>

        <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">

              <Row label="販売業者">
                雪吉靖彦
              </Row>
              <Row label="屋号">
                Reset Yoga
              </Row>
              <Row label="代表者名">
                雪吉靖彦
              </Row>
              <Row label="所在地">
                請求があった場合には速やかに開示いたします。
              </Row>
              <Row label="電話番号">
                090-8094-4582<br />
                電話受付時間：平日 10:00〜18:00（土日祝日を除く）
              </Row>
              <Row label="メールアドレス">
                <a
                  href="mailto:support@tryresetyoga.com"
                  className="text-navy-600 dark:text-sage-400 underline"
                >
                  support@tryresetyoga.com
                </a>
                <br />
                メール受付時間：24時間<br />
                通常2営業日以内に返信いたします。
              </Row>

              <Row label="販売URL">
                <a href="https://tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  https://tryresetyoga.com
                </a>
              </Row>
              <Row label="役務の内容">
                オンラインヨガレッスンのサブスクリプションサービス。月4回（各45分）の認定講師によるライブビデオセッションをご提供します。
              </Row>
              <Row label="販売価格">
                月額 US$19.99（税金が適用される場合は決済時に表示されます）<br />
                無料トライアル：2回のセッション（料金なし）。カード登録必要・トライアル中の請求なし。<br />
                ※ 無料トライアルは月額プランへ自動移行しません。月額プランへの加入はお客様ご自身でお申込みください。
              </Row>
              <Row label="代金以外の必要料金">
                インターネット接続にかかる通信費はお客様のご負担となります。<br />
                外貨建て決済に伴い、カード会社所定の為替手数料・海外事務手数料等が発生する場合があります。詳細はご利用のカード会社にご確認ください。
              </Row>
              <Row label="代金の支払い方法">
                クレジットカード（Visa・Mastercard・American Express 等）<br />
                決済代行会社：Stripe, Inc.（当社はStripeの安全な決済プラットフォームを通じて決済を受け付けています）
              </Row>
              <Row label="代金の支払い時期">
                お申込み時に初回請求が発生します。<br />
                以降、毎月同日に自動更新・自動課金されます。<br />
                解約のお手続きをされない限り継続課金となります。
              </Row>
              <Row label="継続課金・自動更新">
                月額プランは<strong>月単位の自動更新契約</strong>です。契約期間の定めはなく（無期限）、解約されるまで毎月 US$19.99 が自動的に請求されます。<br />
                初回請求はサブスクリプション登録時に発生し、以降は毎月同日に更新・請求されます。
              </Row>
              <Row label="役務の提供時期">
                決済完了後、即時ご利用いただけます。
              </Row>
              <Row label="申込有効期限">
                各月の募集定員に達した場合、申込受付を終了することがあります。最新の空き状況はサービスサイトにてご確認ください。
              </Row>
              <Row label="解約方法">
                アカウントにログイン後、「サブスクリプション」ページ（
                <a href="https://tryresetyoga.com/subscription" className="text-navy-600 dark:text-sage-400 underline">
                  tryresetyoga.com/subscription
                </a>
                ）から、いつでも解約手続きが可能です。<br />
                解約に際して違約金・手数料は一切発生しません。
              </Row>

              <Row label="返品・返金・不備時対応">
                <strong>返品・返金・キャンセルについて</strong><br />
                本サービスはデジタル役務のため、お客様都合による返金は、法令上必要な場合を除き原則としてお受けしておりません。<br />
                サブスクリプションは次回請求日の前日までに解約した場合、次回以降の請求は発生しません。解約後も、既にお支払済みの請求期間の末日まではサービスをご利用いただけます。<br />
                当月中の未使用セッションは、請求期間終了後に失効します。<br />
                <br />
                <strong>サービス不備・当社都合による対応</strong><br />
                講師都合により確定済みセッションを実施できなかった場合は、当該セッション分のクレジットを返還します。<br />
                システム障害その他当社の責に帰すべき事由によりサービスを提供できなかった場合は、代替セッションの提供、サービスクレジットの付与、または返金により対応します。<br />
                <br />
                <strong>二重請求・不正請求への対応</strong><br />
                二重請求が確認された場合は、確認後速やかに返金または請求取消を行います。<br />
                不正利用の疑いがある場合は、請求日から14日以内に{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>{' '}
                までご連絡ください。
              </Row>

              <Row label="動作環境">
                安定したインターネット接続環境が必要です。ビデオ通話が動作するブラウザ（最新版のChrome推奨）およびカメラ・マイクを備えたデバイスが必要です。
              </Row>
              <Row label="免責事項">
                通信障害・天災・不可抗力その他当社の責に帰さない事由によりサービスが提供できない場合、当社は責任を負いかねます。
              </Row>
              <Row label="問い合わせ対応時間">
                電話：090-8094-4582（平日 10:00〜18:00、土日祝日を除く）<br />
                メール：<a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">support@tryresetyoga.com</a>（24時間受付）<br />
                返信目安：通常2営業日以内
              </Row>

            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 dark:text-navy-500 mt-6 text-right">
          最終更新：2026年3月
        </p>
      </main>

      <Footer />
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="flex flex-col sm:table-row">
      <td className="px-6 py-4 font-semibold text-navy-700 dark:text-navy-200 bg-gray-50 dark:bg-navy-800 w-full sm:w-48 align-top whitespace-nowrap">
        {label}
      </td>
      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </td>
    </tr>
  )
}
