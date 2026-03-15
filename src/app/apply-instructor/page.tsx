import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import ApplyForm from './ApplyForm'

export const metadata = {
  title: 'Apply as Instructor | Reset Yoga',
}

export default async function ApplyInstructorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // If already an instructor or admin, send to their dashboard
  if (profile.role === 'instructor') redirect('/instructor/dashboard')
  if (profile.role === 'admin')      redirect('/admin/dashboard')

  // Check if an instructor_profiles row already exists (e.g. submitted before)
  const { data: existing } = await supabase
    .from('instructor_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'
  const ja = locale === 'ja'

  return (
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900 flex flex-col">
      <Navbar user={profile} />

      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-sage-600 dark:text-sage-400 mb-3">
              {ja ? '講師申請' : 'Instructor Application'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {ja ? 'Reset Yogaの講師として\n教えませんか？' : 'Teach on Reset Yoga'}
            </h1>
            <p className="text-gray-500 dark:text-navy-300 text-sm leading-relaxed">
              {ja
                ? 'スケジュール管理・集客・決済はすべてReset Yogaが担当します。あなたは教えることに集中できます。申請は3ステップで完了します。'
                : 'Reset Yoga handles scheduling, discovery, and payments. You focus on teaching. Takes just 3 steps.'}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-navy-700 p-6 sm:p-8 shadow-sm">
            <ApplyForm profile={profile} alreadyApplied={!!existing} />
          </div>
        </div>
      </div>
    </div>
  )
}
