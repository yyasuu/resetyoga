import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Profile } from '@/types'
import {
  HelpCircle,
  User,
  Gift,
  CreditCard,
  Calendar,
  Laptop,
  RefreshCw,
  Mail,
  Phone,
} from 'lucide-react'

export const metadata = {
  title: 'Help & Support | Reset Yoga',
}

export default async function SupportEnPage() {
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

        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
              Help & Support
            </h1>
            <p className="text-gray-500 dark:text-navy-400 text-sm mt-1">
              Frequently asked questions and how-to guides
            </p>
          </div>
          <a
            href="/support"
            className="text-sm text-navy-600 dark:text-sage-400 hover:underline whitespace-nowrap ml-4 mt-1"
          >
            日本語で見る →
          </a>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 mb-10">
          {[
            { icon: Gift,       label: 'Free Trial',   href: '#trial' },
            { icon: Calendar,   label: 'Booking',      href: '#booking' },
            { icon: CreditCard, label: 'Payment',      href: '#payment' },
            { icon: Mail,       label: 'Contact Us',   href: '#contact' },
          ].map(({ icon: Icon, label, href }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 rounded-xl py-3 px-2 text-xs font-medium text-navy-700 dark:text-navy-200 hover:border-navy-400 dark:hover:border-sage-400 hover:shadow-sm transition-all text-center"
            >
              <Icon className="h-5 w-5 text-sage-500 dark:text-sage-400" />
              {label}
            </a>
          ))}
        </div>

        <div className="space-y-6">

          {/* ──────────────────────────────────────────────────────────
              1. Getting Started
          ──────────────────────────────────────────────────────────── */}
          <Section icon={HelpCircle} color="sage" title="Getting Started">
            <QA q="What is Reset Yoga?">
              Reset Yoga is an online platform that connects you with certified yoga instructors for
              live, one-on-one video sessions. You can join a 45-minute lesson from the comfort of
              your home — no app download required. New members get 2 sessions completely free.
            </QA>

            <QA q="What do I need to get started?">
              <ul className="list-none space-y-2 mt-1">
                <StepItem n={1}>A device with a camera and microphone (laptop, desktop, smartphone, or tablet)</StepItem>
                <StepItem n={2}>A stable internet connection (Wi-Fi recommended)</StepItem>
                <StepItem n={3}>An email address to create a free account</StepItem>
                <StepItem n={4}>A credit card for the free trial (you will not be charged during the trial)</StepItem>
              </ul>
            </QA>

            <QA q="How do I get started? Step-by-step guide.">
              <ol className="list-none space-y-3 mt-2">
                <StepItem n={1}>
                  <span className="font-semibold">Create a free account</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">Click &ldquo;Sign Up&rdquo; in the top right corner. You can register with your email address or sign in with Google.</span>
                </StepItem>
                <StepItem n={2}>
                  <span className="font-semibold">Register your card for the free trial</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">Your card will not be charged during the trial period. There is no automatic conversion to a paid plan.</span>
                </StepItem>
                <StepItem n={3}>
                  <span className="font-semibold">Browse instructors and book a session</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">From your dashboard, browse available instructors and select a date and time that works for you.</span>
                </StepItem>
                <StepItem n={4}>
                  <span className="font-semibold">Log in at session time and start your lesson</span>
                  <br />
                  <span className="text-gray-500 dark:text-navy-400 text-sm">Join directly from your browser — no downloads needed. We recommend testing your camera and microphone a few minutes early.</span>
                </StepItem>
              </ol>
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              2. Account & Login
          ──────────────────────────────────────────────────────────── */}
          <Section icon={User} color="navy" title="Account & Login" id="account">
            <QA q="How do I create an account?">
              Click &ldquo;Sign Up&rdquo; in the top right corner of the site, then enter your email address and
              choose a password. You&apos;ll receive a confirmation email — click the link inside to
              verify your address and activate your account. You can also sign up instantly using
              your Google account.
            </QA>

            <QA q="I didn't receive the confirmation email.">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>Check your spam / junk folder.</li>
                <li>Make sure you entered your email address correctly.</li>
                <li>You can request a new confirmation email from the sign-up page.</li>
                <li>If you still don&apos;t receive it, please contact us at <ContactLink />.</li>
              </ul>
            </QA>

            <QA q="I forgot my password.">
              On the login page, click &ldquo;Forgot your password?&rdquo; and enter the email address you
              registered with. We&apos;ll send you a password reset link. Click the link in the email
              to set a new password.
            </QA>

            <QA q="Can I sign in with Google?">
              Yes. Click &ldquo;Sign in with Google&rdquo; on the login page. If you don&apos;t have an account
              yet, one will be created automatically on your first sign-in.
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              3. Free Trial
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Gift} color="sage" title="Free Trial" id="trial">
            <QA q="What does the free trial include?">
              New members receive <strong>2 full yoga sessions completely free</strong>. The sessions
              are identical to those available to paid members — same instructors, same session
              length (45 minutes), same booking process.
            </QA>

            <QA q="Why do I need to enter a credit card for the free trial?">
              A card is required to reserve session slots. However, <strong>you will not be charged
              anything during the free trial</strong>. The card is used only if and when you decide
              to subscribe to a paid monthly plan.
            </QA>

            <QA q="Will I be automatically charged after the trial ends?">
              No. After your 2 free sessions, your account simply stays in trial mode. There is
              no automatic upgrade to a paid plan. To continue booking sessions, you&apos;ll need to
              subscribe from the &ldquo;Subscription&rdquo; page — entirely at your own discretion.
            </QA>

            <QA q="Can I use the free trial more than once?">
              The free trial is available once per account (2 sessions total).
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              4. Booking & Sessions
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Calendar} color="navy" title="Booking & Sessions" id="booking">
            <QA q="How do I book a session?">
              <ol className="list-none space-y-2 mt-1">
                <StepItem n={1}>Log in and go to your dashboard, then click &ldquo;Find Instructors&rdquo; or visit the &ldquo;Instructors&rdquo; page.</StepItem>
                <StepItem n={2}>Open an instructor&apos;s profile and click &ldquo;Book a session&rdquo;.</StepItem>
                <StepItem n={3}>Select an available date and time from the calendar.</StepItem>
                <StepItem n={4}>Review the details and click &ldquo;Confirm booking&rdquo;. A confirmation email will be sent to you.</StepItem>
              </ol>
            </QA>

            <QA q="How do I join a session?">
              At your scheduled session time, log in to your account and go to your dashboard or
              &ldquo;My Bookings&rdquo;. Click the &ldquo;Join&rdquo; button next to your booking. The video call will
              open directly in your browser. <strong>No app download is required.</strong>
              Please allow camera and microphone access when prompted by your browser.
            </QA>

            <QA q="What should I prepare before a session?">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>A yoga mat (or a non-slip surface)</li>
                <li>Comfortable, flexible clothing</li>
                <li>Enough space to stretch out fully</li>
                <li>Latest version of Chrome (recommended browser)</li>
                <li>Log in 5 minutes early to test your camera and microphone.</li>
              </ul>
            </QA>

            <QA q="Can I cancel or reschedule a booking?">
              Yes. You can cancel or reschedule up to <strong>24 hours before the session start
              time</strong> from your bookings page. Cancellations within 24 hours will count as
              a used session.
            </QA>

            <QA q="What if the instructor doesn't show up or I can't connect?">
              If a session cannot take place due to the instructor&apos;s absence or a technical issue
              on our side, your session credit will be fully refunded. Please contact us at <ContactLink /> so
              we can resolve it promptly.
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              5. Payment & Subscription
          ──────────────────────────────────────────────────────────── */}
          <Section icon={CreditCard} color="sage" title="Payment & Subscription" id="payment">
            <QA q="How much does the monthly plan cost?">
              The monthly plan is <strong>US$19.99/month</strong>, which includes 4 live sessions
              (45 minutes each). Applicable taxes, if any, will be displayed at checkout.
            </QA>

            <QA q="What payment methods are accepted?">
              We accept all major credit cards including Visa, Mastercard, and American Express.
              Payments are processed securely by Stripe, Inc. Your card details are never stored
              on Reset Yoga&apos;s servers.
            </QA>

            <QA q="When am I charged?">
              Your first charge occurs when you subscribe. After that, your plan renews
              automatically on the same date each month. Charges continue until you cancel.
            </QA>

            <QA q="Can I get a receipt or invoice?">
              Stripe automatically sends a receipt email after each payment. If you need a copy
              resent, please contact us at <ContactLink />.
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              6. Cancellation & Refunds
          ──────────────────────────────────────────────────────────── */}
          <Section icon={RefreshCw} color="navy" title="Cancellation & Refunds" id="cancel">
            <QA q="How do I cancel my subscription?">
              <ol className="list-none space-y-2 mt-1">
                <StepItem n={1}>Log in and open &ldquo;Subscription&rdquo; from the navigation menu.</StepItem>
                <StepItem n={2}>Click the &ldquo;Cancel subscription&rdquo; button.</StepItem>
                <StepItem n={3}>Confirm the cancellation on the confirmation screen.</StepItem>
              </ol>
              <p className="mt-2 text-sm text-gray-500 dark:text-navy-400">
                There are no cancellation fees. You can cancel at any time.
              </p>
            </QA>

            <QA q="What happens after I cancel?">
              After cancellation, you retain access to the service until the end of the billing
              period you have already paid for. For example, if you cancel mid-month, you can
              still use your remaining sessions until the end of that month.
            </QA>

            <QA q="Can I get a refund?">
              As this is a digital service, we do not offer refunds for customer-initiated
              cancellations except where required by applicable law. However, we will issue a
              refund or credit in these cases:
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                <li>An instructor cancels a confirmed session → session credit returned</li>
                <li>Service unavailable due to our technical issues → make-up session or refund</li>
                <li>Duplicate / erroneous charge → prompt refund or void</li>
              </ul>
              For full details, see our <a href="/refund" className="text-navy-600 dark:text-sage-400 underline">Refund &amp; Cancellation Policy</a>.
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              7. Technical Questions
          ──────────────────────────────────────────────────────────── */}
          <Section icon={Laptop} color="sage" title="Technical Questions" id="technical">
            <QA q="What are the system requirements?">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>A device with a camera and microphone (laptop, desktop, smartphone, or tablet)</li>
                <li>Stable internet connection (Wi-Fi or 4G/5G recommended; minimum ~2 Mbps up/down)</li>
                <li>Browser: latest Chrome (recommended), Safari, Firefox, or Edge</li>
                <li>No app download required.</li>
              </ul>
            </QA>

            <QA q="My camera or microphone isn't working.">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>Click the lock icon 🔒 in your browser&apos;s address bar and make sure camera and microphone access are set to &ldquo;Allow&rdquo;.</li>
                <li>Close any other apps that might be using your camera (e.g. Zoom, FaceTime).</li>
                <li>Reload the page and try again.</li>
                <li>In Chrome: go to Settings → Privacy and Security → Camera / Microphone to check permissions.</li>
              </ul>
            </QA>

            <QA q="The video or audio keeps cutting out.">
              <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                <li>Move closer to your Wi-Fi router.</li>
                <li>Pause any video streaming or large downloads on your network.</li>
                <li>Close unnecessary browser tabs.</li>
                <li>Try restarting your browser or device.</li>
              </ul>
            </QA>

            <QA q="Can I join from a smartphone?">
              Yes. Both iOS (Safari) and Android (Chrome) are supported. For the best experience,
              use your phone in landscape (horizontal) orientation. Make sure to grant the browser
              permission to access your camera and microphone when prompted.
            </QA>
          </Section>

          {/* ──────────────────────────────────────────────────────────
              8. Contact Us
          ──────────────────────────────────────────────────────────── */}
          <div id="contact" className="bg-navy-900 dark:bg-navy-800 rounded-2xl p-8 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-sage-400 flex-shrink-0" />
              <h2 className="text-xl font-bold">Contact Us</h2>
            </div>
            <p className="text-navy-300 mb-6 leading-relaxed">
              Couldn&apos;t find the answer you were looking for? We&apos;re happy to help.
              Our support team will get back to you as soon as possible.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-sage-400" />
                  <span className="font-semibold text-sm">Email</span>
                </div>
                <a
                  href="mailto:support@tryresetyoga.com"
                  className="text-sage-300 hover:text-white underline break-all"
                >
                  support@tryresetyoga.com
                </a>
                <p className="text-navy-400 text-xs mt-1">Available 24/7 · Reply within 2 business days</p>
              </div>

              <div className="bg-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-sage-400" />
                  <span className="font-semibold text-sm">Phone</span>
                </div>
                <p className="text-sage-300">+81-90-8094-4582</p>
                <p className="text-navy-400 text-xs mt-1">Weekdays 10:00–18:00 JST (closed weekends &amp; holidays)</p>
              </div>
            </div>

            <a
              href="mailto:support@tryresetyoga.com"
              className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-400 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              <Mail className="h-4 w-4" />
              Send us an email
            </a>
          </div>

        </div>

        <p className="text-xs text-gray-400 dark:text-navy-500 mt-8 text-right">
          Last updated: March 2026
        </p>
      </main>

      <Footer />
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

