import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar, Search, Video, AlertCircle, FileText } from 'lucide-react'
import { cookies } from 'next/headers'
import { StudentSubscription } from '@/types'
import { AccountCancelButton } from '@/components/account/AccountCancelButton'

export default async function StudentDashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('student')
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/login')
  if (profile.role === 'instructor') redirect('/instructor/dashboard')
  if (profile.role === 'admin') redirect('/admin/dashboard')

  // If no profile role set, go to onboarding
  if (!profile.role || profile.role === 'student') {
    // Check if subscription record exists
    const { data: sub } = await supabase
      .from('student_subscriptions')
      .select('*')
      .eq('student_id', user.id)
      .single()

    if (!sub) {
      // Create trial subscription
      await supabase.from('student_subscriptions').upsert({
        student_id: user.id,
        status: 'trial',
        trial_used: 0,
        trial_limit: 2,
        sessions_used: 0,
        sessions_limit: 4,
      })
    }
  }

  const { data: subscription } = await supabase
    .from('student_subscriptions')
    .select('*')
    .eq('student_id', user.id)
    .single() as { data: StudentSubscription | null }

  // Upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, time_slots(*), profiles!bookings_instructor_id_fkey(*)')
    .eq('student_id', user.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(5)

  const canBook =
    subscription &&
    (
      (subscription.status === 'trial' && subscription.trial_used < subscription.trial_limit) ||
      (subscription.status === 'active' && subscription.sessions_used < subscription.sessions_limit)
    )

  const trialLeft =
    subscription?.status === 'trial'
      ? subscription.trial_limit - subscription.trial_used
      : 0

  const sessionsLeft =
    subscription?.status === 'active'
      ? subscription.sessions_limit - subscription.sessions_used
      : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('dashboard_title')}</h1>

        {/* Subscription Status Banner */}
        {subscription && (
          <div className={`rounded-xl p-5 mb-6 border ${
            subscription.status === 'trial' && trialLeft > 0
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800'
              : subscription.status === 'active'
              ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
              : 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800'
          }`}>
            {subscription.status === 'trial' && trialLeft > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-blue-900 dark:text-blue-200">
                    {t('trial_remaining', { count: trialLeft })}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    {t('trial_upsell')}
                  </p>
                </div>
                <Link href="/subscription">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap">
                    {t('view_plans')}
                  </Button>
                </Link>
              </div>
            )}

            {subscription.status === 'active' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="font-semibold text-green-900 dark:text-green-200">
                  {t('subscription_active', { count: sessionsLeft })}
                </p>
                <Link href="/subscription">
                  <Button size="sm" variant="outline" className="border-green-400 dark:border-green-600 text-green-700 dark:text-green-400">
                    {t('manage_plan')}
                  </Button>
                </Link>
              </div>
            )}

            {(subscription.status === 'trial' && trialLeft === 0) ||
              subscription.status === 'canceled' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <p className="font-semibold text-orange-900 dark:text-orange-200">{t('upgrade_prompt')}</p>
                </div>
                <Link href="/subscription">
                  <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap">
                    {t('upgrade_btn')}
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t('upcoming_bookings')}</h2>
            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-navy-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-100 dark:bg-navy-600 flex items-center justify-center text-navy-600 dark:text-navy-200 font-bold text-sm">
                        {booking.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.profiles?.full_name || 'Instructor'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-navy-300">
                          {booking.time_slots?.start_time
                            ? format(
                                new Date(booking.time_slots.start_time),
                                'MMM d, yyyy • h:mm a'
                              )
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <a
                      href={booking.google_meet_link || `https://meet.jit.si/reset-yoga-${booking.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-navy-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-navy-700"
                    >
                      <Video className="h-4 w-4" />
                      Join Session
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-navy-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="mb-4">{t('no_upcoming')}</p>
                {canBook && (
                  <Link href="/instructors">
                    <Button size="sm" className="bg-navy-600 hover:bg-navy-700 text-white">
                      {t('browse_instructors')}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('quick_actions')}
              </h2>
              <div className="space-y-3">
                <Link href="/instructors">
                  <Button
                    className="w-full justify-start gap-2 bg-navy-600 hover:bg-navy-700 text-white"
                    disabled={!canBook}
                  >
                    <Search className="h-4 w-4" />
                    {t('find_instructor')}
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    {locale === 'ja' ? '全予約' : 'All Bookings'}
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
                    {t('subscription')}
                  </Button>
                </Link>
                <Link href="/student-terms" target="_blank">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-navy-400" />
                    {locale === 'ja' ? '生徒利用規約' : 'Student Terms'}
                  </Button>
                </Link>
                <AccountCancelButton role="student" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
