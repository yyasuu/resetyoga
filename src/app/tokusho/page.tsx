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
                  Reset Yoga
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
                  月額 US$19.99（税込）<br />
                  ※ 無料トライアル期間中（2回まで）は課金されません。
                </Row>
                <Row label="代金の支払い方法">
                  クレジットカード（Visa・Mastercard・American Express 等）<br />
                  決済代行：Stripe, Inc.
                </Row>
                <Row label="代金の支払い時期">
                  お申込み時に初回請求が発生します。以降、毎月同日に自動更新・請求されます。
                </Row>
                <Row label="役務の提供時期">
                  決済完了後、即時ご利用いただけます。
                </Row>
                <Row label="返品・キャンセルについて">
                  デジタルコンテンツ・役務の性質上、原則として返金・キャンセルはお受けできません。<br />
                  次回請求日の前日までにサブスクリプションを解約した場合、以降の請求は発生しません。<br />
                  例外的な対応については{' '}
                  <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">
                    返金・キャンセルポリシー
                  </a>{' '}
                  をご参照ください。
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
            最終更新：2026年2月
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
                Reset Yoga
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
                US$19.99 / month (inclusive of all fees)<br />
                Free trial includes 2 sessions at no charge.
              </Row>
              <Row label="Payment Method">
                Credit card (Visa, Mastercard, American Express, etc.)<br />
                Payment processed by Stripe, Inc.
              </Row>
              <Row label="Payment Timing">
                First charge occurs at the time of subscription. Subsequent charges are billed automatically on the same date each month.
              </Row>
              <Row label="Service Availability">
                Access is granted immediately upon successful payment.
              </Row>
              <Row label="Cancellation & Refunds">
                Due to the nature of digital services, refunds for completed billing periods are not offered as a general rule.<br />
                Cancelling before the next billing date stops future charges.<br />
                See our{' '}
                <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">
                  Refund &amp; Cancellation Policy
                </a>{' '}
                for exceptions.
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
          Last updated: February 2026
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
