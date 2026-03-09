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
        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-14">

          <div className="mb-10">
            <p className="text-xs font-bold tracking-widest text-sage-600 dark:text-sage-400 uppercase mb-2">講師向け</p>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-1">講師利用規約</h1>
            <p className="text-gray-400 dark:text-navy-400 text-sm">最終更新日：2026年3月 · 有効日：2026年3月1日</p>
          </div>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">

            <Section title="第1条（同意）">
              <p className="text-sm leading-relaxed">
                Reset Yoga（以下「本プラットフォーム」または「弊社」）の講師登録を完了することにより、あなたはこの講師利用規約（以下「本規約」）に同意したものとみなします。
                登録申請を送信する前に内容をよくお読みください。本規約は定期的に更新され、更新後も継続してサービスを利用した場合、改定後の規約に同意したものとみなします。
              </p>
            </Section>

            <Section title="第2条（プラットフォーム外での活動禁止：非迂回条項）">
              <div className="text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-3">
                ⚠️ 最も重要な条項です。違反した場合は即時・永久アカウント停止となります。
              </div>
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li>Reset Yogaを通じて出会った生徒・法人クライアントに対して、<strong>プラットフォーム外</strong>でのヨガレッスン・コーチング・ウェルネスセッション・その他の有償・無償の指導を勧誘・手配・実施してはなりません。</li>
                <li>プラットフォーム外でのレッスン手配を目的として、生徒または法人担当者と個人の連絡先（メール・電話・LINE・WhatsApp・InstagramのDM等）を交換してはなりません。</li>
                <li>この禁止事項は、在籍中および<strong>最後のセッション実施日から12ヶ月間</strong>有効です。法人クライアント（B2B/For Teamsプランを通じて出会った企業）についても同様に適用されます。</li>
                <li>プラットフォームを迂回したと判断された場合、プラットフォーム外で実施したすべてのセッションに対して発生するはずであったプラットフォーム手数料の<strong>100%相当額</strong>をReset Yogaに支払うことに同意します。</li>
              </ul>
            </Section>

            <Section title="第3条（セッションの実施基準）">
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li>予約されたセッションには必ず時間通りに参加してください。<strong>開始24時間以内のキャンセルは「直前キャンセル」</strong>として記録され、月3回を超えると審査の対象になります。</li>
                <li>無断欠席（ノーショー）は1回でアカウント審査の対象となります。</li>
                <li>すべてのセッションにおいて、プロとして礼儀正しく安全な環境を維持してください。ハラスメント、差別的発言、不適切な行為は即時停止の対象です。</li>
                <li>生徒の明示的な同意なしにセッションを録画・録音してはなりません。</li>
                <li>静かで明るく、背景が整ったオンライン指導スペースを確保してください。</li>
                <li>プロフィールに記載する資格・認定証・経験年数の正確性はあなた自身の責任において管理してください。虚偽記載は即時停止の対象です。</li>
                <li>セッション中は安全配慮義務を果たし、生徒の体調・制限事項を事前に確認するよう努めてください。</li>
              </ul>
            </Section>

            <Section title="第4条（収益配分・報酬体系）">
              <p className="text-sm leading-relaxed mb-3">
                Reset Yogaは透明性の高い収益配分モデルを採用しています。報酬はセッション・コンテンツの種別に応じて以下のとおり計算されます。
              </p>

              <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-navy-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-navy-50 dark:bg-navy-800 text-left">
                      <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">セッション・コンテンツ種別</th>
                      <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">顧客単価</th>
                      <th className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">講師報酬率</th>
                      <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">プラットフォーム手数料</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                    <tr className="bg-white dark:bg-navy-900">
                      <td className="px-4 py-3">
                        <strong>1on1セッション</strong><br />
                        <span className="text-xs text-gray-400">月額$19.99プラン・月4回</span>
                      </td>
                      <td className="px-4 py-3 text-sm">約$5.00/回</td>
                      <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">70%<br /><span className="text-xs font-normal">≈ $3.50/回</span></td>
                      <td className="px-4 py-3 text-gray-500 text-sm">30% ≈ $1.50</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-navy-800/50">
                      <td className="px-4 py-3">
                        <strong>無料体験セッション</strong><br />
                        <span className="text-xs text-gray-400">生徒の最初の2回（プラットフォーム補填）</span>
                      </td>
                      <td className="px-4 py-3 text-sm">$0（生徒負担なし）</td>
                      <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">固定<br /><span className="text-xs font-normal">$2.00/回</span></td>
                      <td className="px-4 py-3 text-gray-500 text-sm">プラットフォーム負担</td>
                    </tr>
                    <tr className="bg-white dark:bg-navy-900">
                      <td className="px-4 py-3">
                        <strong>法人向けセッション（B2B / For Teams）</strong><br />
                        <span className="text-xs text-gray-400">Starter $199〜Scale $799/月プラン</span>
                      </td>
                      <td className="px-4 py-3 text-sm">プラン単価による</td>
                      <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">60%<br /><span className="text-xs font-normal">セッション報酬の60%</span></td>
                      <td className="px-4 py-3 text-gray-500 text-sm">40%<br /><span className="text-xs">（CS・レポート・営業コスト含む）</span></td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-navy-800/50">
                      <td className="px-4 py-3">
                        <strong>ウェルネスコンテンツ制作</strong><br />
                        <span className="text-xs text-gray-400">動画・コラム（Wellnessライブラリへの掲載）</span>
                      </td>
                      <td className="px-4 py-3 text-sm">別途合意</td>
                      <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">個別契約<br /><span className="text-xs font-normal">制作費または閲覧数報酬</span></td>
                      <td className="px-4 py-3 text-gray-500 text-sm">個別契約</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 rounded-xl p-4 text-sm">
                <p className="font-semibold text-sage-800 dark:text-sage-300 mb-1">📊 報酬シミュレーション例</p>
                <ul className="space-y-1 text-sage-700 dark:text-sage-400">
                  <li>月額プランの生徒10名：10 × 4回 × $3.50 = <strong>月約$140</strong></li>
                  <li>B2B Proプラン（$399/月）担当講師：$399 × 60% ÷ セッション数 = セッション当たり報酬</li>
                </ul>
              </div>

              <ul className="list-disc pl-5 space-y-2 text-sm mt-4 leading-relaxed">
                <li>支払いは毎月<strong>自動処理（月次クーロン）</strong>により、翌月15日前後に前月完了分をまとめて振り込みます。</li>
                <li>最低支払額は<strong>$20.00</strong>です。未達の場合は翌月に自動繰り越しされます。</li>
                <li>収益配分率の変更は、<strong>30日前の書面による事前通知</strong>をもって行います。</li>
                <li>報酬に関する税務申告・社会保険等の義務はご自身の管轄地域の法律に従い、あなた自身が全責任を負います。</li>
                <li>Reset Yogaはあなたの雇用主ではありません。あなたは<strong>独立した業務委託者</strong>として活動します。</li>
              </ul>
            </Section>

            <Section title="第5条（支払い方法・Stripe Connect）">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-200 mb-4">
                <p className="font-semibold mb-1">⚡ Stripe Connect（強く推奨）</p>
                <p>報酬の自動受取には、登録完了後に <strong>Stripe Connect</strong> アカウントの設定を強く推奨します。設定は <a href="/instructor/payout-setup" className="underline">講師ダッシュボード → Stripe 振込設定</a> から行えます。未設定の場合、支払いが遅延することがあります。</p>
              </div>

              <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
                <li>
                  <strong>Stripe Connect（自動振込・推奨）：</strong>
                  Stripe Expressアカウントを接続することで、月次クーロン処理後に報酬が自動的にご登録の銀行口座へ送金されます。
                  設定時に <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Stripe Connected Account Agreement</a>（連結アカウント規約）への別途同意が必要です。
                </li>
                <li>
                  <strong>本人確認（KYC）：</strong>
                  Stripe Connectの利用には、政府発行の身分証明書・住所・生年月日等の本人確認が必要です。確認が完了するまで送金は行われません。KYCは通常1〜3営業日で完了します。
                </li>
                <li>
                  <strong>銀行振込・Wise（手動）：</strong>
                  Stripe Connectを設定しない場合、ご登録の銀行口座へ管理者が手動で国際送金（SWIFT/Wise経由）を行います。手動対応のため処理に5〜10営業日かかる場合があります。
                </li>
                <li>
                  <strong>通貨・為替：</strong>
                  報酬はすべて<strong>米ドル（USD）</strong>建てで計算・支払われます。ご自身の口座への着金時の為替変動リスクはご自身が負担します。
                </li>
                <li>
                  <strong>送金手数料：</strong>
                  Stripe Connect利用時の送金手数料はStripeの定める料金に従います。Stripe Expressの標準料金は送金額の0.25%（上限$2）です。銀行振込の場合、受取銀行の手数料が別途発生することがあります。いずれもプラットフォーム側では負担しません。
                </li>
                <li>
                  <strong>最低支払額：</strong>
                  累計報酬が<strong>$20.00未満</strong>の場合、翌月に自動繰り越しされます。
                </li>
                <li>
                  <strong>支払い異議申立て：</strong>
                  報酬に誤りがあると判断した場合は、支払い処理日から<strong>30日以内</strong>に support@tryresetyoga.com までご連絡ください。30日を過ぎた異議申立ては受理できない場合があります。
                </li>
              </ul>
            </Section>

            <Section title="第6条（ウェルネスコンテンツの制作・掲載）">
              <p className="text-sm leading-relaxed mb-2">
                認定講師は、ウェルネス動画・コラム記事をWellnessライブラリに掲載することができます。掲載にあたり以下の事項に同意するものとします。
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li>掲載コンテンツは<strong>アクセス設定（全体公開・無料会員限定・プレミアム限定）</strong>を講師自身が選択できます。プレミアム設定のコンテンツは追加報酬対象となります（別途合意）。</li>
                <li>コンテンツの内容はReset Yogaのブランドガイドラインに沿ったものとし、虚偽・誇大・医学的根拠のない主張を含んではなりません。</li>
                <li>あなたが制作したコンテンツの著作権はあなたに帰属しますが、Reset Yogaに対して本プラットフォーム上での<strong>非独占的かつ無償の表示ライセンス</strong>を付与します。</li>
                <li>第三者の著作権・商標・肖像権等を侵害するコンテンツを掲載してはなりません。</li>
                <li>Reset Yogaは品質基準を満たさないコンテンツを予告なく非公開または削除する権利を有します。</li>
              </ul>
            </Section>

            <Section title="第7条（プレミアム講師制度）">
              <p className="text-sm leading-relaxed">
                Reset YogaはD2C・B2Bいずれにおいても、一定の基準を満たした講師を「プレミアム講師」として認定する制度を設けています。
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm mt-2 leading-relaxed">
                <li>プレミアム講師は検索結果での上位表示、法人案件への優先アサインなどの特典を受けられます。</li>
                <li>認定基準（セッション完了数・評価スコア・キャンセル率等）はプラットフォームが定め、定期的に見直されます。</li>
                <li>基準を下回った場合、認定を取り消すことがあります（30日前通知）。</li>
              </ul>
            </Section>

            <Section title="第8条（知的財産権）">
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li>あなた自身の指導方法・オリジナルコンテンツの所有権はあなたに帰属します。</li>
                <li>プロフィール写真・自己紹介文・指導動画をアップロードすることにより、Reset Yogaが販促・紹介目的でプラットフォームおよびSNS上に掲載する非独占的ライセンスを付与することに同意します。</li>
                <li>セッション中・コンテンツ制作中に第三者の知的財産権（音楽・映像・テキスト等）を無断で使用してはなりません。</li>
              </ul>
            </Section>

            <Section title="第9条（アカウントの停止・解約）">
              <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
                <li>Reset Yogaは規約違反があった場合、いつでもアカウントを停止・解約することができます。</li>
                <li>第2条（非迂回条項）の違反は、<strong>即時かつ永久のアカウント停止</strong>を招きます。</li>
                <li>月3回以上の直前キャンセル、または無断欠席が1回でもあった場合はアカウント審査の対象となります。</li>
                <li>生徒・法人クライアントからの不正行為の申告があった場合は審査を行い、Reset Yogaの判断が最終決定となります。</li>
                <li>アカウント解約後、未払いの報酬は解約日から60日以内に支払われます（最低支払額$20.00以上の場合）。</li>
              </ul>
            </Section>

            <Section title="第10条（守秘義務・個人情報）">
              <p className="text-sm leading-relaxed">
                生徒および法人クライアントの個人情報・業務情報はすべて厳秘として扱い、プラットフォームを通じたセッション提供のみを目的として使用することに同意します。
                生徒・クライアントのデータを他の目的のために共有・販売・悪用することは固く禁止されています。
                本条は契約終了後も効力を持ちます。
              </p>
            </Section>

            <Section title="第11条（免責事項）">
              <p className="text-sm leading-relaxed">
                あなたはセッション中の生徒の怪我・体調悪化について、適切な安全配慮義務を果たした上でも生じた不可抗力的な事故についてはReset Yogaが責任を負わないことを理解し同意します。
                ヨガ・ウェルネス指導に関連する損害賠償請求に備え、適切な職業賠償責任保険への加入を推奨します。
              </p>
            </Section>

            <Section title="第12条（準拠法・管轄）">
              <p className="text-sm leading-relaxed">
                本規約は日本法に準拠します。本規約に関して紛争が生じた場合は、東京地方裁判所を専属的合意管轄裁判所とします。
              </p>
            </Section>

            <Section title="第13条（お問い合わせ）">
              <p className="text-sm">
                本規約に関するご質問・報酬に関する異議申立ては、{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>
                {' '}までご連絡ください。通常2営業日以内にご返信します。
              </p>
            </Section>

          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── English ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={null} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-14">

        <div className="mb-10">
          <p className="text-xs font-bold tracking-widest text-sage-600 dark:text-sage-400 uppercase mb-2">For Instructors</p>
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white mb-1">Instructor Terms &amp; Conditions</h1>
          <p className="text-gray-400 dark:text-navy-400 text-sm">Last updated: March 2026 · Effective: March 1, 2026</p>
        </div>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">

          <Section title="1. Agreement">
            <p className="text-sm leading-relaxed">
              By completing instructor registration on Reset Yoga (&ldquo;Platform&rdquo; or &ldquo;we&rdquo;), you agree to be bound by
              these Instructor Terms &amp; Conditions (&ldquo;Terms&rdquo;). Please read them carefully before submitting your application.
              These Terms are updated periodically; continued use of the Platform constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="2. Platform-Exclusive Conduct (Non-Circumvention)">
            <div className="text-sm font-semibold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-3">
              ⚠️ This is the most important clause. Violation results in immediate permanent termination.
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>You must not solicit, arrange, or conduct yoga sessions, coaching, wellness sessions, or any other paid or unpaid instruction with students or corporate clients you have met through Reset Yoga, <strong>outside of the Reset Yoga Platform</strong>.</li>
              <li>You must not exchange personal contact information (email, phone, LINE, WhatsApp, Instagram DM, etc.) with students or corporate contacts for the purpose of arranging instruction outside the Platform.</li>
              <li>This prohibition applies during your active membership and for <strong>12 months after your last session</strong> conducted through the Platform. It applies equally to corporate clients introduced via the B2B / For Teams product.</li>
              <li>If Reset Yoga determines that you have circumvented the Platform, you agree to pay Reset Yoga an amount equal to <strong>100% of the platform fees</strong> that would have been due for all sessions conducted outside the Platform.</li>
            </ul>
          </Section>

          <Section title="3. Session Conduct Standards">
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Attend all scheduled sessions on time. Cancellations within <strong>24 hours</strong> are recorded as &ldquo;late cancellations.&rdquo; More than 3 per month triggers a review.</li>
              <li>No-shows (failing to appear without cancellation) trigger an immediate account review, even on the first occurrence.</li>
              <li>Maintain a professional, respectful, and safe environment at all times. Harassment, discriminatory language, or inappropriate conduct results in immediate suspension.</li>
              <li>Do not record or transmit sessions without explicit prior consent from the student or client.</li>
              <li>Ensure your teaching space is quiet, well-lit, and has a clean, appropriate background for online sessions.</li>
              <li>You are solely responsible for the accuracy of qualifications, certifications, and experience listed on your profile. False or misleading information is grounds for immediate termination.</li>
              <li>Exercise appropriate duty of care during sessions and make reasonable efforts to assess students&apos; physical condition and any limitations beforehand.</li>
            </ul>
          </Section>

          <Section title="4. Revenue Share & Payout Structure">
            <p className="text-sm leading-relaxed mb-3">
              Reset Yoga operates a transparent revenue-share model. Earnings are calculated based on session type and product line as follows:
            </p>

            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-navy-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 dark:bg-navy-800 text-left">
                    <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">Session / Content Type</th>
                    <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">Client Price</th>
                    <th className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">Your Rate</th>
                    <th className="px-4 py-3 font-semibold text-navy-800 dark:text-navy-100">Platform Fee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  <tr className="bg-white dark:bg-navy-900">
                    <td className="px-4 py-3">
                      <strong>1-on-1 Session (D2C)</strong><br />
                      <span className="text-xs text-gray-400">$19.99/mo plan · 4 sessions/mo</span>
                    </td>
                    <td className="px-4 py-3">~$5.00 / session</td>
                    <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">70%<br /><span className="text-xs font-normal">≈ $3.50 / session</span></td>
                    <td className="px-4 py-3 text-gray-500">30% ≈ $1.50</td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-navy-800/50">
                    <td className="px-4 py-3">
                      <strong>Free Trial Session</strong><br />
                      <span className="text-xs text-gray-400">Student&apos;s first 2 sessions (platform-subsidized)</span>
                    </td>
                    <td className="px-4 py-3">$0 (student)</td>
                    <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">Fixed<br /><span className="text-xs font-normal">$2.00 / session</span></td>
                    <td className="px-4 py-3 text-gray-500">Platform absorbs</td>
                  </tr>
                  <tr className="bg-white dark:bg-navy-900">
                    <td className="px-4 py-3">
                      <strong>Corporate Session (B2B / For Teams)</strong><br />
                      <span className="text-xs text-gray-400">Starter $199 – Scale $799/mo plans</span>
                    </td>
                    <td className="px-4 py-3">Plan-dependent</td>
                    <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">60%<br /><span className="text-xs font-normal">of session value</span></td>
                    <td className="px-4 py-3 text-gray-500">40%<br /><span className="text-xs">(incl. CS, reporting, sales)</span></td>
                  </tr>
                  <tr className="bg-gray-50 dark:bg-navy-800/50">
                    <td className="px-4 py-3">
                      <strong>Wellness Content (videos / articles)</strong><br />
                      <span className="text-xs text-gray-400">Wellness Library — public / member / premium</span>
                    </td>
                    <td className="px-4 py-3">By agreement</td>
                    <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400">Agreed<br /><span className="text-xs font-normal">flat fee or view-based</span></td>
                    <td className="px-4 py-3 text-gray-500">By agreement</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 rounded-xl p-4 text-sm">
              <p className="font-semibold text-sage-800 dark:text-sage-300 mb-1">📊 Earnings example</p>
              <ul className="space-y-1 text-sage-700 dark:text-sage-400">
                <li>10 monthly-plan students: 10 × 4 sessions × $3.50 = <strong>~$140/month</strong></li>
                <li>B2B Pro plan ($399/mo, 4 sessions): $399 × 60% ÷ 4 = <strong>~$59.85/session</strong></li>
              </ul>
            </div>

            <ul className="list-disc pl-5 space-y-2 text-sm mt-4 leading-relaxed">
              <li>Payouts are processed <strong>automatically via monthly cron</strong>, on or around the 15th of each month, for all sessions completed in the prior calendar month.</li>
              <li>A minimum balance of <strong>$20.00</strong> is required. Balances below this threshold roll over automatically to the next month.</li>
              <li>Reset Yoga reserves the right to adjust revenue-share percentages with <strong>30 days&apos; prior written notice</strong>.</li>
              <li>You are solely responsible for any taxes, social contributions, or filing obligations applicable to your earnings in your jurisdiction.</li>
              <li>Reset Yoga is not your employer. You operate as an <strong>independent contractor</strong>.</li>
            </ul>
          </Section>

          <Section title="5. Payment Methods & Stripe Connect">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 text-sm text-indigo-800 dark:text-indigo-200 mb-4">
              <p className="font-semibold mb-1">⚡ Stripe Connect (Strongly Recommended)</p>
              <p>To receive automated payouts, we strongly recommend setting up a <strong>Stripe Connect</strong> account after registration. You can do this from your <a href="/instructor/payout-setup" className="underline">Instructor Dashboard → Stripe Payout Setup</a>. Without Stripe Connect, payouts may be delayed.</p>
            </div>

            <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
              <li>
                <strong>Stripe Connect — Automated (Recommended):</strong> By connecting a Stripe Express account, your earnings are automatically transferred to your registered bank account after monthly cron processing. You will separately agree to the <a href="https://stripe.com/connect-account/legal" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">Stripe Connected Account Agreement</a> during setup.
              </li>
              <li>
                <strong>KYC (Identity Verification):</strong> Stripe Connect requires government-issued ID, address, and date of birth. Payouts cannot be processed until verification is complete. Verification typically takes 1–3 business days.
              </li>
              <li>
                <strong>Stripe Express Transfer Fees:</strong> Standard Stripe Express payout fees are 0.25% of the transfer amount (capped at $2.00). These fees are not covered by Reset Yoga and will be deducted from your payout by Stripe.
              </li>
              <li>
                <strong>Bank Transfer / Wise — Manual:</strong> If you do not set up Stripe Connect, the platform admin will manually send international transfers (via SWIFT or Wise) to your registered account. Manual processing may take 5–10 business days.
              </li>
              <li>
                <strong>Currency &amp; Exchange Rate:</strong> All payouts are calculated and paid in <strong>USD (US Dollars)</strong>. Any exchange rate fluctuations upon receipt in your local currency are your responsibility.
              </li>
              <li>
                <strong>Receiving Bank Fees:</strong> Your receiving bank may charge incoming wire fees. These are not covered by Reset Yoga.
              </li>
              <li>
                <strong>Minimum Payout:</strong> Accumulated earnings below <strong>$20.00</strong> roll over to the following month automatically.
              </li>
              <li>
                <strong>Payout Disputes:</strong> If you believe a payout contains an error, contact us at support@tryresetyoga.com within <strong>30 days</strong> of the processing date. Disputes raised after 30 days may not be accepted.
              </li>
            </ul>
          </Section>

          <Section title="6. Wellness Content Creation & Publication">
            <p className="text-sm leading-relaxed mb-2">
              Approved instructors may publish wellness videos and articles to the Wellness Library. By doing so, you agree to the following:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>You select the <strong>access level</strong> for each piece of content: Public (all visitors), Members Only (free registered users), or Premium (paid subscribers). Premium content may qualify for additional compensation (by separate agreement).</li>
              <li>Content must align with Reset Yoga&apos;s brand guidelines and must not contain false, misleading, or medically unsubstantiated claims.</li>
              <li>You retain copyright in your original content but grant Reset Yoga a <strong>non-exclusive, royalty-free license</strong> to display, distribute, and promote it on the Platform and associated channels.</li>
              <li>You must not include third-party copyrighted material (music, images, text) without proper licensing.</li>
              <li>Reset Yoga reserves the right to unpublish or remove content that does not meet quality standards, without prior notice.</li>
            </ul>
          </Section>

          <Section title="7. Premium Instructor Program">
            <p className="text-sm leading-relaxed">
              Reset Yoga recognizes high-performing instructors through a Premium Instructor designation, applicable to both D2C and B2B engagements.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm mt-2 leading-relaxed">
              <li>Premium Instructors receive benefits including priority placement in search results, preferred assignment to corporate (B2B) accounts, and eligibility for featured content placement.</li>
              <li>Eligibility criteria (session completion rate, student ratings, cancellation rate, etc.) are set by the Platform and reviewed periodically.</li>
              <li>Designation may be revoked if criteria are no longer met (30 days&apos; notice).</li>
            </ul>
          </Section>

          <Section title="8. Intellectual Property">
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>You retain ownership of your original teaching methods and content.</li>
              <li>By uploading a profile photo, bio, or instructional video, you grant Reset Yoga a non-exclusive license to display this content on the Platform and in promotional materials (including social media).</li>
              <li>You must not infringe on any third-party intellectual property — including unlicensed music, video clips, or written material — during sessions or in content you publish.</li>
            </ul>
          </Section>

          <Section title="9. Account Suspension & Termination">
            <ul className="list-disc pl-5 space-y-2 text-sm leading-relaxed">
              <li>Reset Yoga may suspend or terminate your account at any time for violation of these Terms.</li>
              <li>Circumvention of the Platform (Section 2) will result in <strong>immediate and permanent termination</strong>.</li>
              <li>More than 3 late cancellations per month, or any no-show, may result in suspension pending review.</li>
              <li>Student or client complaints of misconduct trigger a review; Reset Yoga&apos;s decision is final.</li>
              <li>Upon account termination, any accrued earnings above $20.00 will be paid out within 60 days of the termination date.</li>
            </ul>
          </Section>

          <Section title="10. Confidentiality & Data Privacy">
            <p className="text-sm leading-relaxed">
              You agree to keep all student and corporate client personal information strictly confidential, using it solely for delivering sessions through the Platform. You must not share, sell, or misuse student or client data for any other purpose. This obligation survives termination of these Terms.
            </p>
          </Section>

          <Section title="11. Disclaimer of Liability">
            <p className="text-sm leading-relaxed">
              You acknowledge that Reset Yoga is not liable for accidental injuries or health complications arising from sessions where you have exercised appropriate duty of care. We strongly recommend maintaining professional indemnity / liability insurance appropriate to yoga and wellness instruction in your jurisdiction.
            </p>
          </Section>

          <Section title="12. Governing Law & Jurisdiction">
            <p className="text-sm leading-relaxed">
              These Terms are governed by the laws of Japan. Disputes shall be subject to the exclusive jurisdiction of the Tokyo District Court.
            </p>
          </Section>

          <Section title="13. Contact">
            <p className="text-sm">
              For questions about these Terms or to dispute a payout, contact{' '}
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                support@tryresetyoga.com
              </a>
              . We respond within 2 business days.
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
      <h2 className="text-base font-semibold text-navy-800 dark:text-navy-100 mb-3 pb-2 border-b border-gray-100 dark:border-navy-700">
        {title}
      </h2>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </section>
  )
}
