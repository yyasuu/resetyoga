import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata = {
  title: 'Student Terms & Conditions | Reset Yoga',
}

export default async function StudentTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar user={null} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Student Terms &amp; Conditions
        </h1>
        <p className="text-gray-500 text-sm mb-8">Last updated: March 2026</p>

        <div className="space-y-6 text-gray-700">

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
              <a href="/privacy" className="text-navy-600 underline">Privacy Policy</a>.
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
              <a href="mailto:support@tryresetyoga.com" className="text-navy-600 underline">
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
      <h2 className="text-base font-semibold text-navy-800 mb-2">{title}</h2>
      <div className="space-y-2 leading-relaxed">{children}</div>
    </section>
  )
}
