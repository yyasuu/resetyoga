import { createAdminClient, createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { error: null }
}

const recalcInstructorRating = async (admin: any, instructorId: string) => {
  const { data: rows, error } = await admin
    .from('reviews')
    .select('rating')
    .eq('instructor_id', instructorId)
  if (error || !rows) return

  const total = rows.length
  const avg =
    total > 0
      ? Number((rows.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / total).toFixed(2))
      : 0

  await admin
    .from('instructor_profiles')
    .update({ rating: avg, total_reviews: total })
    .eq('id', instructorId)
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const instructorId = typeof body.instructor_id === 'string' ? body.instructor_id : ''
  const studentId = typeof body.student_id === 'string' ? body.student_id : ''
  const bookingId = typeof body.booking_id === 'string' ? body.booking_id : ''
  const rating = Math.max(1, Math.min(5, Math.round(Number(body.rating || 0))))
  const comment = typeof body.comment === 'string' && body.comment.trim() ? body.comment.trim() : null

  if (!instructorId || !studentId || !bookingId || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = await createAdminClient()

  const { data: booking, error: bookingError } = await admin
    .from('bookings')
    .select('id, instructor_id, student_id, status')
    .eq('id', bookingId)
    .maybeSingle()

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message || 'Booking not found' }, { status: 400 })
  }
  if (booking.instructor_id !== instructorId || booking.student_id !== studentId) {
    return NextResponse.json({ error: 'Booking does not match instructor/student' }, { status: 400 })
  }
  if (booking.status !== 'completed') {
    return NextResponse.json({ error: 'Only completed bookings can be reviewed' }, { status: 400 })
  }

  const { data: existing } = await admin
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .maybeSingle()
  if (existing) {
    return NextResponse.json({ error: 'Review already exists for this booking' }, { status: 400 })
  }

  const { error: insertError } = await admin.from('reviews').insert({
    booking_id: bookingId,
    student_id: studentId,
    instructor_id: instructorId,
    rating,
    comment,
  })
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  await recalcInstructorRating(admin, instructorId)
  return NextResponse.json({ success: true })
}
