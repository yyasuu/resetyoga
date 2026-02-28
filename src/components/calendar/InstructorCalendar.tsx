'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TimeSlot } from '@/types'
import { addMinutes, format } from 'date-fns'

interface InstructorCalendarProps {
  instructorId: string
}

export function InstructorCalendar({ instructorId }: InstructorCalendarProps) {
  const t = useTranslations('instructor')
  const supabase = createClient()
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [pendingSlot, setPendingSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [confirmAddOpen, setConfirmAddOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchSlots = useCallback(async () => {
    const { data: slots } = await supabase
      .from('time_slots')
      .select('*')
      .eq('instructor_id', instructorId)
      .neq('status', 'cancelled')
      .gte('start_time', new Date().toISOString())
      .order('start_time')

    if (slots) {
      const mapped = slots.map((slot: TimeSlot) => ({
        id: slot.id,
        title: slot.status === 'booked' ? 'Booked' : 'Available',
        start: slot.start_time,
        end: slot.end_time,
        backgroundColor: slot.status === 'booked' ? '#6366f1' : '#22c55e',
        borderColor: slot.status === 'booked' ? '#4f46e5' : '#16a34a',
        textColor: 'white',
        extendedProps: { slot },
      }))
      setEvents(mapped)
    }
  }, [instructorId, supabase])

  useEffect(() => {
    fetchSlots()
  }, [fetchSlots])

  const handleDateClick = (info: any) => {
    const clickedDate = info.date
    const now = new Date()

    if (clickedDate < now) {
      toast.error('Cannot add slots in the past')
      return
    }

    const start = clickedDate
    const end = addMinutes(start, 45)
    setPendingSlot({ start, end })
    setConfirmAddOpen(true)
  }

  const handleEventClick = (info: any) => {
    const slot = info.event.extendedProps.slot as TimeSlot
    if (slot.status === 'available') {
      setSelectedSlot(slot)
      setConfirmDeleteOpen(true)
    }
  }

  const confirmAddSlot = async () => {
    if (!pendingSlot) return
    setLoading(true)

    const res = await fetch('/api/availability/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startTime: pendingSlot.start.toISOString() }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || 'Failed to add slot')
    } else {
      toast.success(t('slot_added'))
      await fetchSlots()
    }

    setConfirmAddOpen(false)
    setPendingSlot(null)
    setLoading(false)
  }

  const confirmDeleteSlot = async () => {
    if (!selectedSlot) return
    setLoading(true)

    const res = await fetch('/api/availability/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId: selectedSlot.id }),
    })
    const json = await res.json()

    if (!res.ok) {
      toast.error(json.error || 'Failed to remove slot')
    } else {
      toast.success(t('slot_deleted'))
      await fetchSlots()
    }

    setConfirmDeleteOpen(false)
    setSelectedSlot(null)
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span className="text-gray-600">Available (click to remove)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-navy-500" />
          <span className="text-gray-600">Booked by student</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dashed border-gray-300" />
          <span className="text-gray-600">Click empty time to add 45-min slot</span>
        </div>
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        slotMinTime="00:00:00"
        slotMaxTime="24:00:00"
        slotDuration="00:15:00"
        slotLabelInterval="01:00"
        height="auto"
        nowIndicator={true}
        selectable={false}
        eventContent={(eventInfo) => (
          <div className="px-1 py-0.5 overflow-hidden">
            <p className="font-semibold text-xs leading-tight">{eventInfo.event.title}</p>
            <p className="text-xs opacity-80">45 min</p>
          </div>
        )}
      />

      {/* Confirm Add Dialog */}
      <Dialog open={confirmAddOpen} onOpenChange={setConfirmAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teaching Slot</DialogTitle>
          </DialogHeader>
          {pendingSlot && (
            <div className="py-2">
              <p className="text-gray-700">
                Add a 45-minute available slot on:
              </p>
              <p className="font-bold text-gray-900 mt-2">
                {format(pendingSlot.start, 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-navy-600 font-medium">
                {format(pendingSlot.start, 'h:mm a')} – {format(pendingSlot.end, 'h:mm a')}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAddOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-navy-600 hover:bg-navy-700"
              onClick={confirmAddSlot}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm_delete')}</DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <p className="text-gray-700 py-2">
              {format(new Date(selectedSlot.start_time), 'EEEE, MMMM d, yyyy • h:mm a')} – 45 min
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Keep It
            </Button>
            <Button variant="destructive" onClick={confirmDeleteSlot} disabled={loading}>
              {loading ? 'Removing...' : 'Remove Slot'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
