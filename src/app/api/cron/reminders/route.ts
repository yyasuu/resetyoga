import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendSessionReminderEmail } from '@/lib/email'

// Called by Vercel Cron every minute.
// Finds confirmed bookings starting in 4–7 minutes that haven't had a reminder sent yet,
// emails both parties, and marks reminder_sent = true to prevent duplicates.
export async function GET(request: NextRequest) {
  // Verify the request comes from Vercel Cron (or local dev)
  const authHeader = request.headers.get('authorization')
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminSupabase = await createAdminClient()
  const now = new Date()
  const windowStart = new Date(now.getTime() + 4 * 60 * 1000) // now + 4 min
  const windowEnd   = new Date(now.getTime() + 7 * 60 * 1000) // now + 7 min

  // Find confirmed bookings in the 5-minute reminder window, not yet reminded
  const { data: bookings, error } = await adminSupabase
    .from('bookings')
    .select(`
      id,
      google_meet_link,
      student_id,
      instructor_id,
      time_slots ( start_time ),
      student:profiles!bookings_student_id_fkey ( full_name, email ),
      instructor:profiles!bookings_instructor_id_fkey ( full_name, email )
    `)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .gte('time_slots.start_time', windowStart.toISOString())
    .lte('time_slots.start_time', windowEnd.toISOString())

  if (error) {
    console.error('[cron/reminders] query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  let sent = 0
  for (const booking of bookings) {
    const startTime = (booking.time_slots as any)?.start_time
    const student   = booking.student as any
    const instructor = booking.instructor as any

    if (!startTime || !student?.email || !instructor?.email) continue

    const meetLink =
      booking.google_meet_link ||
      `https://meet.jit.si/reset-yoga-${booking.id}`

    // Mark as sent first (prevents duplicate sends if email takes time)
    await adminSupabase
      .from('bookings')
      .update({ reminder_sent: true })
      .eq('id', booking.id)

    // Send to both in parallel
    await Promise.allSettled([
      sendSessionReminderEmail({
        to: student.email,
        name: student.full_name || 'Student',
        otherPartyName: instructor.full_name || 'Instructor',
        startTime,
        meetLink,
        role: 'student',
      }).catch((err) => console.error('[cron/reminders] student email failed:', booking.id, err?.message)),

      sendSessionReminderEmail({
        to: instructor.email,
        name: instructor.full_name || 'Instructor',
        otherPartyName: student.full_name || 'Student',
        startTime,
        meetLink,
        role: 'instructor',
      }).catch((err) => console.error('[cron/reminders] instructor email failed:', booking.id, err?.message)),
    ])

    sent++
  }

  console.log(`[cron/reminders] sent ${sent} reminder(s)`)
  return NextResponse.json({ sent })
}
