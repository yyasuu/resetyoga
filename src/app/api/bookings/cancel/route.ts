import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendCancellationEmail } from '@/lib/email'
import { z } from 'zod'

const schema = z.object({ bookingId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId } = schema.parse(body)

    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // ── 1. Auth ───────────────────────────────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // ── 2. Atomic cancel_booking() RPC ────────────────────────────────────────
    //
    // The RPC handles all the logic atomically in one DB transaction:
    //   · Authorization check (caller must be student or instructor of the booking)
    //   · Status guard (already-cancelled, past-session)
    //   · 12-hour deadline:
    //       student cancels  > 12h before → slot freed + session refunded
    //       student cancels ≤ 12h before → slot freed, NO refund (late penalty)
    //       instructor cancels any time   → slot freed + student refunded always
    //
    const { data: rpcResult, error: rpcError } = await adminSupabase.rpc('cancel_booking', {
      p_booking_id: bookingId,
      p_user_id: user.id,
    })

    if (rpcError) {
      console.error('cancel_booking RPC error:', rpcError)
      return NextResponse.json({ error: 'Cancellation failed' }, { status: 500 })
    }

    const result = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult

    if (!result?.success) {
      const statusMap: Record<string, [string, number]> = {
        not_found: ['Booking not found or you are not a participant', 404],
        already_cancelled: ['Booking is already cancelled', 409],
        past_session: ['Cannot cancel a session that has already started', 422],
      }
      const [message, status] = statusMap[result?.error_code] ?? [
        'Cancellation failed',
        500,
      ]
      return NextResponse.json({ error: message, errorCode: result?.error_code }, { status })
    }

    const sessionRefunded: boolean = result.session_refunded ?? false

    // ── 3. Fetch booking details for notification emails ──────────────────────
    // (already cancelled at this point, so we use the admin client)
    const { data: booking } = await adminSupabase
      .from('bookings')
      .select(
        '*, time_slots(*), instructor:profiles!bookings_instructor_id_fkey(*), student:profiles!bookings_student_id_fkey(*)',
      )
      .eq('id', bookingId)
      .single()

    if (booking) {
      const instructorProfile = booking.instructor as any
      const studentProfile    = booking.student    as any
      const slot              = booking.time_slots  as any

      const cancelledByInstructor = booking.instructor_id === user.id

      if (studentProfile?.email && slot?.start_time) {
        sendCancellationEmail({
          to: studentProfile.email,
          name: studentProfile.full_name || 'Student',
          otherPartyName: instructorProfile?.full_name || 'Instructor',
          startTime: slot.start_time,
        }).catch(console.error)
      }

      if (instructorProfile?.email && slot?.start_time && cancelledByInstructor) {
        // Only email the instructor if THEY cancelled (avoid duplicate if student cancelled)
        sendCancellationEmail({
          to: instructorProfile.email,
          name: instructorProfile.full_name || 'Instructor',
          otherPartyName: studentProfile?.full_name || 'Student',
          startTime: slot.start_time,
        }).catch(console.error)
      }

      if (!cancelledByInstructor && instructorProfile?.email && slot?.start_time) {
        // Notify instructor that student cancelled
        sendCancellationEmail({
          to: instructorProfile.email,
          name: instructorProfile.full_name || 'Instructor',
          otherPartyName: studentProfile?.full_name || 'Student',
          startTime: slot.start_time,
        }).catch(console.error)
      }
    }

    return NextResponse.json({
      success: true,
      sessionRefunded,
      // Let the client show an appropriate message based on whether the session
      // was refunded or consumed as a late-cancel penalty.
      message: sessionRefunded
        ? 'Booking cancelled. Your session has been returned.'
        : 'Booking cancelled. Because this was within 12 hours of the session, the session could not be refunded.',
    })
  } catch (err) {
    console.error('Cancel error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
