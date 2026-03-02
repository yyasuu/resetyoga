import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { format } from 'date-fns'
import { Calendar, Users, Star, Video, ChevronRight, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AccountCancelButton } from '@/components/account/AccountCancelButton'

export default async function InstructorDashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('instructor')
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || (profile.role !== 'instructor' && profile.role !== 'admin')) {
    redirect('/dashboard')
  }

  const { data: instructorProfile } = await supabase
    .from('instructor_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Upcoming bookings
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('*, time_slots(*), profiles!bookings_student_id_fkey(*)')
    .eq('instructor_id', user.id)
    .eq('status', 'confirmed')
    .gte('time_slots.start_time', new Date().toISOString())
    .order('time_slots(start_time)', { ascending: true })
    .limit(5)

  // Stats
  const { count: totalBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('instructor_id', user.id)
    .eq('status', 'completed')

  const { count: totalStudents } = await supabase
    .from('bookings')
    .select('student_id', { count: 'exact', head: true })
    .eq('instructor_id', user.id)

  const { data: slots } = await supabase
    .from('time_slots')
    .select('id', { count: 'exact' })
    .eq('instructor_id', user.id)
    .eq('status', 'available')
    .gte('start_time', new Date().toISOString())

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard_title')}</h1>
            <p className="text-gray-500 dark:text-navy-300 mt-1">
              {instructorProfile?.is_approved ? (
                <span className="text-green-600 dark:text-green-400 font-medium">✓ Approved & Active</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">⏳ Pending Approval</span>
              )}
            </p>
          </div>
          <Link href="/instructor/availability">
            <Button className="bg-navy-600 hover:bg-navy-700 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              {t('availability')}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-navy-100 dark:bg-navy-700 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-navy-600 dark:text-navy-300" />
              </div>
              <span className="text-gray-500 dark:text-navy-300 text-sm">{t('total_sessions')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalBookings || 0}</p>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-500 dark:text-navy-300 text-sm">{t('total_students')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStudents || 0}</p>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-xl p-6 border border-gray-200 dark:border-navy-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-gray-500 dark:text-navy-300 text-sm">{t('rating')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {instructorProfile?.rating
                ? Number(instructorProfile.rating).toFixed(1)
                : '—'}
              <span className="text-lg text-gray-400 dark:text-navy-400 font-normal">
                {instructorProfile?.total_reviews
                  ? ` (${instructorProfile.total_reviews})`
                  : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2 bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('upcoming_bookings')}</h2>
              <Link href="/instructor/bookings">
                <Button variant="ghost" size="sm" className="text-navy-600 dark:text-navy-300 hover:dark:bg-navy-700">
                  {locale === 'ja' ? '全て見る' : 'View all'} <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-navy-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-100 dark:bg-navy-600 flex items-center justify-center text-navy-600 dark:text-navy-200 font-bold text-sm">
                        {booking.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {booking.profiles?.full_name || 'Student'}
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
                    {booking.google_meet_link && (
                      <a
                        href={booking.google_meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-navy-600 dark:text-navy-300 hover:underline font-medium"
                      >
                        <Video className="h-4 w-4" />
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400 dark:text-navy-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{locale === 'ja' ? '予定のセッションはありません' : 'No upcoming sessions'}</p>
                <Link href="/instructor/availability" className="mt-3 inline-block">
                  <Button size="sm" className="bg-navy-600 hover:bg-navy-700 text-white">
                    {locale === 'ja' ? '空き枠を追加' : 'Set Availability'}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {locale === 'ja' ? 'クイックアクション' : 'Quick Actions'}
              </h2>
              <div className="space-y-3">
                <Link href="/instructor/availability">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <Calendar className="h-4 w-4 text-navy-600 dark:text-navy-400" />
                    {locale === 'ja' ? '空き枠を管理' : 'Manage Availability'}
                  </Button>
                </Link>
                <Link href="/instructor/bookings">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <Video className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    {locale === 'ja' ? '全予約' : 'All Bookings'}
                  </Button>
                </Link>
                <Link href="/instructor/profile">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    {locale === 'ja' ? 'プロフィール編集' : 'Edit Profile'}
                  </Button>
                </Link>
                <Link href="/instructor-terms" target="_blank">
                  <Button variant="outline" className="w-full justify-start gap-2 dark:border-navy-600 dark:text-gray-200 dark:hover:bg-navy-700">
                    <FileText className="h-4 w-4 text-gray-500 dark:text-navy-400" />
                    {locale === 'ja' ? '講師利用規約' : 'Instructor Terms'}
                  </Button>
                </Link>
                <AccountCancelButton role="instructor" />
              </div>
            </div>

            {/* Available slots count */}
            <div className="bg-navy-50 dark:bg-navy-800 rounded-xl border border-navy-100 dark:border-navy-700 p-6">
              <h3 className="font-bold text-navy-900 dark:text-white mb-1">
                {locale === 'ja' ? '空き枠数' : 'Available Slots'}
              </h3>
              <p className="text-3xl font-bold text-navy-600 dark:text-sage-400">{slots?.length || 0}</p>
              <p className="text-navy-600 dark:text-navy-300 text-sm">
                {locale === 'ja' ? '今後の空き枠' : 'upcoming open slots'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