const colorMap = {
  sage: {
    bg: 'bg-sage-50 dark:bg-navy-800',
    border: 'border-sage-300 dark:border-sage-700',
    icon: 'text-sage-600 dark:text-sage-400',
    title: 'text-sage-800 dark:text-sage-300',
  },
  navy: {
    bg: 'bg-blue-50 dark:bg-navy-800',
    border: 'border-navy-300 dark:border-navy-600',
    icon: 'text-navy-600 dark:text-navy-300',
    title: 'text-navy-800 dark:text-navy-200',
  },
}

function Section({
  icon: Icon,
  color,
  title,
  id,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  color: 'sage' | 'navy'
  title: string
  id?: string
  children: React.ReactNode
}) {
  const c = colorMap[color]
  return (
    <div id={id} className={`rounded-2xl border ${c.bg} ${c.border} overflow-hidden`}>
      <div className={`flex items-center gap-3 px-6 py-4 border-b ${c.border}`}>
        <Icon className={`h-5 w-5 flex-shrink-0 ${c.icon}`} />
        <h2 className={`text-base font-bold ${c.title}`}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-navy-700">
        {children}
      </div>
    </div>
  )
}

function QA({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5">
      <p className="font-semibold text-navy-800 dark:text-white mb-2 flex items-start gap-2">
        <span className="text-sage-500 dark:text-sage-400 font-bold flex-shrink-0">Q.</span>
        {q}
      </p>
      <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed pl-6">
        {children}
      </div>
    </div>
  )
}

function StepItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sage-500 dark:bg-sage-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </span>
      <span className="text-gray-600 dark:text-gray-300">{children}</span>
    </li>
  )
}

function ContactLink() {
  return (
    <a href="mailto:support@tryresetyoga.com" className="text-navy-600 dark:text-sage-400 underline">
      support@tryresetyoga.com
    </a>
  )
}
