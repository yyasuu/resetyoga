import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: '特定商取引法に基づく表記 | Reset Yoga',
}

export default async function TokushoPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  let profile: Profile | null = null
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      profile = data
    }
  } catch {}

  if (locale === 'ja') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
        <Navbar user={profile} />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-8">
            特定商取引法に基づく表記
          </h1>

          <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
                <Row label="販売業者">
                  Reset Yoga（個人事業主：雪吉愛里）
                </Row>
                <Row label="運営統括責任者">
                  雪吉愛里
                </Row>
                <Row label="所在地">
                  請求があった場合には遅滞なく開示いたします。
                </Row>
                <Row label="電話番号">
                  請求があった場合には遅滞なく開示いたします。
                </Row>
                <Row label="メールアドレス">
                  <a
                    href="mailto:support@tryresetyoga.com"
                    className="text-navy-600 dark:text-sage-400 underline"
                  >
                    support@tryresetyoga.com
                  </a>
                </Row>
                <Row label="販売URL">
                  <a
                    href="https://tryresetyoga.com"
                    className="text-navy-600 dark:text-sage-400 underline"
                  >
                    https://tryresetyoga.com
                  </a>
                </Row>
                <Row label="役務の内容">
                  オンラインヨガレッスンのサブスクリプションサービス。月4回（各45分）の認定講師によるライブビデオセッションをご提供します。
                </Row>
                <Row label="販売価格">
                  月額 US$19.99（税金が適用される場合は決済時に表示されます）<br />
                  無料トライアル：2回のセッション（料金なし）。お支払い方法の登録が必要ですが、トライアル中は課金されません。<br />
                  ※ 無料トライアルは月額プランへ自動移行しません。月額プランへの加入はお客様ご自身でお申込みください。
                </Row>
                <Row label="代金以外の必要料金">
                  インターネット接続にかかる通信費はお客様のご負担となります。
                </Row>
                <Row label="継続課金・自動更新">
                  月額プランは<strong>月単位の自動更新契約</strong>です。契約期間の定めはなく（無期限）、解約されるまで毎月 US$19.99 が自動的に請求されます。<br />
                  初回請求はサブスクリプション登録時に発生し、以降は毎月同日に更新・請求されます。
                </Row>
                <Row label="代金の支払い方法">
                  クレジットカード（Visa・Mastercard・American Express 等）<br />
                  決済代行会社：Stripe, Inc.（当社はStripeを通じて決済を受け付けています）
                </Row>
                <Row label="代金の支払い時期">
                  お申込み時に初回請求が発生します。<br />
                  以降、毎月同日に自動更新・自動課金されます。<br />
                  解約のお手続きをされない限り継続課金となります。
                </Row>
                <Row label="役務の提供時期">
                  決済完了後、即時ご利用いただけます。
                </Row>
                <Row label="申込有効期限">
                  募集定員に達した場合、申込受付を終了する場合があります。
                </Row>
                <Row label="返品・キャンセルについて">
                  サービスの性質上、提供開始後の返金は法律上の義務がある場合を除きお受けできません。<br />
                  次回請求日の前日までにサブスクリプションを解約した場合、以降の請求は発生しません。解約後も現在の請求期間末日までサービスをご利用いただけます。<br />
                  例外的な対応については{' '}
                  <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">
                    返金・キャンセルポリシー
                  </a>{' '}
                  をご参照ください。
                </Row>
                <Row label="解約方法">
                  アカウントにログイン後、「サブスクリプション」ページ（
                  <a href="https://tryresetyoga.com/subscription" className="text-navy-600 dark:text-sage-400 underline">
                    tryresetyoga.com/subscription
                  </a>
                  ）から、いつでも解約手続きが可能です。<br />
                  解約に際して違約金・手数料は一切発生しません。手続きが不明な場合は{' '}
                  <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                    support@tryresetyoga.com
                  </a>{' '}
                  までお問い合わせください。
                </Row>
                <Row label="サービス不備時の対応">
                  講師側の都合によりセッションが実施できない場合は、セッションクレジットを返還します。<br />
                  システム障害等により当社の責に帰すべき事由でサービスが提供できない場合は、次月への振り替えまたはご返金にて対応いたします。
                </Row>
                <Row label="動作環境">
                  安定したインターネット接続環境が必要です。ビデオ通話が動作するブラウザ（最新版のChrome推奨）およびカメラ・マイクを備えたデバイスが必要です。
                </Row>
                <Row label="免責事項">
                  通信障害・天災・不可抗力その他当社の責に帰さない事由によりサービスが提供できない場合、当社は責任を負いかねます。
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Legal Disclosure
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">
          Required disclosure under Japan&apos;s Act on Specified Commercial Transactions
        </p>

        <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
              <Row label="Business Operator">
                Reset Yoga (Sole proprietor: Airi Yukiyoshi)
              </Row>
              <Row label="Responsible Manager">
                Airi Yukiyoshi
              </Row>
              <Row label="Address">
                Disclosed promptly upon request.
              </Row>
              <Row label="Phone Number">
                Disclosed promptly upon request.
              </Row>
              <Row label="Email">
                <a
                  href="mailto:support@tryresetyoga.com"
                  className="text-navy-600 dark:text-sage-400 underline"
                >
                  support@tryresetyoga.com
                </a>
              </Row>
              <Row label="Service URL">
                <a
                  href="https://tryresetyoga.com"
                  className="text-navy-600 dark:text-sage-400 underline"
                >
                  https://tryresetyoga.com
                </a>
              </Row>
              <Row label="Service Description">
                Online yoga subscription service providing 4 live 45-minute sessions per month with certified instructors via video call.
              </Row>
              <Row label="Price">
                US$19.99 / month (applicable taxes, if any, will be displayed at checkout)<br />
                Free trial: 2 sessions at no charge. A payment method is required but no charge is made during the trial.<br />
                The free trial does not automatically convert to a paid plan. You must subscribe manually to activate the monthly plan.
              </Row>
              <Row label="Additional Costs">
                The cost of internet connectivity required to use the service is borne by the customer.
              </Row>
              <Row label="Recurring Charges &amp; Auto-Renewal">
                The monthly plan is an <strong>auto-renewing subscription with no fixed term</strong> (indefinite). US$19.99 is charged automatically each month until you cancel.<br />
                The first charge occurs when you subscribe. Subsequent charges are billed on the same date each month.
              </Row>
              <Row label="Payment Method">
                Credit card (Visa, Mastercard, American Express, etc.)<br />
                Payment processed by Stripe, Inc. (We accept payments through Stripe's secure payment platform.)
              </Row>
              <Row label="Payment Timing">
                First charge occurs at the time of subscription.<br />
                Subsequent charges are billed automatically on the same date each month.<br />
                Charges continue until you cancel.
              </Row>
              <Row label="Service Availability">
                Access is granted immediately upon successful payment.
              </Row>
              <Row label="Application Period">
                Applications may close when capacity is reached.
              </Row>
              <Row label="Cancellation &amp; Refunds">
                Due to the nature of the service, refunds after service commencement cannot be provided except as required by applicable law.<br />
                Cancelling before the next billing date stops future charges. Access continues until the end of the current billing period.<br />
                See our{' '}
                <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">
                  Refund &amp; Cancellation Policy
                </a>{' '}
                for exceptions.
              </Row>
              <Row label="How to Cancel">
                Log in to your account and visit the Subscription page (
                <a href="https://tryresetyoga.com/subscription" className="text-navy-600 dark:text-sage-400 underline">
                  tryresetyoga.com/subscription
                </a>
                ) to cancel at any time.<br />
                No cancellation fees apply. For assistance, contact{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>.
              </Row>
              <Row label="Service Issues">
                If an instructor cancels a session, your session credit will be returned.<br />
                If the service cannot be provided due to reasons attributable to us (e.g., system failures), we will arrange a make-up session or issue a refund.
              </Row>
              <Row label="System Requirements">
                A stable internet connection is required. A browser capable of video calls (latest Chrome recommended) and a device with a camera and microphone are needed.
              </Row>
              <Row label="Disclaimer">
                Reset Yoga is not liable for service interruptions caused by network failures, natural disasters, force majeure, or other circumstances beyond our control.
              </Row>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 dark:text-navy-500 mt-6 text-right">
          Last updated: March 2026
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
