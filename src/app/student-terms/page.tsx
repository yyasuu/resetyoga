import { cookies } from 'next/headers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Student Terms & Conditions | Reset Yoga',
}

export default async function StudentTermsPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  if (locale === 'ja') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
        <Navbar user={null} />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
            生徒利用規約
          </h1>
          <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">最終更新日：2026年3月</p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">

            <Section title="第1条（同意）">
              <p className="text-sm">
                Reset Yoga（以下「プラットフォーム」）の生徒登録を完了することにより、あなたはこの生徒利用規約に同意したものとみなします。
                サービスを利用する前に、内容をよくお読みください。
              </p>
            </Section>

            <Section title="第2条（プラットフォーム外でのセッション禁止：非迂回条項）">
              <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                最も重要な条項です。違反した場合は即時アカウント永久停止となります。
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
                <li>
                  Reset Yogaを通じて知り合った講師に対して、<strong>プラットフォーム外</strong>でのヨガセッションやその他の指導を連絡・勧誘・手配してはなりません。
                </li>
                <li>
                  プラットフォーム外でのレッスン手配を目的として、講師と個人の連絡先（メール・電話・LINE・WhatsApp・SNS等）を交換してはなりません。
                </li>
                <li>
                  この禁止事項は、在籍中および<strong>最後のセッション実施日から12ヶ月間</strong>有効です。
                </li>
                <li>
                  プラットフォームを迂回したと判断された場合、アカウントは永久停止となり、プラットフォーム外で実施したセッションに相当する損害賠償を請求される場合があります。
                </li>
              </ul>
            </Section>

            <Section title="第3条（予約・キャンセル）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>セッションはReset Yogaプラットフォームを通じてのみ予約できます。</li>
                <li>セッション開始<strong>12時間超前</strong>のキャンセル：セッションクレジットを返還します。</li>
                <li>セッション開始<strong>12時間以内</strong>のキャンセル：セッションクレジットは失効します。</li>
                <li>無断欠席を繰り返した場合、アカウントを停止することがあります。</li>
              </ul>
            </Section>

            <Section title="第4条（セッションの実施）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>セッション中は常に講師に対して礼儀正しく接してください。</li>
                <li>講師の明示的な同意なしにセッションを録画してはなりません。</li>
                <li>安定したインターネット接続環境と、セッションに適したスペースを確保してください。</li>
                <li>Reset Yogaはヨガの実践により生じた身体的な怪我について責任を負いません。運動プログラムを開始する前に医師にご相談ください。</li>
              </ul>
            </Section>

            <Section title="第5条（サブスクリプション・支払い）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>無料体験は2回で、支払い方法の登録が必要ですが初回請求は発生しません。</li>
                <li>月額プラン（$19.99/月）では月4回のセッションをStripe経由で請求します。</li>
                <li>未使用のセッションは翌月に繰り越されません。</li>
                <li>サブスクリプションはいつでもキャンセルでき、現在の請求期間末日まで有効です。</li>
              </ul>
            </Section>

            <Section title="第6条（アカウントの停止・解約）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Reset Yogaは規約違反があった場合、アカウントを停止または解約することができます。</li>
                <li>第2条（非迂回条項）の違反は、<strong>即時かつ永久のアカウント停止</strong>を招きます。</li>
                <li>講師への嫌がらせや不正行為はアカウント解約の対象となります。</li>
              </ul>
            </Section>

            <Section title="第7条（プライバシー）">
              <p className="text-sm">
                お客様の個人データは{' '}
                <a href="/privacy" className="text-navy-600 dark:text-sage-400 underline">プライバシーポリシー</a>
                に従って管理されます。セッション提供に必要な範囲を超えて、あなたの情報を講師と共有することはありません。
              </p>
            </Section>

            <Section title="第8条（準拠法）">
              <p className="text-sm">
                本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を専属的合意管轄裁判所とします。
              </p>
            </Section>

            <Section title="第9条（お問い合わせ）">
              <p className="text-sm">
                ご質問は{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>
                {' '}までご連絡ください。
              </p>
            </Section>

          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={null} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Student Terms &amp; Conditions
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: March 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Agreement">
            <p className="text-sm">
              By completing student registration on Reset Yoga (&ldquo;Platform&rdquo;), you agree
              to be bound by these Student Terms &amp; Conditions. Please read them carefully
              before using the Service.
            </p>
          </Section>

          <Section title="2. Platform-Exclusive Sessions (Non-Circumvention)">
            <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              This is the most important clause. Violation results in immediate account termination.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
              <li>
                You must not contact, solicit, or arrange yoga sessions or any other instruction
                with instructors you have discovered through Reset Yoga,
                <strong> outside of the Reset Yoga platform</strong>.
              </li>
              <li>
                You must not exchange personal contact information (email, phone, LINE, WhatsApp,
                social media, etc.) with instructors for the purpose of arranging private lessons
                outside the Platform.
              </li>
              <li>
                This prohibition applies during your active membership and for <strong>12 months</strong> after
                your last session conducted through the Platform.
              </li>
              <li>
                If Reset Yoga determines that you have circumvented the Platform, your account will
                be permanently terminated and you may be liable for damages equivalent to the
                sessions conducted outside the Platform.
              </li>
            </ul>
          </Section>

          <Section title="3. Booking & Cancellation">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Sessions must be booked exclusively through the Reset Yoga Platform.</li>
              <li>Cancellations made <strong>more than 12 hours</strong> before a session: session credit is returned.</li>
              <li>Cancellations made <strong>12 hours or less</strong> before a session: session credit is forfeited.</li>
              <li>Repeated no-shows may result in account suspension.</li>
            </ul>
          </Section>

          <Section title="4. Session Conduct">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Treat instructors with respect at all times during sessions.</li>
              <li>Do not record sessions without the instructor&apos;s explicit consent.</li>
              <li>Ensure you have a stable internet connection and a suitable space for the session.</li>
              <li>Reset Yoga is not responsible for any physical injury resulting from practicing yoga. Consult a physician before starting any exercise program.</li>
            </ul>
          </Section>

          <Section title="5. Subscription & Payments">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>The free trial includes 2 sessions and requires a payment method on file (no initial charge).</li>
              <li>The monthly plan ($19.99/month) provides 4 sessions per month, billed via Stripe.</li>
              <li>Unused sessions do not carry over to the next billing period.</li>
              <li>You may cancel your subscription at any time; it remains active until the end of the current period.</li>
            </ul>
          </Section>

          <Section title="6. Account Suspension & Termination">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Reset Yoga may suspend or terminate your account for violation of these Terms.</li>
              <li>Circumvention of the Platform (Section 2) results in <strong>immediate and permanent termination</strong>.</li>
              <li>Harassment or misconduct towards instructors will result in account termination.</li>
            </ul>
          </Section>

          <Section title="7. Privacy">
            <p className="text-sm">
              Your personal data is handled in accordance with our{' '}
              <a href="/privacy" className="text-navy-600 dark:text-sage-400 underline">Privacy Policy</a>.
              We do not share your data with instructors beyond what is necessary to deliver sessions.
            </p>
          </Section>

          <Section title="8. Governing Law">
            <p className="text-sm">
              These Terms are governed by the laws of Japan. Disputes shall be subject to the
              exclusive jurisdiction of the Tokyo District Court.
            </p>
          </Section>

          <Section title="9. Contact">
            <p className="text-sm">
              For questions, contact{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>
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
