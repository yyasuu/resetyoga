import { createClient, createAdminClient } from '@/lib/supabase/server'
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

const SECOND_INSTRUCTOR_ID = '5ea101c5-e9dc-48be-b347-f6769f219b55'

const canonicalName = (name: string | null | undefined) =>
  (name || '').toLowerCase().replace(/[^a-z]/g, '')

const isSudhanInstructor = (instructor: {
  full_name?: string | null
  instructor_profiles?: { tagline?: string | null; bio?: string | null; career_history?: string | null } | null
}) => {
  const ip = instructor.instructor_profiles
  const n = canonicalName(`${instructor.full_name ?? ''} ${ip?.tagline ?? ''} ${ip?.bio ?? ''} ${ip?.career_history ?? ''}`)
  return (
    n.includes('yogiathmasudhan') ||
    n.includes('dryogiathmasudhan') ||
    (n.includes('yogi') && n.includes('athma') && n.includes('sudhan'))
  )
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
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0))
  const mEn = text.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i)
  if (mEn) return Number(mEn[1])
  const mJa = text.match(/(\d{1,2})\s*年/)
  if (mJa) return Number(mJa[1])
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

  // Query instructor_profiles first, then join profiles by ID.
  // This avoids ambiguous nested join behavior and guarantees bio source integrity.
  const adminSupabase = await createAdminClient()
  let ipQuery = adminSupabase
    .from('instructor_profiles')
    .select('id, bio, tagline, career_history, years_experience, yoga_styles, languages, is_approved, created_at')
    .eq('is_approved', true)

  if (concern) {
    ipQuery = ipQuery.overlaps('yoga_styles', concern.yogaStyles)
  } else if (params.style) {
    ipQuery = ipQuery.contains('yoga_styles', [params.style])
  }

  if (params.language) {
    ipQuery = ipQuery.contains('languages', [params.language])
  }

  const { data: ipRows } = await ipQuery.order('created_at', { ascending: false })
  const approvedProfileIds = (ipRows || []).map((row: any) => row.id)

  let instructors: any[] = []
  if (approvedProfileIds.length > 0) {
    let profileQuery = adminSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, avatar_position, avatar_zoom, role, created_at')
      .eq('role', 'instructor')
      .in('id', approvedProfileIds)

    if (params.q) {
      profileQuery = profileQuery.ilike('full_name', `%${params.q}%`)
    }

    const { data: profileRows } = await profileQuery
    const profileMap = new Map((profileRows || []).map((p: any) => [p.id, p]))

    instructors = (ipRows || [])
      .map((ip: any) => {
        const p = profileMap.get(ip.id)
        if (!p) return null
        return {
          ...p,
          instructor_profiles: ip,
        }
      })
      .filter(Boolean)
  }

  const hasFilter = Boolean(params.style || params.language || params.q || params.concern)
  if (!hasFilter) {
    const { data: pinnedProfile } = await adminSupabase
      .from('profiles')
      .select('id, full_name, avatar_url, avatar_position, avatar_zoom, role, created_at')
      .eq('id', SECOND_INSTRUCTOR_ID)
      .eq('role', 'instructor')
      .maybeSingle()

    const { data: pinnedIp } = await adminSupabase
      .from('instructor_profiles')
      .select('id, bio, tagline, career_history, years_experience, yoga_styles, languages, is_approved, created_at')
      .eq('id', SECOND_INSTRUCTOR_ID)
      .eq('is_approved', true)
      .maybeSingle()

    if (pinnedProfile && pinnedIp) {
      const pinned = { ...pinnedProfile, instructor_profiles: pinnedIp }
      const pinnedName = canonicalName(pinned.full_name)
      const filtered = instructors.filter((i: any) => {
        if (i.id === SECOND_INSTRUCTOR_ID) return false
        const nameMatches = pinnedName && canonicalName(i.full_name) === pinnedName
        const iHasNoIntro = !(
          i.instructor_profiles?.bio?.trim() ||
          i.instructor_profiles?.tagline?.trim() ||
          i.instructor_profiles?.career_history?.trim()
        )
        return !(nameMatches && iHasNoIntro)
      })
      filtered.push(pinned)
      instructors = filtered
    }
  }

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
              const inferred = inferYearsExperience(instructor.instructor_profiles ?? {})
              const years = inferred > 0 ? inferred : (isSudhanInstructor(instructor) ? 16 : 0)
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
