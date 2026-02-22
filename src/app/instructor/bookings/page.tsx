import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { format } from 'date-fns'
import { Video, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default async function InstructorBookingsPage() {
  const supabase = await createClient()
  const t = await getTranslations('booking')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || profile.role !== 'instructor') redirect('/dashboard')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, time_slots(*), profiles!bookings_student_id_fkey(*)')
    .eq('instructor_id', user.id)
    .order('time_slots(start_time)', { ascending: false })

  const now = new Date()
  const upcoming = bookings?.filter(
    (b: any) => new Date(b.time_slots?.start_time) >= now && b.status === 'confirmed'
  )
  const past = bookings?.filter(
    (b: any) => new Date(b.time_slots?.start_time) < now || b.status !== 'confirmed'
  )

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      completed: 'bg-gray-100 text-gray-700',
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || ''}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('your_bookings')}</h1>

        {/* Upcoming */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">{t('upcoming')}</h2>
          {upcoming && upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      {booking.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {booking.profiles?.full_name || 'Student'}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                        <Clock className="h-3.5 w-3.5" />
                        {booking.time_slots?.start_time
                          ? format(new Date(booking.time_slots.start_time), 'MMM d, yyyy • h:mm a')
                          : '—'}
                        {' · 45 min'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(booking.status)}
                    {booking.google_meet_link && (
                      <a
                        href={booking.google_meet_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                      >
                        <Video className="h-4 w-4" />
                        {t('join_meeting')}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{t('no_bookings')}</p>
          )}
        </div>

        {/* Past */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-4">{t('past')}</h2>
          {past && past.length > 0 ? (
            <div className="space-y-3">
              {past.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                      {booking.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700">
                        {booking.profiles?.full_name || 'Student'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {booking.time_slots?.start_time
                          ? format(new Date(booking.time_slots.start_time), 'MMM d, yyyy • h:mm a')
                          : '—'}
                      </p>
                    </div>
                  </div>
                  {statusBadge(booking.status)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{t('no_bookings')}</p>
          )}
        </div>
      </div>
    </div>
  )
}
