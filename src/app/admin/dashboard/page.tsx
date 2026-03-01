import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { ApproveInstructorButton } from '@/components/admin/ApproveInstructorButton'
import { Users, Calendar, BookOpen, Star, FileText } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const adminSupabase = await createAdminClient()
  const t = await getTranslations('admin')

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  // Stats
  const { count: totalStudents } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'student')

  const { count: totalInstructors } = await adminSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'instructor')

  const { count: totalBookings } = await adminSupabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })

  // Pending instructor approvals — use !inner so only rows with is_approved=false are returned
  const { data: pendingInstructors } = await adminSupabase
    .from('profiles')
    .select('*, instructor_profiles!inner(*)')
    .eq('role', 'instructor')
    .eq('instructor_profiles.is_approved', false)

  // Approved instructors — same !inner pattern
  const { data: approvedInstructors } = await adminSupabase
    .from('profiles')
    .select('*, instructor_profiles!inner(*)')
    .eq('role', 'instructor')
    .eq('instructor_profiles.is_approved', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('title')}</h1>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-navy-600" />
              </div>
              <span className="text-gray-500 text-sm">{t('total_students')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalStudents || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Instructors</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalInstructors || 0}</p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">{t('total_bookings')}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBookings || 0}</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {t('pending_instructors')}
            {pendingInstructors && pendingInstructors.length > 0 && (
              <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingInstructors.length}
              </span>
            )}
          </h2>

          {pendingInstructors && pendingInstructors.length > 0 ? (
            <div className="space-y-4">
              {pendingInstructors.map((instructor: any) => (
                <div
                  key={instructor.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{instructor.full_name}</p>
                    <p className="text-sm text-gray-500">{instructor.email}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {instructor.instructor_profiles?.yoga_styles?.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-white text-navy-600 px-2 py-0.5 rounded-full border border-navy-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {instructor.instructor_profiles?.years_experience} yrs experience ·{' '}
                      {instructor.instructor_profiles?.languages?.join(', ')}
                    </p>
                  </div>
                  <ApproveInstructorButton
                    instructorId={instructor.id}
                    instructorName={instructor.full_name || ''}
                    instructorEmail={instructor.email}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No pending approvals</p>
          )}
        </div>

        {/* Legal Documents */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Legal Documents
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/instructor-terms"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-50 text-navy-700 border border-navy-100 hover:bg-navy-100 text-sm font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              Instructor Terms &amp; Conditions
            </Link>
            <Link
              href="/student-terms"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-50 text-navy-700 border border-navy-100 hover:bg-navy-100 text-sm font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              Student Terms &amp; Conditions
            </Link>
            <Link
              href="/terms"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              <FileText className="h-4 w-4" />
              Privacy Policy
            </Link>
          </div>
        </div>

        {/* Approved Instructors */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">{t('all_instructors')}</h2>
          {approvedInstructors && approvedInstructors.length > 0 ? (
            <div className="space-y-3">
              {approvedInstructors.map((instructor: any) => (
                <div
                  key={instructor.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{instructor.full_name}</p>
                    <p className="text-sm text-gray-400">{instructor.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-gray-600">
                      {instructor.instructor_profiles?.rating > 0
                        ? Number(instructor.instructor_profiles.rating).toFixed(1)
                        : 'New'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">
                      {t('approved')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No approved instructors yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
