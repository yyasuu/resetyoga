import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Refund & Cancellation Policy | Reset Yoga',
}

export default async function RefundPage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Refund &amp; Cancellation Policy
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-2">返金・キャンセルポリシー</p>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: February 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Digital Service — No Refund Policy / デジタル役務の性質について">
            <p className="text-sm">
              Reset Yoga provides a digital subscription service granting immediate access to live online
              yoga sessions. Because the service is delivered electronically and access is granted upon
              payment, <strong>all sales are final and we do not offer refunds</strong> for completed
              billing periods.
            </p>
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              本サービスはデジタル役務であり、決済完了と同時にサービスへのアクセスが提供されます。
              そのため、原則として返金はお受けできません。
            </p>
          </Section>

          <Section title="2. Subscription Cancellation / サブスクリプションの解約">
            <p className="text-sm">
              You may cancel your subscription at any time from your account dashboard or by contacting
              support. Upon cancellation:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Your subscription remains active until the end of the current billing period.</li>
              <li>No further charges will be made after cancellation.</li>
              <li>Unused sessions in the current period are forfeited upon cancellation.</li>
            </ul>
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              解約はダッシュボードまたはサポートへのご連絡にて随時承ります。
              解約後も現在の請求期間終了まではサービスをご利用いただけます。
            </p>
          </Section>

          <Section title="3. Exceptional Refund Cases / 例外的な返金対応">
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
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              上記に該当する場合は、請求日から14日以内にサポートまでご連絡ください。
              当社の裁量により返金またはサービスクレジットにて対応いたします。
            </p>
          </Section>

          <Section title="4. Session Cancellation by Student / 受講者によるセッションキャンセル">
            <p className="text-sm">
              Individual session cancellations are subject to the following policy:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li>Cancellations made <strong>24 hours or more</strong> before the session: the session credit is returned to your account.</li>
              <li>Cancellations made <strong>less than 24 hours</strong> before the session: the session credit is forfeited.</li>
            </ul>
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              セッション開始24時間以上前のキャンセル：セッション回数が返還されます。<br />
              24時間未満のキャンセル：セッション回数は消費されます。
            </p>
          </Section>

          <Section title="5. Session Cancellation by Instructor / 講師都合によるキャンセル">
            <p className="text-sm">
              If an instructor cancels a confirmed session, your session credit will be fully refunded
              to your account. We will also notify you by email as soon as possible.
            </p>
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              講師都合によるキャンセルの場合、セッション回数を返還し、メールにてお知らせします。
            </p>
          </Section>

          <Section title="6. Free Trial / 無料トライアル">
            <p className="text-sm">
              The free trial (2 sessions) requires no credit card and carries no financial obligation.
              Trial sessions do not convert to paid sessions and cannot be carried over after subscribing.
            </p>
            <p className="text-sm mt-2 text-gray-500 dark:text-navy-400">
              無料トライアル（2回）はクレジットカード不要です。未使用のトライアル回数は有料プランへの移行後には引き継がれません。
            </p>
          </Section>

          <Section title="7. Contact / お問い合わせ">
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
