import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Refund & Cancellation Policy | Reset Yoga',
}

export default async function RefundPage() {
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
      <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
        <Navbar user={profile} />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
            返金・キャンセルポリシー
          </h1>
          <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">最終更新日：2026年2月</p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">

            <Section title="第1条（デジタルサービスの返金不可方針）">
              <p className="text-sm">
                Reset Yogaはライブオンラインヨガセッションへの即時アクセスを提供するデジタルサブスクリプションサービスです。
                サービスは電子的に提供され、支払い時にアクセスが付与されるため、
                <strong>完了した請求期間に対する返金は原則行いません。</strong>
              </p>
            </Section>

            <Section title="第2条（サブスクリプションのキャンセル）">
              <p className="text-sm">
                サブスクリプションはアカウントダッシュボードまたはサポートへの連絡によりいつでもキャンセルできます。
                キャンセル後の取り扱い：
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li>サブスクリプションは現在の請求期間末日まで有効です。</li>
                <li>キャンセル後に追加の請求は発生しません。</li>
                <li>現在の期間に残った未使用セッションはキャンセル時に失効します。</li>
              </ul>
            </Section>

            <Section title="第3条（例外的な返金対応）">
              <p className="text-sm">
                以下の場合に限り、当社の裁量により返金またはサービスクレジットを発行することがあります：
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li>
                  <strong>システム障害：</strong>プラットフォーム側の確認済みエラーによりセッションが提供できなかった場合。
                </li>
                <li>
                  <strong>二重請求：</strong>同一請求期間に複数回請求された場合。
                </li>
                <li>
                  <strong>不正請求：</strong>取引を承認しておらず、14日以内に申告した場合。
                </li>
              </ul>
              <p className="text-sm mt-2">
                例外対応をご希望の場合は、請求から<strong>14日以内</strong>に注文詳細を添えて{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>
                {' '}までご連絡ください。
              </p>
            </Section>

            <Section title="第4条（生徒によるセッションキャンセル）">
              <p className="text-sm">
                個別セッションのキャンセルには以下のポリシーが適用されます：
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li>セッション開始<strong>12時間超前</strong>のキャンセル：セッションクレジットをアカウントに返還します。</li>
                <li>セッション開始<strong>12時間以内</strong>のキャンセル：セッションクレジットは失効します。</li>
              </ul>
            </Section>

            <Section title="第5条（講師によるセッションキャンセル）">
              <p className="text-sm">
                講師が確定済みセッションをキャンセルした場合、セッションクレジットをアカウントに全額返還します。
                また、できる限り速やかにメールでお知らせします。
              </p>
            </Section>

            <Section title="第6条（無料体験）">
              <p className="text-sm">
                無料体験（2回）には支払い方法の登録が必要ですが、初回請求は発生しません。
                体験セッションは有料セッションへの繰り越しができず、サブスクリプション登録後に持ち越すことはできません。
              </p>
            </Section>

            <Section title="第7条（お問い合わせ）">
              <p className="text-sm">
                ご質問や返金リクエストは、{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>
                {' '}までご連絡ください。2営業日以内にご返答いたします。
              </p>
            </Section>

          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: February 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Digital Service — No Refund Policy">
            <p className="text-sm">
              Reset Yoga provides a digital subscription service granting immediate access to live online
              yoga sessions. Because the service is delivered electronically and access is granted upon
              payment, <strong>all sales are final and we do not offer refunds</strong> for completed
              billing periods.
            </p>
          </Section>

          <Section title="2. Subscription Cancellation">
            <p className="text-sm">
              You may cancel your subscription at any time from your account dashboard or by contacting
              support. Upon cancellation:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Your subscription remains active until the end of the current billing period.</li>
              <li>No further charges will be made after cancellation.</li>
              <li>Unused sessions in the current period are forfeited upon cancellation.</li>
            </ul>
          </Section>

          <Section title="3. Exceptional Refund Cases">
            <p className="text-sm">
              We may issue a refund or service credit at our sole discretion in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>
                <strong>Technical failure:</strong> A session could not be delivered due to a verified
                platform-side error.
              </li>
              <li>
                <strong>Duplicate charge:</strong> You were charged more than once for the same billing period.
              </li>
              <li>
                <strong>Unauthorized charge:</strong> You did not authorize the transaction and reported it
                within 14 days.
              </li>
            </ul>
            <p className="text-sm mt-2">
              To request an exception, contact{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>{' '}
              within <strong>14 days</strong> of the charge with your order details.
            </p>
          </Section>

          <Section title="4. Session Cancellation by Student">
            <p className="text-sm">
              Individual session cancellations are subject to the following policy:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Cancellations made <strong>more than 12 hours</strong> before the session: the session credit is returned to your account.</li>
              <li>Cancellations made <strong>12 hours or less</strong> before the session: the session credit is forfeited.</li>
            </ul>
          </Section>

          <Section title="5. Session Cancellation by Instructor">
            <p className="text-sm">
              If an instructor cancels a confirmed session, your session credit will be fully refunded
              to your account. You will also be notified by email as soon as possible.
            </p>
          </Section>

          <Section title="6. Free Trial">
            <p className="text-sm">
              The free trial (2 sessions) requires a payment method on file but carries no initial charge.
              Trial sessions do not convert to paid sessions and cannot be carried over after subscribing.
            </p>
          </Section>

          <Section title="7. Contact">
            <p className="text-sm">
              For any questions or refund requests, contact our support team at{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>
              . We aim to respond within 2 business days.
            </p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-navy-800 dark:text-navy-100 mb-2">{title}</h2>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </section>
  )
}
