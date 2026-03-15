import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Profile } from '@/types'
import { Star, Clock, Globe, Award, FileText, MessageSquare, CalendarDays } from 'lucide-react'
import { StudentBookingCalendar } from '@/components/calendar/StudentBookingCalendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

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

function StarRow({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls =
    size === 'lg' ? 'h-6 w-6' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${cls} ${
            s <= filled
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-navy-600 dark:text-navy-600'
          }`}
        />
      ))}
    </div>
  )
}

export default async function InstructorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const t = await getTranslations('instructors')

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let currentProfile: Profile | null = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    currentProfile = data
  }

  const isStudent = currentProfile?.role === 'student'

  // Fetch instructor
  const { data: instructor } = await supabase
    .from('profiles')
    .select('*, instructor_profiles(*)')
    .eq('id', id)
    .eq('role', 'instructor')
    .single()

  if (!instructor) notFound()

  const ip = instructor.instructor_profiles
  const displayYears = inferYearsExperience(ip ?? {})

  // Fetch reviews (always fetch for detail page — context is specific instructor)
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_student_id_fkey(full_name)')
    .eq('instructor_id', id)
    .order('created_at', { ascending: false })

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map((n) => {
    const count = (reviews || []).filter((r) => Math.round(r.rating) === n).length
    const pct =
      reviews && reviews.length > 0
        ? Math.round((count / reviews.length) * 100)
        : 0
    return { star: n, count, pct }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      <Navbar user={currentProfile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="book">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Profile card ── */}
          <div className="lg:col-span-1 min-w-0">
            <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 lg:sticky lg:top-24">
              {/* Avatar */}
              {instructor.avatar_url ? (
                <Image
                  src={instructor.avatar_url}
                  alt={instructor.full_name || 'Instructor'}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4 border-2 border-gray-100 dark:border-navy-600"
                  style={{
                    objectPosition: instructor.avatar_position || 'center center',
                    transform: `scale(${Number(instructor.avatar_zoom ?? 1) || 1})`,
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                  {instructor.full_name?.charAt(0) || '?'}
                </div>
              )}

              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-1">
                {instructor.full_name}
              </h1>

              {/* Rating — only for logged-in students */}
              {isStudent && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StarRow rating={ip?.rating || 0} size="md" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {ip?.rating > 0 ? Number(ip.rating).toFixed(1) : '新規'}
                  </span>
                  {ip?.total_reviews > 0 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      ({ip.total_reviews}件)
                    </span>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm mt-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4 text-navy-500 dark:text-sage-400 flex-shrink-0" />
                  {t('years_exp', { count: displayYears })}
                </div>
                <div className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                  <Globe className="h-4 w-4 text-navy-500 dark:text-sage-400 flex-shrink-0 mt-0.5" />
                  <span>{ip?.languages?.join(', ') || '—'}</span>
                </div>
              </div>

              {ip?.yoga_styles?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {t('styles')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ip.yoga_styles.map((s: string) => (
                      <span
                        key={s}
                        className="text-xs bg-navy-50 dark:bg-navy-700 text-navy-600 dark:text-sage-300 px-2 py-1 rounded-full border border-navy-100 dark:border-navy-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Desktop-only navigation (hidden on mobile) */}
              <div className="hidden lg:block mt-6 pt-5 border-t border-gray-100 dark:border-navy-700">
                <TabsList className="w-full h-auto grid grid-cols-1 gap-3 bg-transparent p-0">
                  <TabsTrigger
                    value="about"
                    className="w-full h-14 justify-start gap-3 rounded-xl border border-navy-200 dark:border-navy-600 bg-navy-50 dark:bg-navy-700 text-navy-700 dark:text-gray-100 text-base font-semibold data-[state=active]:bg-navy-600 data-[state=active]:text-white data-[state=active]:border-navy-600 dark:data-[state=active]:bg-navy-600 dark:data-[state=active]:text-white dark:data-[state=active]:border-navy-600"
                  >
                    <FileText className="h-6 w-6" />
                    Details / About
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="w-full h-14 justify-start gap-3 rounded-xl border border-sage-300 dark:border-sage-500 bg-sage-100 dark:bg-sage-600 text-sage-800 dark:text-white text-base font-semibold data-[state=active]:bg-sage-600 data-[state=active]:text-white data-[state=active]:border-sage-600 dark:data-[state=active]:bg-sage-500 dark:data-[state=active]:text-white dark:data-[state=active]:border-sage-500"
                  >
                    <MessageSquare className="h-6 w-6" />
                    Reviews
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
          </div>

          {/* ── Right: Tabs ── */}
          <div className="lg:col-span-2 min-w-0">
              {/* Mobile-only nav strip — sits directly above tab content, guaranteed no overlap */}
              <div className="lg:hidden mb-10">
                <TabsList className="flex h-auto w-full flex-col items-stretch justify-start gap-3 rounded-2xl border border-gray-200 bg-white p-3 dark:border-navy-700 dark:bg-navy-800">
                  <TabsTrigger
                    value="about"
                    className="!flex-none !h-auto flex w-full min-h-[4.75rem] shrink-0 items-center justify-start gap-3 rounded-xl border border-navy-200 bg-navy-50 px-4 py-4 text-left text-sm font-semibold whitespace-normal text-navy-700 dark:border-navy-500 dark:bg-navy-700 dark:text-white data-[state=active]:border-navy-600 data-[state=active]:bg-navy-600 data-[state=active]:text-white dark:data-[state=active]:border-navy-600 dark:data-[state=active]:bg-navy-600 dark:data-[state=active]:text-white"
                  >
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span>About</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="reviews"
                    className="!flex-none !h-auto flex w-full min-h-[4.75rem] shrink-0 items-center justify-start gap-3 rounded-xl border border-sage-300 bg-sage-100 px-4 py-4 text-left text-sm font-semibold whitespace-normal text-sage-900 dark:border-sage-700 dark:bg-sage-200 dark:text-sage-950 data-[state=active]:border-sage-600 data-[state=active]:bg-sage-600 data-[state=active]:text-white dark:data-[state=active]:border-sage-500 dark:data-[state=active]:bg-sage-500 dark:data-[state=active]:text-white"
                  >
                    <MessageSquare className="h-5 w-5 flex-shrink-0 text-sage-950 dark:text-sage-950" />
                    <span>Reviews</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="book"
                    className="!flex-none !h-auto flex w-full min-h-[4.75rem] shrink-0 items-center justify-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-left text-sm font-semibold whitespace-normal text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/60 dark:text-indigo-100 data-[state=active]:border-indigo-600 data-[state=active]:bg-indigo-600 data-[state=active]:text-white dark:data-[state=active]:border-indigo-600 dark:data-[state=active]:bg-indigo-600 dark:data-[state=active]:text-white"
                  >
                    <CalendarDays className="h-5 w-5 flex-shrink-0" />
                    <span>Book a Session</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Desktop-only Book trigger */}
              <div className="hidden lg:block mb-6">
                <TabsList className="dark:bg-navy-800 dark:border-navy-700">
                  <TabsTrigger value="book">Book a Session</TabsTrigger>
                </TabsList>
              </div>

              {/* Book */}
              <TabsContent value="book" className="mt-4 lg:mt-0">
                <StudentBookingCalendar
                  instructorId={id}
                  instructorName={instructor.full_name || 'Instructor'}
                  studentTimezone={currentProfile?.timezone ?? 'Asia/Tokyo'}
                />
              </TabsContent>

              {/* About */}
              <TabsContent value="about" className="mt-4 lg:mt-0">
                <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
                    {t('about')}
                  </h2>
                  <div className="space-y-5 text-sm">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Display Name</p>
                      <p className="text-gray-700 dark:text-gray-200">{instructor.full_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Years of Experience</p>
                      <p className="text-gray-700 dark:text-gray-200">{displayYears > 0 ? `${displayYears} years` : '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Tagline</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{ip?.tagline || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Bio</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{ip?.bio || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Yoga Styles</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                        {ip?.yoga_styles?.length ? ip.yoga_styles.join(', ') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Languages</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">
                        {ip?.languages?.length ? ip.languages.join(', ') : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">資格認定 / Certifications</p>
                      {ip?.certifications?.length ? (
                        <div className="space-y-1">
                          {ip.certifications.map((cert: string) => (
                            <p key={cert} className="text-gray-700 dark:text-gray-200">{cert}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-200">—</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1">Background / Career History</p>
                      <p className="text-gray-700 dark:text-gray-200 whitespace-pre-line">{ip?.career_history || '—'}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Reviews */}
              <TabsContent value="reviews" className="mt-4 lg:mt-0">
                {isStudent ? (
                  <div className="space-y-4">
                    {/* Rating summary (Amazon-style breakdown) */}
                    {reviews && reviews.length > 0 && (
                      <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-5">
                        <div className="flex gap-6">
                          {/* Big score */}
                          <div className="text-center flex-shrink-0 w-24">
                            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none mb-2">
                              {Number(ip?.rating).toFixed(1)}
                            </p>
                            <StarRow rating={ip?.rating || 0} size="md" />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                              {reviews.length}件
                            </p>
                          </div>
                          {/* Breakdown bars */}
                          <div className="flex-1 space-y-2 flex flex-col justify-center">
                            {breakdown.map(({ star, count, pct }) => (
                              <div key={star} className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500 dark:text-gray-400 w-2 text-right">
                                  {star}
                                </span>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                <div className="flex-1 bg-gray-100 dark:bg-navy-700 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-yellow-400 h-2 rounded-full"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-gray-400 dark:text-gray-500 w-4 text-right">
                                  {count}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Individual reviews */}
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review: any) => {
                        const name = review.profiles?.full_name || '生徒'
                        return (
                          <div
                            key={review.id}
                            className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-5"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                    {name}
                                  </p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {format(new Date(review.created_at), 'yyyy年M月d日')}
                                  </p>
                                </div>
                              </div>
                              <StarRow rating={review.rating} size="sm" />
                            </div>
                            {review.comment ? (
                              <p className="text-gray-600 dark:text-gray-300 text-sm ml-12 leading-relaxed">
                                {review.comment}
                              </p>
                            ) : (
                              <p className="text-xs text-gray-400 dark:text-gray-500 ml-12 italic">
                                コメントなし
                              </p>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>まだレビューはありません</p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Non-student: prompt to log in */
                  <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                    <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">
                      レビューを見るには生徒としてログインしてください。
                    </p>
                  </div>
                )}
              </TabsContent>
          </div>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
