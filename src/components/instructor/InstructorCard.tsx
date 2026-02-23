'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Clock, Award } from 'lucide-react'
import { ReviewsDialog } from './ReviewsDialog'

interface InstructorCardProps {
  instructor: {
    id: string
    full_name: string | null
    avatar_url: string | null
    instructor_profiles: {
      rating: number | null
      total_reviews: number | null
      bio: string | null
      years_experience: number | null
      yoga_styles: string[] | null
      languages: string[] | null
    } | null
  }
  isStudent: boolean
  yearsExpLabel: string   // pre-computed translation string from server
  viewProfileLabel: string
}

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round(rating)
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${
            s <= filled
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-300 dark:fill-navy-600 dark:text-navy-500'
          }`}
        />
      ))}
    </div>
  )
}

export function InstructorCard({
  instructor,
  isStudent,
  yearsExpLabel,
  viewProfileLabel,
}: InstructorCardProps) {
  const router = useRouter()
  const [reviewsOpen, setReviewsOpen] = useState(false)

  const ip = instructor.instructor_profiles
  const hasRating = (ip?.rating ?? 0) > 0 && (ip?.total_reviews ?? 0) > 0

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/instructors/${instructor.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/instructors/${instructor.id}`)}
        className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-200 dark:border-navy-700 p-6 hover:shadow-lg hover:border-navy-300 dark:hover:border-navy-500 transition-all cursor-pointer h-full flex flex-col group outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      >
        {/* ── Avatar + Name + Rating ── */}
        <div className="flex items-start gap-4 mb-4">
          {instructor.avatar_url ? (
            <Image
              src={instructor.avatar_url}
              alt={instructor.full_name || 'Instructor'}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-2 border-gray-100 dark:border-navy-600"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
              {instructor.full_name?.charAt(0) || '?'}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-navy-600 dark:group-hover:text-sage-400 transition-colors truncate text-base">
              {instructor.full_name}
            </h3>

            {/* ── Star rating (students only) ── */}
            {isStudent ? (
              hasRating ? (
                /* Clickable stars → open reviews modal */
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setReviewsOpen(true)
                  }}
                  className="flex items-center gap-1.5 mt-1.5 hover:opacity-80 transition-opacity group/stars"
                  title="レビューを見る"
                >
                  <StarDisplay rating={ip?.rating ?? 0} />
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {Number(ip?.rating).toFixed(1)}
                  </span>
                  <span className="text-xs text-navy-500 dark:text-sage-400 underline underline-offset-2 group-hover/stars:text-navy-700">
                    ({ip?.total_reviews}件)
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <StarDisplay rating={0} />
                  <span className="text-xs text-gray-400 dark:text-gray-500">新規</span>
                </div>
              )
            ) : (
              <div className="mt-1.5 h-5" />
            )}
          </div>
        </div>

        {/* ── Bio ── */}
        {ip?.bio && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
            {ip.bio}
          </p>
        )}

        {/* ── Experience ── */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-3">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>{yearsExpLabel}</span>
        </div>

        {/* ── Yoga Styles / Qualifications ── */}
        {ip?.yoga_styles && ip.yoga_styles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3 items-start">
            <Award className="h-3.5 w-3.5 text-navy-400 dark:text-sage-400 flex-shrink-0 mt-0.5" />
            {ip.yoga_styles.slice(0, 4).map((s: string) => (
              <span
                key={s}
                className="text-xs bg-navy-50 dark:bg-navy-700 text-navy-600 dark:text-sage-300 px-2 py-0.5 rounded-full border border-navy-100 dark:border-navy-600"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* ── Languages ── */}
        {ip?.languages && ip.languages.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {ip.languages.slice(0, 3).map((l: string) => (
              <span
                key={l}
                className="text-xs text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-navy-600 px-2 py-0.5 rounded-full"
              >
                {l}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-navy-700">
          <span className="text-navy-600 dark:text-sage-400 font-medium text-sm group-hover:underline">
            {viewProfileLabel} →
          </span>
        </div>
      </div>

      {/* Reviews modal — only rendered for students with reviews */}
      {isStudent && hasRating && (
        <ReviewsDialog
          instructorId={instructor.id}
          instructorName={instructor.full_name || 'Instructor'}
          avgRating={ip?.rating ?? 0}
          totalReviews={ip?.total_reviews ?? 0}
          open={reviewsOpen}
          onClose={() => setReviewsOpen(false)}
        />
      )}
    </>
  )
}
