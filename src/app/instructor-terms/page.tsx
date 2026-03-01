import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Instructor Terms & Conditions | Reset Yoga',
}

export default async function InstructorTermsPage() {
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

            {/* Payout table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-navy-700 mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-navy-50 dark:bg-navy-800">
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">Session Type</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100">Student Price</th>
                    <th className="px-4 py-3 text-left font-semibold text-navy-800 dark:text-navy-100 text-green-700 dark:text-green-400">Your Payout</th>
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
