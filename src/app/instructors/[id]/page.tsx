import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Profile } from '@/types'
import { Star, Clock, Globe } from 'lucide-react'
import { StudentBookingCalendar } from '@/components/calendar/StudentBookingCalendar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'

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

  // Fetch instructor
  const { data: instructor } = await supabase
    .from('profiles')
    .select('*, instructor_profiles(*)')
    .eq('id', id)
    .eq('role', 'instructor')
    .single()

  if (!instructor) notFound()

  const ip = instructor.instructor_profiles

  // Fetch reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_student_id_fkey(full_name)')
    .eq('instructor_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={currentProfile} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                {instructor.full_name?.charAt(0) || '?'}
              </div>

              <h1 className="text-xl font-bold text-gray-900 text-center mb-1">
                {instructor.full_name}
              </h1>

              {/* Rating */}
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(ip?.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-500 ml-1">
                  {ip?.rating > 0 ? Number(ip.rating).toFixed(1) : 'New'}
                  {ip?.total_reviews > 0 ? ` (${ip.total_reviews})` : ''}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4 text-navy-500" />
                  {t('years_exp', { count: ip?.years_experience || 0 })}
                </div>
                <div className="flex items-start gap-2 text-gray-600">
                  <Globe className="h-4 w-4 text-navy-500 mt-0.5" />
                  <span>{ip?.languages?.join(', ') || '—'}</span>
                </div>
              </div>

              {ip?.yoga_styles?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Styles
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {ip.yoga_styles.map((s: string) => (
                      <span
                        key={s}
                        className="text-xs bg-navy-50 text-navy-600 px-2 py-1 rounded-full border border-navy-100"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="book">
              <TabsList className="mb-6">
                <TabsTrigger value="book">Book a Session</TabsTrigger>
                <TabsTrigger value="about">{t('about')}</TabsTrigger>
                <TabsTrigger value="reviews">
                  {t('reviews')} {ip?.total_reviews > 0 ? `(${ip.total_reviews})` : ''}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="book">
                <StudentBookingCalendar
                  instructorId={id}
                  instructorName={instructor.full_name || 'Instructor'}
                />
              </TabsContent>

              <TabsContent value="about">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">{t('about')}</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {ip?.bio || 'No bio provided yet.'}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  {reviews && reviews.length > 0 ? (
                    reviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="bg-white rounded-xl border border-gray-200 p-5"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {review.profiles?.full_name || 'Student'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(review.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600 text-sm">{review.comment}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-400">
                      <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No reviews yet. Be the first!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
