import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Privacy Policy | Reset Yoga',
}

export default async function PrivacyPage() {
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
            プライバシーポリシー
          </h1>
          <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">最終更新日：2026年2月</p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">

            <Section title="第1条（収集する情報）">
              <p className="text-sm">当社が収集する個人情報の種類は以下のとおりです：</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>アカウント情報：</strong>氏名、メールアドレス、プロフィール写真</li>
                <li><strong>支払い情報：</strong>Stripeが処理する請求情報（カード番号は当社では保存しません）</li>
                <li><strong>利用データ：</strong>セッション履歴、予約情報、レビュー、タイムゾーン</li>
                <li><strong>技術データ：</strong>IPアドレス、ブラウザ種別、デバイス情報（Supabase/Vercelログ経由）</li>
              </ul>
            </Section>

            <Section title="第2条（情報の利用目的）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>本サービスの提供および改善</li>
                <li>支払い処理およびサブスクリプション管理</li>
                <li>予約確認メールおよびサービス通知の送信（Resend経由）</li>
                <li>生徒と講師のマッチング</li>
                <li>法的義務の履行</li>
              </ul>
            </Section>

            <Section title="第3条（第三者サービス）">
              <p className="text-sm">当社は以下の信頼できる第三者とデータを共有します：</p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
                <li><strong>Supabase</strong> — データベースおよび認証（EU/USデータセンター）</li>
                <li><strong>Stripe</strong> — 決済処理（PCI-DSS準拠）</li>
                <li><strong>Resend</strong> — トランザクションメール</li>
                <li><strong>Jitsi Meet</strong> — ライブクラスのビデオセッション</li>
                <li><strong>Google</strong> — Googleアカウントによるサインイン</li>
                <li><strong>Vercel</strong> — ホスティングおよびCDN</li>
              </ul>
              <p className="text-sm mt-2">
                当社は利用者の個人データを第三者に販売することはありません。
              </p>
            </Section>

            <Section title="第4条（データの保存期間）">
              <p className="text-sm">
                個人データは、アカウントが有効な間、またはサービス提供に必要な期間保存します。
                アカウント削除後30日以内に個人データを削除します。ただし、法律により保存が義務付けられているデータ
                （例：財務記録は7年間）を除きます。
              </p>
            </Section>

            <Section title="第5条（クッキー）">
              <p className="text-sm">
                当社は言語設定を記憶するために{' '}
                <code className="bg-gray-100 dark:bg-navy-800 px-1 rounded">NEXT_LOCALE</code>{' '}
                クッキーを使用します。広告クッキーやトラッキングクッキーは使用しません。
                認証にはSupabaseが設定する必須セッションクッキーを使用します。
              </p>
            </Section>

            <Section title="第6条（利用者の権利）">
              <p className="text-sm">お住まいの地域によって、以下の権利を有する場合があります：</p>
              <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
                <li>個人データへのアクセス、訂正、削除</li>
                <li>処理への異議申し立てまたは制限</li>
                <li>データポータビリティ</li>
                <li>監督機関への苦情申し立て</li>
              </ul>
              <p className="text-sm mt-2">
                これらの権利を行使するには、{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>
                {' '}までご連絡ください。
              </p>
            </Section>

            <Section title="第7条（セキュリティ）">
              <p className="text-sm">
                当社はHTTPS、データベースの行レベルセキュリティ（RLS）、パスワードのハッシュ化など、
                業界標準のセキュリティ対策を実施しています。ただし、インターネット上の送信方法で100%安全なものはありません。
              </p>
            </Section>

            <Section title="第8条（未成年者のプライバシー）">
              <p className="text-sm">
                本サービスは18歳未満を対象としていません。当社は未成年者の個人情報を意図的に収集しません。
                誤って収集したと思われる場合は、速やかにご連絡ください。
              </p>
            </Section>

            <Section title="第9条（ポリシーの変更）">
              <p className="text-sm">
                当社は定期的にプライバシーポリシーを更新することがあります。重要な変更についてはメールまたは
                サービス上のお知らせでご通知します。変更後も継続してご利用いただくことで、改定されたポリシーに同意したものとみなします。
              </p>
            </Section>

            <Section title="第10条（お問い合わせ）">
              <p className="text-sm">
                プライバシーに関するお問い合わせは、{' '}
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
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: February 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Information We Collect">
            <p>We collect the following categories of personal information:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li><strong>Account data:</strong> name, email address, profile photo</li>
              <li><strong>Payment data:</strong> billing details processed by Stripe (we do not store full card numbers)</li>
              <li><strong>Usage data:</strong> session history, bookings, reviews, timezone</li>
              <li><strong>Technical data:</strong> IP address, browser type, device info (via Supabase/Vercel logs)</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Provide and improve the Service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send booking confirmations and service notifications (via Resend)</li>
              <li>Match students with instructors</li>
              <li>Comply with legal obligations</li>
            </ul>
          </Section>

          <Section title="3. Third-Party Services">
            <p className="text-sm">We share data with the following trusted third parties:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-2">
              <li><strong>Supabase</strong> — database and authentication (EU/US data centers)</li>
              <li><strong>Stripe</strong> — payment processing (PCI-DSS compliant)</li>
              <li><strong>Resend</strong> — transactional email</li>
              <li><strong>Jitsi Meet</strong> — video sessions for live classes</li>
              <li><strong>Google</strong> — Google OAuth for sign-in</li>
              <li><strong>Vercel</strong> — hosting and CDN</li>
            </ul>
            <p className="text-sm mt-2">
              We do not sell your personal data to any third parties.
            </p>
          </Section>

          <Section title="4. Data Retention">
            <p className="text-sm">
              We retain your personal data for as long as your account is active or as needed to provide
              the Service. Upon account deletion, we delete personal data within 30 days, except where
              retention is required by law (e.g., financial records for 7 years).
            </p>
          </Section>

          <Section title="5. Cookies">
            <p className="text-sm">
              We use a <code className="bg-gray-100 dark:bg-navy-800 px-1 rounded">NEXT_LOCALE</code> cookie
              to remember your language preference. We do not use advertising or tracking cookies.
              Essential session cookies are set by Supabase for authentication.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p className="text-sm">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 text-sm mt-1">
              <li>Access, correct, or delete your personal data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="text-sm mt-2">
              To exercise these rights, contact us at{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>
              .
            </p>
          </Section>

          <Section title="7. Security">
            <p className="text-sm">
              We implement industry-standard security measures including HTTPS, Row Level Security (RLS)
              on our database, and hashed password storage. However, no method of transmission over the
              internet is 100% secure.
            </p>
          </Section>

          <Section title="8. Children&apos;s Privacy">
            <p className="text-sm">
              The Service is not directed to children under 18. We do not knowingly collect personal
              information from minors. If you believe we have inadvertently collected such data,
              please contact us immediately.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p className="text-sm">
              We may update this Privacy Policy periodically. We will notify you of significant changes
              by email or by posting a notice on the Service. Continued use after changes constitutes
              acceptance of the revised policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p className="text-sm">
              For privacy inquiries, contact:{' '}
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
