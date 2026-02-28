import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Terms of Service | Reset Yoga',
}

export default async function TermsPage() {
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
