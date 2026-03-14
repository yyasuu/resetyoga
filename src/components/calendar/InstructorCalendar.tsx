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
import { addMinutes, addWeeks, addMonths } from 'date-fns'
import { fromZonedTime, toZonedTime, formatInTimeZone } from 'date-fns-tz'

interface InstructorCalendarProps {
  instructorId: string
  timezone?: string
}

export function InstructorCalendar({ instructorId, timezone = 'local' }: InstructorCalendarProps) {
  const t = useTranslations('instructor')
  const supabase = createClient()
  const calendarRef = useRef<FullCalendar>(null)
  const [events, setEvents] = useState<any[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [pendingSlot, setPendingSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [confirmAddOpen, setConfirmAddOpen] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [repeatType, setRepeatType] = useState<'none' | 'weekly' | 'monthly'>('none')
  const [repeatCount, setRepeatCount] = useState(4)
  const [editDate, setEditDate] = useState('')
  const [editHour, setEditHour] = useState('9')
  const [editMinute, setEditMinute] = useState('00')
  const [editAmPm, setEditAmPm] = useState<'AM' | 'PM'>('AM')
  const [clickedBase, setClickedBase] = useState<{ start: Date; end: Date } | null>(null)
  const effectiveTimezone =
    timezone === 'local' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone

  const toDateInput = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const buildStartFromInputs = () => {
    if (!editDate) return null
    const [y, m, d] = editDate.split('-').map(Number)
    if (!y || !m || !d) return null
    let h = Number(editHour)
    const mm = Number(editMinute)
    if (!Number.isFinite(h) || !Number.isFinite(mm)) return null
    if (h === 12) h = 0
    if (editAmPm === 'PM') h += 12
    const hh = String(h).padStart(2, '0')
    const wallTime = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}T${hh}:${String(mm).padStart(2, '0')}:00`
    return fromZonedTime(wallTime, effectiveTimezone)
  }

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
    const clickedDate = new Date(info.dateStr || info.date)
    clickedDate.setSeconds(0, 0)
    if (info.allDay) {
      // Month view click has no hour context, so start from a practical default.
      const isoDate = (info.dateStr || '').slice(0, 10)
      if (isoDate) {
        const fallback = fromZonedTime(`${isoDate}T09:00:00`, effectiveTimezone)
        clickedDate.setTime(fallback.getTime())
      } else {
        clickedDate.setHours(9, 0, 0, 0)
      }
    }
    const now = new Date()

    if (clickedDate < now) {
      toast.error('Cannot add slots in the past')
      return
    }

    const start = clickedDate
    const end = addMinutes(start, 45)
    setClickedBase({ start, end })
    setPendingSlot({ start, end })
    const zonedStart = toZonedTime(start, effectiveTimezone)
    setEditDate(toDateInput(zonedStart))
    const h24 = zonedStart.getHours()
    const isPm = h24 >= 12
    const h12 = h24 % 12 || 12
    setEditHour(String(h12))
    setEditMinute(String(zonedStart.getMinutes()).padStart(2, '0'))
    setEditAmPm(isPm ? 'PM' : 'AM')
    setRepeatType('none')
    setRepeatCount(4)
    setConfirmAddOpen(true)
  }

  const getOccurrenceStarts = () => {
    const baseUtc = buildStartFromInputs()
    if (!baseUtc) return []
    if (repeatType === 'none') return [baseUtc]
    const baseZoned = toZonedTime(baseUtc, effectiveTimezone)
    const count = Math.max(1, Math.min(repeatCount, 24))
    return Array.from({ length: count }, (_, i) => {
      const zoned =
        repeatType === 'weekly' ? addWeeks(baseZoned, i) : addMonths(baseZoned, i)
      return fromZonedTime(zoned, effectiveTimezone)
    })
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
    const baseStart = buildStartFromInputs()
    if (!baseStart) {
      toast.error('Please set valid date/time')
      return
    }
    if (baseStart < new Date()) {
      toast.error('Cannot add slots in the past')
      return
    }
    setLoading(true)
    const starts = getOccurrenceStarts()
    let ok = 0
    let ng = 0
    let firstError = ''

    for (const start of starts) {
      const res = await fetch('/api/availability/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: start.toISOString() }),
      })
      const json = await res.json().catch(() => null)
      if (res.ok) {
        ok += 1
      } else {
        ng += 1
        if (!firstError) firstError = json?.error || 'Failed to add slot'
      }
    }

    if (ng === 0) {
      toast.success(ok > 1 ? `${ok} slots added` : t('slot_added'))
    } else if (ok > 0) {
      toast.warning(`${ok} slots added, ${ng} failed${firstError ? ` (${firstError})` : ''}`)
    } else {
      toast.error(firstError || 'Failed to add slots')
    }
    await fetchSlots()

    setConfirmAddOpen(false)
    setPendingSlot(null)
    setClickedBase(null)
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

  const previewStart = buildStartFromInputs() ?? pendingSlot?.start ?? null
  const previewEnd = previewStart ? addMinutes(previewStart, 45) : null

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
        {timezone !== 'local' && (
          <div className="ml-auto flex items-center gap-1.5 text-xs text-navy-600 bg-navy-50 border border-navy-200 rounded-full px-3 py-1">
            🌏 {timezone}
          </div>
        )}
      </div>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        timeZone={timezone}
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
      <Dialog
        open={confirmAddOpen}
        onOpenChange={(open) => {
          setConfirmAddOpen(open)
          if (!open) {
            setPendingSlot(null)
            setClickedBase(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teaching Slot</DialogTitle>
          </DialogHeader>
          {pendingSlot && (
            <div className="py-2">
              <p className="text-gray-700">
                Add a 45-minute available slot on:
              </p>
              {previewStart && previewEnd && (
                <>
                  <p className="font-bold text-gray-900 mt-2">
                    {formatInTimeZone(previewStart, effectiveTimezone, 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-navy-600 font-medium">
                    {formatInTimeZone(previewStart, effectiveTimezone, 'h:mm a')} – {formatInTimeZone(previewEnd, effectiveTimezone, 'h:mm a')}
                  </p>
                </>
              )}

              <div className="mt-4 rounded-xl border border-gray-200 p-3 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time / 日付と時間</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500">Date</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Time</label>
                    <div className="mt-1 grid grid-cols-3 gap-2">
                      <select
                        value={editHour}
                        onChange={(e) => setEditHour(e.target.value)}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1)).map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <select
                        value={editMinute}
                        onChange={(e) => setEditMinute(e.target.value)}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        {['00', '15', '30', '45'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={editAmPm}
                        onChange={(e) => setEditAmPm((e.target.value as 'AM' | 'PM'))}
                        className="px-2 py-2 border border-gray-200 rounded-lg text-sm"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-gray-200 p-3 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Repeat / 繰り返し</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRepeatType('none')}
                    className={`px-3 py-2 rounded-lg text-sm border ${repeatType === 'none' ? 'bg-navy-600 text-white border-navy-600' : 'border-gray-200 text-gray-700 hover:border-navy-300'}`}
                  >
                    Once
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepeatType('weekly')}
                    className={`px-3 py-2 rounded-lg text-sm border ${repeatType === 'weekly' ? 'bg-navy-600 text-white border-navy-600' : 'border-gray-200 text-gray-700 hover:border-navy-300'}`}
                  >
                    Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setRepeatType('monthly')}
                    className={`px-3 py-2 rounded-lg text-sm border ${repeatType === 'monthly' ? 'bg-navy-600 text-white border-navy-600' : 'border-gray-200 text-gray-700 hover:border-navy-300'}`}
                  >
                    Monthly
                  </button>
                </div>

                {repeatType !== 'none' && (
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">How many times? / 回数</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={repeatCount}
                        onChange={(e) => setRepeatCount(Number(e.target.value))}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-md text-sm"
                      />
                      <div className="flex gap-1.5">
                        {[4, 8, 12].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setRepeatCount(n)}
                            className={`px-2 py-1 rounded-md text-xs border ${repeatCount === n ? 'bg-sage-600 text-white border-sage-600' : 'border-gray-200 text-gray-600'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {repeatType === 'none'
                    ? '1 slot will be created.'
                    : `${Math.max(1, Math.min(repeatCount, 24))} slots will be created (${repeatType}).`}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAddOpen(false)}>
              Cancel
            </Button>
            {clickedBase && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const zonedStart = toZonedTime(clickedBase.start, effectiveTimezone)
                  setEditDate(toDateInput(zonedStart))
                  const h24 = zonedStart.getHours()
                  const isPm = h24 >= 12
                  const h12 = h24 % 12 || 12
                  setEditHour(String(h12))
                  setEditMinute(String(zonedStart.getMinutes()).padStart(2, '0'))
                  setEditAmPm(isPm ? 'PM' : 'AM')
                }}
              >
                Use Clicked Time
              </Button>
            )}
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
              {formatInTimeZone(new Date(selectedSlot.start_time), effectiveTimezone, 'EEEE, MMMM d, yyyy • h:mm a')} – 45 min
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
