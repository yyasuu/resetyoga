import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'

export const metadata = {
  title: 'Legal Disclosure (Tokusho) | Reset Yoga',
}

export default async function TokushoEnPage() {
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
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-12">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
            Legal Disclosure
          </h1>
          <a
            href="/tokusho"
            className="text-sm text-navy-600 dark:text-sage-400 hover:underline whitespace-nowrap ml-4"
          >
            日本語で見る →
          </a>
        </div>
        <p className="text-gray-500 dark:text-navy-400 text-sm mb-8">
          Required disclosure under Japan&apos;s Act on Specified Commercial Transactions
        </p>

        <div className="bg-white dark:bg-navy-900 rounded-xl shadow-sm border border-gray-100 dark:border-navy-800 overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100 dark:divide-navy-800">
              <Row label="Business Operator">
                Reset Yoga (Sole proprietor: Airi Yukiyoshi)
              </Row>
              <Row label="Responsible Manager">
                Airi Yukiyoshi
              </Row>
              <Row label="Address">
                Disclosed promptly upon request.
              </Row>
              <Row label="Phone Number">
                Disclosed promptly upon request.
              </Row>
              <Row label="Email">
                <a
                  href="mailto:support@tryresetyoga.com"
                  className="text-navy-600 dark:text-sage-400 underline"
                >
                  support@tryresetyoga.com
                </a>
              </Row>
              <Row label="Service URL">
                <a
                  href="https://tryresetyoga.com"
                  className="text-navy-600 dark:text-sage-400 underline"
                >
                  https://tryresetyoga.com
                </a>
              </Row>
              <Row label="Service Description">
                Online yoga subscription service providing 4 live 45-minute sessions per month with certified instructors via video call.
              </Row>
              <Row label="Price">
                US$19.99 / month (applicable taxes, if any, will be displayed at checkout)<br />
                Free trial: 2 sessions at no charge. A payment method is required but no charge is made during the trial.<br />
                The free trial does not automatically convert to a paid plan. You must subscribe manually to activate the monthly plan.
              </Row>
              <Row label="Additional Costs">
                The cost of internet connectivity required to use the service is borne by the customer.
              </Row>
              <Row label="Recurring Charges &amp; Auto-Renewal">
                The monthly plan is an <strong>auto-renewing subscription with no fixed term</strong> (indefinite). US$19.99 is charged automatically each month until you cancel.<br />
                The first charge occurs when you subscribe. Subsequent charges are billed on the same date each month.
              </Row>
              <Row label="Payment Method">
                Credit card (Visa, Mastercard, American Express, etc.)<br />
                Payment processed by Stripe, Inc. (We accept payments through Stripe&apos;s secure payment platform.)
              </Row>
              <Row label="Payment Timing">
                First charge occurs at the time of subscription.<br />
                Subsequent charges are billed automatically on the same date each month.<br />
                Charges continue until you cancel.
              </Row>
              <Row label="Service Availability">
                Access is granted immediately upon successful payment.
              </Row>
              <Row label="Application Period">
                Applications may close when capacity is reached.
              </Row>
              <Row label="Cancellation &amp; Refunds">
                Due to the nature of the service, refunds after service commencement cannot be provided except as required by applicable law.<br />
                Cancelling before the next billing date stops future charges. Access continues until the end of the current billing period.<br />
                See our{' '}
                <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">
                  Refund &amp; Cancellation Policy
                </a>{' '}
                for exceptions.
              </Row>
              <Row label="How to Cancel">
                Log in to your account and visit the Subscription page (
                <a href="https://tryresetyoga.com/subscription" className="text-navy-600 dark:text-sage-400 underline">
                  tryresetyoga.com/subscription
                </a>
                ) to cancel at any time.<br />
                No cancellation fees apply. For assistance, contact{' '}
                <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
                  support@tryresetyoga.com
                </a>.
              </Row>
              <Row label="Service Issues">
                If an instructor cancels a session, your session credit will be returned.<br />
                If the service cannot be provided due to reasons attributable to us (e.g., system failures), we will arrange a make-up session or issue a refund.
              </Row>
              <Row label="System Requirements">
                A stable internet connection is required. A browser capable of video calls (latest Chrome recommended) and a device with a camera and microphone are needed.
              </Row>
              <Row label="Disclaimer">
                Reset Yoga is not liable for service interruptions caused by network failures, natural disasters, force majeure, or other circumstances beyond our control.
              </Row>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-400 dark:text-navy-500 mt-6 text-right">
          Last updated: March 2026
        </p>
      </main>

      <Footer />
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="flex flex-col sm:table-row">
      <td className="px-6 py-4 font-semibold text-navy-700 dark:text-navy-200 bg-gray-50 dark:bg-navy-800 w-full sm:w-48 align-top whitespace-nowrap">
        {label}
      </td>
      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </td>
    </tr>
  )
}
