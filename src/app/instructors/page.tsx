import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { Profile } from '@/types'
import { InstructorFilters } from '@/components/instructor/InstructorFilters'
import { InstructorCard } from '@/components/instructor/InstructorCard'

interface SearchParams {
  style?: string
  language?: string
  q?: string
}

export default async function InstructorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const t = await getTranslations('instructors')
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  // Only logged-in students see ratings & reviews
  const isStudent = profile?.role === 'student'

  // Build query
  let query = supabase
    .from('profiles')
    .select('*, instructor_profiles(*)')
    .eq('role', 'instructor')
    .eq('instructor_profiles.is_approved', true)

  if (params.style) {
    query = query.contains('instructor_profiles.yoga_styles', [params.style])
  }
  if (params.language) {
    query = query.contains('instructor_profiles.languages', [params.language])
  }
  if (params.q) {
    query = query.ilike('full_name', `%${params.q}%`)
  }

  const { data: instructors } = await query.order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-950">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('page_title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {instructors?.length || 0} certified instructors available
        </p>

        <InstructorFilters />

        {instructors && instructors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {instructors.map((instructor: any) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                isStudent={isStudent}
                yearsExpLabel={t('years_exp', {
                  count: instructor.instructor_profiles?.years_experience || 0,
                })}
                viewProfileLabel={t('view_profile')}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{t('no_results')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
