'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Navbar } from '@/components/layout/Navbar'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Video, Clock, Star } from 'lucide-react'
import { Profile } from '@/types'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function BookingsPage() {
  const t = useTranslations('booking')
  const router = useRouter()
  const supabase = createClient()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [reviewBooking, setReviewBooking] = useState<any | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)

      const { data: b } = await supabase
        .from('bookings')
        .select('*, time_slots(*), profiles!bookings_instructor_id_fkey(*)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })

      setBookings(b || [])
    }
    load()
  }, [])

  const handleCancel = async (bookingId: string) => {
    const res = await fetch('/api/bookings/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
    if (res.ok) {
      toast.success('Booking cancelled')
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      )
    } else {
      toast.error('Failed to cancel booking')
    }
  }

  const handleReviewSubmit = async () => {
    if (!reviewBooking) return
    setReviewLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('reviews').insert({
      booking_id: reviewBooking.id,
      student_id: user.id,
      instructor_id: reviewBooking.instructor_id,
      rating,
      comment,
    })

    if (error) {
      toast.error('Failed to submit review')
    } else {
      toast.success(t('review_submitted'))
      setReviewBooking(null)
    }
    setReviewLoading(false)
  }

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.time_slots && new Date(b.time_slots.start_time) >= now && b.status === 'confirmed'
  )
  const past = bookings.filter(
    (b) => !b.time_slots || new Date(b.time_slots.start_time) < now || b.status !== 'confirmed'
  )

  const statusColor: Record<string, string> = {
    confirmed: 'text-green-600 bg-green-50',
    cancelled: 'text-red-500 bg-red-50',
    completed: 'text-gray-500 bg-gray-50',
  }

  if (!profile) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={profile} />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">{t('your_bookings')}</h1>

        {/* Upcoming */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-700 mb-4">{t('upcoming')}</h2>
          {upcoming.length > 0 ? (
            <div className="space-y-3">
              {upcoming.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                        {booking.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {t('session_with', { name: booking.profiles?.full_name || 'Instructor' })}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                          <Clock className="h-3.5 w-3.5" />
                          {booking.time_slots?.start_time
                            ? format(new Date(booking.time_slots.start_time), 'MMM d, yyyy • h:mm a')
                            : '—'}
                          {' · 45 min'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[booking.status]}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.google_meet_link && (
                        <a
                          href={booking.google_meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
                        >
                          <Video className="h-4 w-4" />
                          {t('join_meeting')}
                        </a>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleCancel(booking.id)}
                      >
                        {t('cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{t('no_bookings')}</p>
          )}
        </section>

        {/* Past */}
        <section>
          <h2 className="text-lg font-bold text-gray-700 mb-4">{t('past')}</h2>
          {past.length > 0 ? (
            <div className="space-y-3">
              {past.map((booking) => (
                <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-5 opacity-80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                        {booking.profiles?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700">
                          {booking.profiles?.full_name || 'Instructor'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {booking.time_slots?.start_time
                            ? format(new Date(booking.time_slots.start_time), 'MMM d, yyyy • h:mm a')
                            : '—'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[booking.status] || 'text-gray-500 bg-gray-50'}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      {booking.status === 'confirmed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                          onClick={() => { setRating(5); setComment(''); setReviewBooking(booking) }}
                        >
                          <Star className="h-3.5 w-3.5 mr-1" />
                          {t('leave_review')}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">{t('no_bookings')}</p>
          )}
        </section>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewBooking} onOpenChange={() => setReviewBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Rating</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} onClick={() => setRating(r)}>
                    <Star
                      className={`h-8 w-8 ${
                        r <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Comment (optional)</p>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewBooking(null)}>Cancel</Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={handleReviewSubmit}
              disabled={reviewLoading}
            >
              {reviewLoading ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
