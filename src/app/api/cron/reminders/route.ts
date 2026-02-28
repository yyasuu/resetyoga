import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendSessionReminderEmail } from '@/lib/email'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = await createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() + 4 * 60 * 1000)
  const windowEnd   = new Date(now.getTime() + 7 * 60 * 1000)

  const { data, error } = await adminSupabase
    .from('bookings')
    .select(`
      id,
      google_meet_link,
      reminder_sent,
      time_slots ( start_time ),
      student:profiles!bookings_student_id_fkey ( full_name, email ),
      instructor:profiles!bookings_instructor_id_fkey ( full_name, email )
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)

  if (error) {
    console.error('[cron/reminders] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter by time window in JS to avoid Supabase TS type issues
  const bookings = (data ?? []).filter((b: any) => {
    const start = b.time_slots?.start_time
    if (!start) return false
    const t = new Date(start).getTime()
    return t >= windowStart.getTime() && t <= windowEnd.getTime()
  })

  if (bookings.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const booking of bookings as any[]) {
    const startTime = booking.time_slots?.start_time
    const student   = booking.student
    const instructor = booking.instructor

    if (!startTime || !student?.email || !instructor?.email) continue

    const meetLink =
      booking.google_meet_link ||
      `https://meet.jit.si/reset-yoga-${booking.id}`

    await adminSupabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id)

    await Promise.allSettled([
      sendSessionReminderEmail({
        to: student.email,
        name: student.full_name || 'Student',
        otherPartyName: instructor.full_name || 'Instructor',
        startTime,
        meetLink,
        role: 'student',
      }).catch((err) => console.error('[cron/reminders] student email failed:', err?.message)),

      sendSessionReminderEmail({
        to: instructor.email,
        name: instructor.full_name || 'Instructor',
        otherPartyName: student.full_name || 'Student',
        startTime,
        meetLink,
        role: 'instructor',
      }).catch((err) => console.error('[cron/reminders] instructor email failed:', err?.message)),
    ])

    sent++
  }

  return NextResponse.json({ sent })
}
