import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Terms of Service | Reset Yoga',
}

export default async function TermsPage() {
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
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
            利用規約
          </h1>
          <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">最終更新日：2026年2月</p>

          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">

            <Section title="第1条（規約への同意）">
              <p>
                Reset Yoga（以下「本サービス」）にアクセスまたは利用することにより、利用者はこの利用規約に同意したものとみなします。
                同意しない場合は、本サービスをご利用いただけません。
              </p>
            </Section>

            <Section title="第2条（サービスの内容）">
              <p>
                Reset Yogaは、生徒と認定ヨガ講師をつなぐオンラインプラットフォームです。ビデオ通話を通じて45分間のライブセッションを提供します。
                セッションは月額プラン（月4回・$19.99/月）または無料体験（2回）でご利用いただけます。
              </p>
            </Section>

            <Section title="第3条（アカウント登録）">
              <p>
                本サービスを利用するにはアカウントの作成が必要です。利用者は認証情報の機密性を保持し、
                自己のアカウントで発生するすべての活動に責任を負います。
                登録には18歳以上（または居住国の成年年齢）であることが必要です。
              </p>
            </Section>

            <Section title="第4条（サブスクリプションおよび支払い）">
              <p>
                サブスクリプションはStripe経由で毎月課金されます。登録することにより、利用者はReset Yogaが定期的に支払い方法に請求することを承認します。
                キャンセルはいつでも可能で、現在の請求期間末日まで有効です。
              </p>
              <p>
                料金はすべてUSD表示です。料金変更の場合は30日前にご通知します。
              </p>
            </Section>

            <Section title="第5条（禁止事項）">
              <p>利用者は以下の行為を行ってはなりません：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>違法な目的での本サービスの利用</li>
                <li>事前の書面による同意なしにセッションを録画・再配布すること</li>
                <li>講師や他の利用者への嫌がらせ、虐待、危害を加えること</li>
                <li>プラットフォームへの不正アクセスの試み</li>
              </ul>
            </Section>

            <Section title="第6条（講師のコンテンツ）">
              <p>
                講師はReset Yogaの従業員ではなく、独立した業務委託者です。Reset Yogaは講師のコンテンツの正確性、完全性、
                特定目的への適合性を保証しません。運動プログラムを開始する前に、資格を持つ医療専門家にご相談ください。
              </p>
            </Section>

            <Section title="第7条（知的財産権）">
              <p>
                プラットフォームのコンテンツ、ブランド、ソフトウェアはすべてReset Yogaまたはそのライセンサーの知的財産です。
                書面による明示的な許可なく、複製、配布、派生物の作成を行うことはできません。
              </p>
            </Section>

            <Section title="第8条（免責事項）">
              <p>
                本サービスは「現状のまま」提供され、明示または黙示を問わず一切の保証を行いません。
                Reset Yogaはサービスの中断やエラーのない動作を保証しません。
              </p>
            </Section>

            <Section title="第9条（責任の制限）">
              <p>
                法律上認められる最大限の範囲において、Reset Yogaは本サービスの利用に起因する間接的、付随的、
                または結果的損害について責任を負いません。
              </p>
            </Section>

            <Section title="第10条（準拠法）">
              <p>
                本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を専属的合意管轄裁判所とします。
              </p>
            </Section>

            <Section title="第11条（規約の変更）">
              <p>
                当社はいつでも本規約を更新することがあります。変更後も本サービスを継続して利用することにより、
                改定された規約に同意したものとみなします。重要な変更については登録ユーザーにメールでお知らせします。
              </p>
            </Section>

            <Section title="第12条（お問い合わせ）">
              <p>
                本規約に関するご質問は、{' '}
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
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Terms of Service
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: February 2026</p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Reset Yoga (&ldquo;Service&rdquo;), you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Reset Yoga provides an online platform connecting students with certified yoga instructors for
              live 45-minute sessions conducted via video call. Sessions are available through a monthly
              subscription plan ($19.99/month, 4 sessions) or a free trial (2 sessions).
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              You must create an account to use the Service. You are responsible for maintaining the
              confidentiality of your credentials and for all activities that occur under your account.
              You must be at least 18 years old (or the age of majority in your jurisdiction) to register.
            </p>
          </Section>

          <Section title="4. Subscriptions and Payments">
            <p>
              Subscriptions are billed monthly via Stripe. By subscribing, you authorize Reset Yoga to
              charge your payment method on a recurring basis. You may cancel at any time; cancellation
              takes effect at the end of the current billing period.
            </p>
            <p>
              All prices are in USD. We reserve the right to change pricing with 30 days&apos; prior notice.
            </p>
          </Section>

          <Section title="5. User Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Record or redistribute session content without prior written consent</li>
              <li>Harass, abuse, or harm instructors or other users</li>
              <li>Attempt to gain unauthorized access to the platform</li>
            </ul>
          </Section>

          <Section title="6. Instructor Content">
            <p>
              Instructors are independent contractors, not employees of Reset Yoga. Reset Yoga does not
              guarantee the accuracy, completeness, or fitness of any instructor content for a particular
              purpose. Consult a qualified medical professional before starting any exercise program.
            </p>
          </Section>

          <Section title="7. Intellectual Property">
            <p>
              All platform content, branding, and software are the intellectual property of Reset Yoga
              or its licensors. You may not reproduce, distribute, or create derivative works without
              express written permission.
            </p>
          </Section>

          <Section title="8. Disclaimer of Warranties">
            <p>
              The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied.
              Reset Yoga does not warrant uninterrupted or error-free service.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Reset Yoga shall not be liable for any indirect,
              incidental, or consequential damages arising out of your use of the Service.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              These Terms are governed by the laws of Japan. Any disputes shall be subject to the
              exclusive jurisdiction of the Tokyo District Court.
            </p>
          </Section>

          <Section title="11. Changes to Terms">
            <p>
              We may update these Terms at any time. Continued use of the Service after changes constitutes
              acceptance of the revised Terms. We will notify registered users of material changes by email.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions regarding these Terms, please contact us at{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>
              .
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
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}
