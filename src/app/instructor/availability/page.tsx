import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { InstructorCalendar } from '@/components/calendar/InstructorCalendar'

export default async function AvailabilityPage() {
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
    .select('is_approved')
    .eq('id', user.id)
    .single()

  const instructorTimezone = profile.timezone ?? 'UTC'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{t('availability_title')}</h1>
          <p className="text-gray-500 mt-1">{t('availability_desc')}</p>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-navy-700 dark:text-navy-200 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-full px-3 py-1">
            🌏 Your schedule timezone: <strong>{instructorTimezone}</strong>
            <a href="/instructor/profile#timezone" className="ml-1 text-xs text-navy-500 dark:text-sage-400 hover:underline">Change →</a>
          </p>
        </div>

        {!instructorProfile?.is_approved && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-yellow-800">
            <strong>Pending Approval:</strong> Your instructor profile is under review. You can set
            your availability now, and students will be able to book once you are approved.
          </div>
        )}

        <InstructorCalendar instructorId={user.id} timezone={instructorTimezone} />
      </div>
    </div>
  )
}
