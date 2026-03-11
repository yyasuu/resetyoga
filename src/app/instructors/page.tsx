import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { Profile } from '@/types'
import { InstructorFilters } from '@/components/instructor/InstructorFilters'
import { InstructorCard } from '@/components/instructor/InstructorCard'
import { CONCERNS } from '@/lib/concerns'
import { cookies } from 'next/headers'

interface SearchParams {
  style?: string
  language?: string
  q?: string
  concern?: string
}

const inferYearsExperience = (profile: {
  years_experience?: number | null
  bio?: string | null
  tagline?: string | null
  career_history?: string | null
}) => {
  const direct = Number(profile.years_experience ?? 0)
  if (Number.isFinite(direct) && direct > 0) return direct

  const text = `${profile.bio ?? ''} ${profile.tagline ?? ''} ${profile.career_history ?? ''}`
  const m = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i)
  if (m) return Number(m[1])
  return 0
}

export default async function InstructorsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const supabase = await createClient()
  const t = await getTranslations('instructors')
  const params = await searchParams
  const cookieStore = await cookies()
  const locale = cookieStore.get('NEXT_LOCALE')?.value === 'ja' ? 'ja' : 'en'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const isStudent = profile?.role === 'student'

  // Resolve concern → yoga styles
  const concern = params.concern
    ? CONCERNS.find((c) => c.id === params.concern) ?? null
    : null

  // Build query
  let query = supabase
    .from('profiles')
    .select('*, instructor_profiles(*)')
    .eq('role', 'instructor')
    .eq('instructor_profiles.is_approved', true)

  if (concern) {
    // Filter instructors who teach ANY of the concern's yoga styles
    query = query.overlaps('instructor_profiles.yoga_styles', concern.yogaStyles)
  } else if (params.style) {
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
    <div className="min-h-screen bg-linen-50 dark:bg-navy-900">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {t('page_title')}
        </h1>

        {/* Show matched concern description */}
        {concern ? (
          <p className="text-sage-600 dark:text-sage-400 mb-6 font-medium">
            {concern.icon}{' '}
            {locale === 'ja'
              ? `「${concern.ja}」に合う講師 — ${instructors?.length || 0}名`
              : `Instructors for "${concern.en}" — ${instructors?.length || 0} found`}
          </p>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {instructors?.length || 0}{' '}
            {locale === 'ja' ? '名の認定講師が見つかりました' : 'certified instructors available'}
          </p>
        )}

        <InstructorFilters />

        {instructors && instructors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {instructors.map((instructor) => {
              const years = inferYearsExperience(instructor.instructor_profiles ?? {})
              return (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                isStudent={isStudent}
                yearsExpLabel={t('years_exp', {
                  count: Number.isFinite(years) ? years : 0,
                })}
                viewProfileLabel={t('view_profile')}
              />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 dark:text-navy-400 mt-8">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
              {locale === 'ja' ? '該当する講師が見つかりませんでした' : 'No instructors found'}
            </p>
            <p className="text-sm">
              {locale === 'ja'
                ? '別のお悩みや条件でお試しください'
                : 'Try a different concern or filter'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
