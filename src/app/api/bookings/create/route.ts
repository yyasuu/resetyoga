import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createMeetEvent } from '@/lib/google-meet'
import { sendBookingConfirmationStudent, sendBookingConfirmationInstructor } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({
  slotId: z.string().uuid(),
  instructorId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slotId, instructorId } = schema.parse(body)

    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── 2. Admin bypass — skip all subscription/quota checks for testing ──────
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = callerProfile?.role === 'admin'

    let isTrial = false

    if (!isAdmin) {
      // ── 3. Subscription & session quota check ────────────────────────────────
      const { data: subscription } = await supabase
        .from('student_subscriptions')
        .select('*')
        .eq('student_id', user.id)
        .single()

      if (!subscription) {
        return NextResponse.json(
          { error: 'No subscription found', requiresSubscription: true },
          { status: 403 },
        )
      }

      isTrial = subscription.status === 'trial'
      const isActive = subscription.status === 'active'

      if (isTrial && subscription.trial_used >= subscription.trial_limit) {
        return NextResponse.json(
          { error: 'Trial sessions exhausted', requiresSubscription: true },
          { status: 403 },
        )
      }

      if (isActive && subscription.sessions_used >= subscription.sessions_limit) {
        return NextResponse.json(
          { error: 'Monthly session limit reached', requiresSubscription: true },
          { status: 403 },
        )
      }

      if (!isTrial && !isActive) {
        return NextResponse.json(
          { error: 'Subscription inactive', requiresSubscription: true },
          { status: 403 },
        )
      }

      // ── 4. Trial abuse guard: require card on file before first booking ───────
      if (isTrial && !subscription.stripe_customer_id) {
        return NextResponse.json(
          { error: 'Payment method required to start your free trial', requiresCard: true },
          { status: 402 },
        )
      }
    }

    // ── 4. Fetch slot + profiles (needed for Meet event + emails) ────────────
    const [{ data: slotInfo }, { data: instructorProfile }, { data: studentProfile }] =
      await Promise.all([
        adminSupabase
          .from('time_slots')
          .select('start_time, end_time')
          .eq('id', slotId)
          .eq('instructor_id', instructorId)
          .eq('status', 'available')
          .single(),
        supabase.from('profiles').select('*').eq('id', instructorId).single(),
        supabase.from('profiles').select('*').eq('id', user.id).single(),
      ])

    if (!slotInfo) {
      return NextResponse.json({ error: 'Slot not available' }, { status: 409 })
    }

    if (!instructorProfile || !studentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // ── 5. Student double-booking guard ──────────────────────────────────────
    //
    // Check if this student already has a confirmed booking that overlaps
    // with the requested slot's time window.
    //
    const { data: studentSlotIds } = await adminSupabase
      .from('bookings')
      .select('slot_id')
      .eq('student_id', user.id)
      .eq('status', 'confirmed')

    if (studentSlotIds && studentSlotIds.length > 0) {
      const ids = studentSlotIds.map((b) => b.slot_id)
      const { data: conflictingSlot } = await adminSupabase
        .from('time_slots')
        .select('id')
        .in('id', ids)
        .lt('start_time', slotInfo.end_time)
        .gt('end_time', slotInfo.start_time)
        .limit(1)
        .maybeSingle()

      if (conflictingSlot) {
        return NextResponse.json(
          { error: 'You already have a booking during this time. Please choose a different slot.' },
          { status: 409 }
        )
      }
    }

    // ── 6. Create Google Meet link BEFORE the atomic DB operation ─────────────
    //
    // Meet creation is the only side-effect that cannot be rolled back inside
    // Postgres.  If the RPC fails afterward (slot taken), the orphaned Calendar
    // event is harmless — no booking is created, so neither party receives a
    // link.  The slot stays available for the next attempt.
    //
    let meetLink = ''
    let calendarEventId = ''

    try {
      const result = await createMeetEvent({
        title: `YogaConnect: ${instructorProfile.full_name} & ${studentProfile.full_name}`,
        startTime: slotInfo.start_time,
        endTime: slotInfo.end_time,
        instructorEmail: instructorProfile.email,
        studentEmail: studentProfile.email,
        instructorName: instructorProfile.full_name || 'Instructor',
        studentName: studentProfile.full_name || 'Student',
      })
      meetLink = result.meetLink
      calendarEventId = result.eventId
    } catch (err) {
      console.error('Google Meet creation skipped:', err)
      // Non-fatal — booking proceeds without a Meet link
    }

    // ── 6. Atomic book_slot() RPC (SELECT FOR UPDATE inside Postgres) ─────────
    //
    // The RPC:
    //   a) Locks the slot row
    //   b) Confirms status = 'available'  (fails → error_code='slot_not_available')
    //   c) Updates slot → 'booked'
    //   d) Inserts booking with UNIQUE(slot_id) as a second safety net
    //   e) Increments trial_used or sessions_used
    //
    // All steps are in ONE transaction.  No manual rollback needed.
    //
    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc('book_slot', {
      p_slot_id: slotId,
      p_student_id: user.id,
      p_instructor_id: instructorId,
      p_is_trial: isTrial,
      p_meet_link: meetLink || null,
      p_calendar_event_id: calendarEventId || null,
    })

    if (rpcError) {
      console.error('book_slot RPC error:', rpcError)
      return NextResponse.json({ error: 'Booking failed' }, { status: 500 })
    }

    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult

    if (result?.error_code === 'slot_not_available') {
      return NextResponse.json(
        { error: 'This slot was just booked by someone else. Please choose another.' },
        { status: 409 },
      )
    }

    if (!result?.booking_id) {
      return NextResponse.json({ error: 'Booking failed unexpectedly' }, { status: 500 })
    }

    // ── 7. Confirmation emails (fire-and-forget) ──────────────────────────────
    sendBookingConfirmationStudent({
      to: studentProfile.email,
      studentName: studentProfile.full_name || 'Student',
      instructorName: instructorProfile.full_name || 'Instructor',
      startTime: slotInfo.start_time,
      meetLink: meetLink || undefined,
    }).catch((err) => console.error('[booking] student email error:', err))

    sendBookingConfirmationInstructor({
      to: instructorProfile.email,
      instructorName: instructorProfile.full_name || 'Instructor',
      studentName: studentProfile.full_name || 'Student',
      startTime: slotInfo.start_time,
      meetLink: meetLink || undefined,
    }).catch((err) => console.error('[booking] instructor email error:', err))

    return NextResponse.json({
      booking: result.booking_id,
      meetLink: meetLink || null,
      isTrial,
    })
  } catch (err) {
    console.error('Booking error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
