'use client'

import { useEffect, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import luxonPlugin from '@fullcalendar/luxon3'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TimeSlot, StudentSubscription } from '@/types'
import { format } from 'date-fns'
import { Video, AlertCircle } from 'lucide-react'

interface StudentBookingCalendarProps {
  instructorId: string
  instructorName: string
  studentTimezone?: string
}

export function StudentBookingCalendar({
  instructorId,
  instructorName,
  studentTimezone = 'Asia/Tokyo',
}: StudentBookingCalendarProps) {
  const t = useTranslations('instructors')
  const tBook = useTranslations('booking')
  const supabase = createClient()
  const router = useRouter()

  const [events, setEvents] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<StudentSubscription | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [bookedSlotId, setBookedSlotId] = useState<string | null>(null)
  const [meetLink, setMeetLink] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const hasCard = !!(subscription?.stripe_customer_id)

  const canBook =
    subscription &&
    hasCard && // card must be on file for trial users
    ((subscription.status === 'trial' && subscription.trial_used < subscription.trial_limit) ||
      (subscription.status === 'active' &&
        subscription.sessions_used < subscription.sessions_limit))

  const fetchSlots = useCallback(async () => {
    const { data: slots } = await supabase
      .from('time_slots')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('status', 'available')
      .gte('start_time', new Date().toISOString())
      .order('start_time')

    if (slots) {
      const mapped = slots.map((slot: TimeSlot) => ({
        id: slot.id,
        title: t('available_slot'),
        start: slot.start_time,
        end: slot.end_time,
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        textColor: 'white',
        extendedProps: { slot },
      }))
      setEvents(mapped)
    }
  }, [instructorId, supabase, t])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: sub } = await supabase
          .from('student_subscriptions')
          .select('*')
          .eq('student_id', user.id)
          .single()
        setSubscription(sub)
      }
    }
    init()
    fetchSlots()
  }, [fetchSlots, supabase])

  const handleEventClick = (info: any) => {
    if (!userId) {
      toast.error('Please log in to book a session')
      router.push('/login')
      return
    }
    const slot = info.event.extendedProps.slot as TimeSlot
    setSelectedSlot(slot)
    setConfirmOpen(true)
  }

  const handleBook = async () => {
    if (!selectedSlot || !userId) return
    setLoading(true)

    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: selectedSlot.id,
        instructorId,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.requiresCard) {
        // Trial user has not yet registered a payment method → send to setup page
        toast.error('A payment method is required to book your first session.')
        router.push('/subscription?add_card=true')
      } else if (data.requiresSubscription) {
        toast.error(t('requires_subscription'))
        router.push('/subscription')
      } else if (response.status === 409) {
        toast.error(data.error || 'This slot is no longer available. Please choose another time.')
        await fetchSlots()
      } else {
        toast.error(data.error || t('booking_failed'))
      }
      setConfirmOpen(false)
      setLoading(false)
      return
    }

    setMeetLink(data.meetLink)
    setBookedSlotId(selectedSlot.id)
    setConfirmOpen(false)
    setSuccessOpen(true)
    await fetchSlots()

    // Refresh subscription
    const { data: sub } = await supabase
      .from('student_subscriptions')
      .select('*')
      .eq('student_id', userId)
      .single()
    setSubscription(sub)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Card required: trial user without payment method on file */}
      {subscription?.status === 'trial' && !hasCard && userId && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 sm:mt-0.5" />
          <div className="min-w-0 space-y-3">
            <p className="font-semibold leading-snug text-amber-950 dark:text-amber-200">
              Register a card to book your free sessions
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              A payment method is required to activate your trial. You will not be charged.
            </p>
            <Button
              variant="navy"
              size="sm"
              className="h-auto min-h-10 w-full whitespace-normal px-4 py-2.5 text-center leading-snug sm:w-auto"
              onClick={() => router.push('/subscription?add_card=true')}
            >
              Register Payment Method
            </Button>
          </div>
        </div>
      )}

      {/* No sessions left: quota exhausted */}
      {!canBook && userId && !(subscription?.status === 'trial' && !hasCard) && (
        <div className="flex flex-col gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-700 dark:bg-orange-900/20 sm:flex-row sm:items-start sm:gap-4 sm:p-5">
          <AlertCircle className="h-5 w-5 text-orange-500 dark:text-orange-400 flex-shrink-0 sm:mt-0.5" />
          <div className="min-w-0 space-y-3">
            <p className="font-semibold text-orange-900 dark:text-orange-200">{t('requires_subscription')}</p>
            <Button
              variant="navy"
              size="sm"
              className="h-auto min-h-10 w-full whitespace-normal px-4 py-2.5 text-center leading-snug sm:w-auto"
              onClick={() => router.push('/subscription')}
            >
              Subscribe for $19.99/month
            </Button>
          </div>
        </div>
      )}

      {!userId && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-blue-800 font-medium">
            Please{' '}
            <a href="/login" className="underline font-bold">
              log in
            </a>{' '}
            or{' '}
            <a href="/register" className="underline font-bold">
              sign up
            </a>{' '}
            to book a session.
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-navy-800 rounded-xl border border-gray-200 dark:border-navy-700 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-navy-200 flex-wrap">
          <div className="w-4 h-4 rounded bg-green-500 flex-shrink-0" />
          <span>Available 45-min slot — click to book</span>
          {studentTimezone !== 'local' && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-navy-600 bg-navy-50 border border-navy-200 rounded-full px-3 py-1">
              🌏 {studentTimezone}
            </span>
          )}
        </div>

        <div className="booking-fc">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, luxonPlugin]}
            initialView="timeGridWeek"
            timeZone={studentTimezone}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek',
            }}
            events={events}
            eventClick={handleEventClick}
            slotMinTime="00:00:00"
            slotMaxTime="24:00:00"
            slotDuration="00:15:00"
            height="auto"
            nowIndicator={true}
            eventContent={(eventInfo) => (
              <div className="px-1 py-0.5 overflow-hidden cursor-pointer">
                <p className="font-semibold text-xs">{eventInfo.event.title}</p>
                <p className="text-xs opacity-80">45 min</p>
              </div>
            )}
          />
        </div>
      </div>

      {/* Confirm Booking Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm_booking')}</DialogTitle>
            <DialogDescription>
              Book a 45-minute session with {instructorName}
            </DialogDescription>
          </DialogHeader>
          {selectedSlot && (
            <div className="py-2 space-y-2">
              <p className="font-bold text-gray-900">
                {format(new Date(selectedSlot.start_time), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-navy-600 font-medium text-lg">
                {format(new Date(selectedSlot.start_time), 'h:mm a')} –{' '}
                {format(new Date(selectedSlot.end_time), 'h:mm a')}
              </p>
              <p className="text-gray-500 text-sm">Duration: 45 minutes · Video Session</p>
              {subscription?.status === 'trial' && (
                <p className="text-blue-600 text-sm font-medium">
                  This will use 1 of your{' '}
                  {subscription.trial_limit - subscription.trial_used} remaining free trial
                  sessions.
                </p>
              )}
              {subscription?.status === 'active' && (
                <p className="text-green-600 text-sm font-medium">
                  This will use 1 of your{' '}
                  {subscription.sessions_limit - subscription.sessions_used} remaining sessions this
                  month.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-navy-600 hover:bg-navy-700"
              onClick={handleBook}
              disabled={loading}
            >
              {loading ? 'Booking...' : t('confirm_booking')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-green-600">Booking Confirmed!</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-700">{t('booking_confirmed')}</p>
            {meetLink && (
              <a
                href={meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-navy-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-navy-700 transition w-fit"
              >
                <Video className="h-5 w-5" />
                {tBook('join_meeting')}
              </a>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => { setSuccessOpen(false); router.push('/bookings') }}>
              View My Bookings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
