'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { format } from 'date-fns'

interface Review {
  id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: { full_name: string | null } | null
}

interface ReviewsDialogProps {
  instructorId: string
  instructorName: string
  avgRating: number
  totalReviews: number
  open: boolean
  onClose: () => void
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
              : 'fill-gray-200 text-gray-300 dark:fill-navy-600 dark:text-navy-500'
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsDialog({
  instructorId,
  instructorName,
  avgRating,
  totalReviews,
  open,
  onClose,
}: ReviewsDialogProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase
      .from('reviews')
      .select('id, rating, comment, created_at, profiles!reviews_student_id_fkey(full_name)')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReviews((data as any[]) || [])
        setLoading(false)
      })
  }, [open, instructorId])

  // Rating breakdown (5★ → 1★)
  const breakdown = [5, 4, 3, 2, 1].map((n) => {
    const count = reviews.filter((r) => Math.round(r.rating) === n).length
    const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0
    return { star: n, count, pct }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto dark:bg-navy-800 dark:border-navy-700">
        <DialogHeader>
          <DialogTitle className="text-lg dark:text-gray-100">
            {instructorName} のレビュー
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center text-gray-400">
            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-navy-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 pt-2">
            {/* ── Overall rating summary (Amazon style) ── */}
            {reviews.length > 0 && (
              <div className="flex gap-6 p-5 bg-gray-50 dark:bg-navy-700/60 rounded-2xl">
                {/* Big score */}
                <div className="text-center flex-shrink-0 w-24">
                  <p className="text-5xl font-bold text-gray-900 dark:text-gray-100 leading-none mb-2">
                    {Number(avgRating).toFixed(1)}
                  </p>
                  <StarRow rating={avgRating} size="md" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
                    {totalReviews}件のレビュー
                  </p>
                </div>

                {/* Breakdown bars */}
                <div className="flex-1 space-y-2 justify-center flex flex-col">
                  {breakdown.map(({ star, count, pct }) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 dark:text-gray-400 w-2 text-right">
                        {star}
                      </span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <div className="flex-1 bg-gray-200 dark:bg-navy-600 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
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
            )}

            {/* ── Individual reviews ── */}
            {reviews.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-navy-700">
                {reviews.map((review) => {
                  const name = review.profiles?.full_name || '生徒'
                  const initial = name.charAt(0).toUpperCase()
                  return (
                    <div key={review.id} className="py-5 first:pt-0">
                      <div className="flex items-start justify-between mb-2">
                        {/* Reviewer info */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {initial}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {name}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {format(new Date(review.created_at), 'yyyy年M月d日')}
                            </p>
                          </div>
                        </div>
                        {/* Stars */}
                        <StarRow rating={review.rating} size="sm" />
                      </div>

                      {/* Comment */}
                      {review.comment ? (
                        <p className="text-sm text-gray-700 dark:text-gray-300 ml-12 leading-relaxed">
                          {review.comment}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 ml-12 italic">
                          コメントなし
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Star className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">まだレビューはありません</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
