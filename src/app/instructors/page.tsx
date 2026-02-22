import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Profile } from '@/types'
import { Star, Clock } from 'lucide-react'
import { InstructorFilters } from '@/components/instructor/InstructorFilters'

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
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('page_title')}</h1>
        <p className="text-gray-500 mb-8">
          {instructors?.length || 0} certified instructors available
        </p>

        <InstructorFilters />

        {instructors && instructors.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {instructors.map((instructor: any) => (
              <Link key={instructor.id} href={`/instructors/${instructor.id}`}>
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-navy-200 transition-all cursor-pointer group h-full flex flex-col">
                  {/* Avatar & Name */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {instructor.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 group-hover:text-navy-600 transition-colors truncate">
                        {instructor.full_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {instructor.instructor_profiles?.rating > 0
                              ? Number(instructor.instructor_profiles.rating).toFixed(1)
                              : 'New'}
                          </span>
                        </div>
                        {instructor.instructor_profiles?.total_reviews > 0 && (
                          <span className="text-xs text-gray-400">
                            ({instructor.instructor_profiles.total_reviews} reviews)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bio */}
                  {instructor.instructor_profiles?.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {instructor.instructor_profiles.bio}
                    </p>
                  )}

                  {/* Experience */}
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <Clock className="h-4 w-4" />
                    {t('years_exp', {
                      count: instructor.instructor_profiles?.years_experience || 0,
                    })}
                  </div>

                  {/* Yoga Styles */}
                  {instructor.instructor_profiles?.yoga_styles?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {instructor.instructor_profiles.yoga_styles.slice(0, 4).map((s: string) => (
                        <span
                          key={s}
                          className="text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full border border-navy-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Languages */}
                  {instructor.instructor_profiles?.languages?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {instructor.instructor_profiles.languages.slice(0, 3).map((l: string) => (
                        <span key={l} className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="text-navy-600 font-medium text-sm group-hover:underline">
                      {t('view_profile')} →
                    </span>
                  </div>
                </div>
              </Link>
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
