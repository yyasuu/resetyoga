import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { Calendar, Users, Star, Video, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function InstructorDashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations('instructor')

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard_title')}</h1>
            <p className="text-gray-500 mt-1">
              {instructorProfile?.is_approved ? (
                <span className="text-green-600 font-medium">✓ Approved & Active</span>
              ) : (
                <span className="text-yellow-600 font-medium">⏳ Pending Approval</span>
              )}
            </p>
          </div>
          <Link href="/instructor/availability">
            <Button className="bg-navy-600 hover:bg-navy-700">
              <Calendar className="h-4 w-4 mr-2" />
              {t('availability')}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <Video className="h-5 w-5 text-navy-600" />
              </div>
              <span className="text-gray-500 text-sm">{t('total_sessions')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBookings || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">{t('total_students')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalStudents || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 text-sm">{t('rating')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {instructorProfile?.rating
                ? Number(instructorProfile.rating).toFixed(1)
                : '—'}
              <span className="text-lg text-gray-400 font-normal">
                {instructorProfile?.total_reviews
                  ? ` (${instructorProfile.total_reviews})`
                  : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">{t('upcoming_bookings')}</h2>
              <Link href="/instructor/bookings">
                <Button variant="ghost" size="sm" className="text-navy-600">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>

            {upcomingBookings && upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {upcomingBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-bold text-sm">
                        {booking.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.profiles?.full_name || 'Student'}
                        </p>
                        <p className="text-sm text-gray-500">
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
                        className="inline-flex items-center gap-1 text-sm text-navy-600 hover:underline font-medium"
                      >
                        <Video className="h-4 w-4" />
                        Join
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No upcoming sessions</p>
                <Link href="/instructor/availability" className="mt-3 inline-block">
                  <Button size="sm" className="bg-navy-600 hover:bg-navy-700">
                    Set Availability
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/instructor/availability">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4 text-navy-600" />
                    Manage Availability
                  </Button>
                </Link>
                <Link href="/instructor/bookings">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Video className="h-4 w-4 text-purple-600" />
                    All Bookings
                  </Button>
                </Link>
                <Link href="/instructor/profile">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4 text-green-600" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Available slots count */}
            <div className="bg-navy-50 rounded-xl border border-navy-100 p-6">
              <h3 className="font-bold text-navy-900 mb-1">Available Slots</h3>
              <p className="text-3xl font-bold text-navy-600">{slots?.length || 0}</p>
              <p className="text-navy-600 text-sm">upcoming open slots</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
