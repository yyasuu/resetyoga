import { cookies } from 'next/headers'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Instructor Terms & Conditions | Reset Yoga',
}

export default async function InstructorTermsPage() {
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  if (locale === 'ja') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
        <Navbar user={null} />
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
            講師利用規約
          </h1>
          <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">最終更新日：2026年3月</p>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">

            <Section title="第1条（同意）">
              <p className="text-sm">
                Reset Yoga（以下「プラットフォーム」）の講師登録を完了することにより、あなたはこの講師利用規約に同意したものとみなします。
                申請を送信する前に、内容をよくお読みください。
              </p>
            </Section>

            <Section title="第2条（プラットフォーム外での活動禁止：非迂回条項）">
              <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                最も重要な条項です。違反した場合は即時アカウント永久停止となります。
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
                <li>
                  Reset Yogaを通じて出会った生徒に対して、<strong>プラットフォーム外</strong>でのヨガレッスン、コーチング、その他の有償・無償の指導を勧誘・手配・実施してはなりません。
                </li>
                <li>
                  プラットフォーム外でのレッスン手配を目的として、生徒と個人の連絡先（メール・電話・LINE・WhatsApp・InstagramのDM等）を交換してはなりません。
                </li>
                <li>
                  この禁止事項は、在籍中および<strong>最後のセッション実施日から12ヶ月間</strong>有効です。
                </li>
                <li>
                  プラットフォームを迂回したと判断された場合、プラットフォーム外で実施した全セッションに対して発生するはずであったプラットフォーム手数料の<strong>100%相当額</strong>をReset Yogaに支払うことに同意します。
                </li>
              </ul>
            </Section>

            <Section title="第3条（セッションの実施）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>予約されたセッションには必ず時間通りに参加してください。12時間以内のキャンセルは記録されます。</li>
                <li>すべてのセッションにおいて、プロとして礼儀正しく、安全な環境を維持してください。</li>
                <li>生徒の明示的な同意なしにセッションを録画してはなりません。</li>
                <li>静かで明るく、集中できる指導スペースを確保してください。</li>
                <li>プロフィールに記載する資格・認定証の正確性はあなた自身の責任において管理してください。</li>
              </ul>
            </Section>

            <Section title="第4条（収益配分・支払い）">
              <p className="text-sm">
                Reset Yogaは透明性の高い収益配分モデルを採用しています。報酬はセッション種別に応じて以下のとおり計算されます：
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-navy-700 mt-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-50 dark:bg-navy-800">
                      <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">セッション種別</th>
                      <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">生徒の支払い</th>
                      <th className="px-4 py-3 text-left font-semibold text-green-700 dark:text-green-400">講師報酬</th>
                      <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">手数料</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                    <tr className="bg-white dark:bg-navy-900">
                      <td className="px-4 py-3">1on1セッション<br /><span className="text-xs text-gray-400">（$19.99/月プラン・月4回）</span></td>
                      <td className="px-4 py-3">約$5.00/回</td>
                      <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">70% ≈ <strong>$3.50</strong>/回</td>
                      <td className="px-4 py-3 text-gray-500">30% ≈ $1.50</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-navy-800/50">
                      <td className="px-4 py-3">グループセッション<br /><span className="text-xs text-gray-400">（$9.99/月グループアドオン）</span></td>
                      <td className="px-4 py-3">約$1.25/人</td>
                      <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">65%（プール配分）<br /><span className="text-xs font-normal">例：10人なら約$8.13/回</span></td>
                      <td className="px-4 py-3 text-gray-500">35%</td>
                    </tr>
                    <tr className="bg-white dark:bg-navy-900">
                      <td className="px-4 py-3">無料体験セッション<br /><span className="text-xs text-gray-400">（生徒の最初の2回）</span></td>
                      <td className="px-4 py-3">$0（生徒負担なし）</td>
                      <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400"><strong>$2.00</strong>/回固定<br /><span className="text-xs font-normal">（プラットフォームが補填）</span></td>
                      <td className="px-4 py-3 text-gray-500">プラットフォーム負担</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-sm mt-3 text-gray-500 dark:text-gray-400 italic">
                例：月額プランの生徒10名を担当した場合、10 × 4 × $3.50 = <strong>月額約$140</strong>（40セッション）の報酬となります。
              </p>

              <ul className="list-disc pl-5 space-y-1 text-sm mt-3">
                <li>支払いは毎月<strong>15日前後</strong>に、前月完了分をまとめて振り込みます。</li>
                <li>お支払いはプロフィールに登録した銀行口座への国際送金（SWIFT/IBAN対応）で行います。</li>
                <li>最低支払額は<strong>$20.00</strong>です。未達の場合は翌月に繰り越されます。</li>
                <li>報酬に関する税務申告・社会保険等の義務はご自身の管轄地域の法律に従い、あなた自身が責任を負います。</li>
                <li>Reset Yogaはあなたの雇用主ではありません。あなたは<strong>独立した業務委託者</strong>として活動します。</li>
                <li>収益配分率の変更は、<strong>30日前の書面による事前通知</strong>をもって行います。</li>
              </ul>
            </Section>

            <Section title="第5条（コンテンツ・知的財産権）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>あなた自身の指導方法・オリジナルコンテンツの所有権はあなたに帰属します。</li>
                <li>プロフィール写真や自己紹介文をアップロードすることにより、Reset Yogaが販促目的でプラットフォーム上に掲載する非独占的ライセンスを付与することに同意します。</li>
                <li>セッション中に第三者の知的財産権を侵害してはなりません。</li>
              </ul>
            </Section>

            <Section title="第6条（アカウントの停止・解約）">
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Reset Yogaは規約違反があった場合、いつでもアカウントを停止・解約することができます。</li>
                <li>第2条（非迂回条項）の違反は、<strong>即時かつ永久のアカウント停止</strong>を招きます。</li>
                <li>繰り返す直前キャンセルや無断欠席はアカウント停止の対象となります。</li>
                <li>生徒からの不正行為の申告があった場合は審査を行い、Reset Yogaの判断が最終決定となります。</li>
              </ul>
            </Section>

            <Section title="第7条（守秘義務）">
              <p className="text-sm">
                生徒の個人情報はすべて厳秘として扱い、プラットフォームを通じたセッション提供のみを目的として使用することに同意します。
                生徒のデータを他の目的のために共有・販売・悪用することは禁止されています。
              </p>
            </Section>

            <Section title="第8条（準拠法）">
              <p className="text-sm">
                本規約は日本法に準拠します。紛争が生じた場合は、東京地方裁判所を専属的合意管轄裁判所とします。
              </p>
            </Section>

            <Section title="第9条（お問い合わせ）">
              <p className="text-sm">
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
      <Navbar user={null} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-2">
          Instructor Terms &amp; Conditions
        </h1>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">Last updated: March 2026</p>

        <div className="space-y-6 text-gray-700 dark:text-gray-300">

          <Section title="1. Agreement">
            <p className="text-sm">
              By completing the instructor registration on Reset Yoga (&ldquo;Platform&rdquo;), you agree
              to be bound by these Instructor Terms &amp; Conditions. Please read them carefully
              before submitting your application.
            </p>
          </Section>

          <Section title="2. Platform-Exclusive Conduct (Non-Circumvention)">
            <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
              This is the most important clause. Violation results in immediate account termination.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-3">
              <li>
                You must not solicit, arrange, or conduct yoga sessions, coaching, or any other
                paid or unpaid instruction with students you have met through Reset Yoga,
                <strong> outside of the Reset Yoga platform</strong>.
              </li>
              <li>
                You must not exchange personal contact information (email, phone, LINE, WhatsApp,
                Instagram DM, etc.) with students for the purpose of arranging private lessons
                outside the Platform.
              </li>
              <li>
                This prohibition applies during your active membership and for <strong>12 months</strong> after
                your last session conducted through the Platform.
              </li>
              <li>
                If Reset Yoga determines that you have circumvented the Platform, you agree to pay
                Reset Yoga an amount equal to <strong>100% of the platform fees</strong> that would have
                been due for all sessions conducted outside the Platform.
              </li>
            </ul>
          </Section>

          <Section title="3. Session Conduct">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Arrive on time for all scheduled sessions. Late cancellations (within 12 hours) will be recorded.</li>
              <li>Maintain a professional, respectful, and safe environment during all sessions.</li>
              <li>Do not record sessions without explicit consent from the student.</li>
              <li>Ensure your teaching space is quiet, well-lit, and free from distractions.</li>
              <li>You are responsible for the accuracy of your qualifications and certifications listed on your profile.</li>
            </ul>
          </Section>

          <Section title="4. Revenue Share & Payments">
            <p className="text-sm">
              Reset Yoga operates a transparent revenue-share model. Your earnings are calculated
              based on the session type as follows:
            </p>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-navy-700 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 dark:bg-navy-800">
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">Session Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">Student Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-green-700 dark:text-green-400">Your Payout</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">Platform Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  <tr className="bg-white dark:bg-navy-900">
                    <td className="px-4 py-3">1-on-1 Session<br /><span className="text-xs text-gray-400">(from $19.99/mo plan, 4 sessions)</span></td>
                    <td className="px-4 py-3">~$5.00 / session</td>
                    <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">70% ≈ <strong>$3.50</strong> / session</td>
                    <td className="px-4 py-3 text-gray-500">30% ≈ $1.50</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-navy-800/50">
                    <td className="px-4 py-3">Group Session<br /><span className="text-xs text-gray-400">(from $9.99/mo group add-on)</span></td>
                    <td className="px-4 py-3">~$1.25 / student</td>
                    <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">65% of pool<br /><span className="text-xs font-normal">(e.g. 10 students = ~$8.13)</span></td>
                    <td className="px-4 py-3 text-gray-500">35% of pool</td>
                  </tr>
                  <tr className="bg-white dark:bg-navy-900">
                    <td className="px-4 py-3">Free Trial Session<br /><span className="text-xs text-gray-400">(student&apos;s first 2 sessions)</span></td>
                    <td className="px-4 py-3">$0 (student)</td>
                    <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400"><strong>$2.00</strong> / session<br /><span className="text-xs font-normal">(platform-subsidized)</span></td>
                    <td className="px-4 py-3 text-gray-500">Platform absorbs cost</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm mt-3 text-gray-500 dark:text-gray-400 italic">
              Example: If you teach 10 students on the monthly plan, you earn approximately
              10 × 4 × $3.50 = <strong>$140/month</strong> for 40 sessions.
            </p>

            <ul className="list-disc pl-5 space-y-1 text-sm mt-3">
              <li>Payments are processed <strong>monthly</strong>, on or around the 15th of each month, for all sessions completed in the prior calendar month.</li>
              <li>Payment is made via international bank transfer to the account registered in your profile (SWIFT/IBAN supported).</li>
              <li>A minimum balance of <strong>$20.00</strong> is required to trigger a payout. Balances below this threshold roll over to the next month.</li>
              <li>You are solely responsible for any taxes, social contributions, or filing obligations applicable to your earnings in your jurisdiction.</li>
              <li>Reset Yoga is not your employer. You operate as an <strong>independent contractor</strong>.</li>
              <li>Reset Yoga reserves the right to adjust the revenue-share percentages with <strong>30 days&apos; prior written notice</strong>.</li>
            </ul>
          </Section>

          <Section title="5. Content & Intellectual Property">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>You retain ownership of your own teaching methods and original content.</li>
              <li>By uploading a profile photo or bio, you grant Reset Yoga a non-exclusive license to display
              this content on the Platform for promotional purposes.</li>
              <li>You must not infringe on any third-party intellectual property during sessions.</li>
            </ul>
          </Section>

          <Section title="6. Account Suspension & Termination">
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Reset Yoga may suspend or terminate your account at any time for violation of these Terms.</li>
              <li>Circumvention of the Platform (Section 2) will result in <strong>immediate and permanent termination</strong>.</li>
              <li>Repeated late cancellations or no-shows may result in account suspension.</li>
              <li>Student complaints of misconduct will trigger a review; Reset Yoga&apos;s decision is final.</li>
            </ul>
          </Section>

          <Section title="7. Confidentiality">
            <p className="text-sm">
              You agree to keep all student personal information confidential and to use it solely
              for delivering sessions through the Platform. You must not share, sell, or misuse
              student data for any other purpose.
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
              For questions about these Terms, contact{' '}
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
