import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = await createAdminClient()
  const { data: profile } = await admin
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return null
  return { user, admin }
}

// ── GET: pending sessions + payout history ────────────────────────────────────
export async function GET() {
  const auth = await verifyAdmin()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { admin } = auth

  // All confirmed bookings (will filter by past end_time in JS)
  const { data: bookings } = await admin
    .from('bookings')
    .select('id, instructor_id, is_trial, time_slots!slot_id(start_time, end_time)')
    .eq('status', 'confirmed')

  const now = new Date()
  const pastBookings = (bookings ?? []).filter((b: any) => {
    const slot = b.time_slots
    return slot && new Date(slot.end_time) < now
  })

  const instructorIds = [...new Set(pastBookings.map((b: any) => b.instructor_id as string))]

  let pending: object[] = []

  if (instructorIds.length > 0) {
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, full_name, email, avatar_url, instructor_profiles(payout_rate_usd)')
      .in('id', instructorIds)

    const { data: payoutInfos } = await admin
      .from('instructor_payout_info')
      .select('id, bank_name, bank_country, swift_code, account_number, account_holder_name, bank_branch, account_holder_kana')
      .in('id', instructorIds)

    pending = instructorIds.map(instructorId => {
      const sessions = pastBookings.filter((b: any) => b.instructor_id === instructorId)
      const profile = profiles?.find((p: any) => p.id === instructorId) as any
      const rate = (profile?.instructor_profiles as any)?.payout_rate_usd ?? null
      const payoutInfo = payoutInfos?.find((p: any) => p.id === instructorId) ?? null
      return {
        instructor_id: instructorId,
        name: profile?.full_name ?? profile?.email ?? 'Unknown',
        email: profile?.email,
        avatar_url: profile?.avatar_url,
        session_count: sessions.length,
        booking_ids: sessions.map((s: any) => s.id),
        payout_rate_usd: rate,
        suggested_amount: rate != null
          ? Math.round(rate * sessions.length * 100) / 100
          : null,
        payout_info: payoutInfo,
      }
    })
  }

  // Payout history
  const { data: history } = await admin
    .from('instructor_payouts')
    .select('id, instructor_id, session_count, amount_usd, payment_method, payment_reference, paid_at, profiles!instructor_id(full_name)')
    .order('paid_at', { ascending: false })
    .limit(100)

  return NextResponse.json({ pending, history: history ?? [] })
}

// ── POST: record a payout (marks bookings as completed) ───────────────────────
export async function POST(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { user, admin } = auth

  const body = await request.json()
  const { instructor_id, booking_ids, amount_usd, payment_method, payment_reference, notes } = body

  if (!instructor_id || !Array.isArray(booking_ids) || !booking_ids.length || !amount_usd) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Mark sessions as completed
  const { error: updateErr } = await admin
    .from('bookings')
    .update({ status: 'completed' })
    .in('id', booking_ids)
    .eq('instructor_id', instructor_id) // safety: only their own

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Record the payout
  const { error: insertErr } = await admin
    .from('instructor_payouts')
    .insert({
      instructor_id,
      booking_ids,
      session_count: booking_ids.length,
      amount_usd: parseFloat(amount_usd),
      payment_method: payment_method ?? 'bank_transfer',
      payment_reference: payment_reference || null,
      notes: notes || null,
      paid_by: user.id,
    })

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// ── PATCH: update instructor's default payout rate ────────────────────────────
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { admin } = auth

  const { instructor_id, payout_rate_usd } = await request.json()
  if (!instructor_id) return NextResponse.json({ error: 'Missing instructor_id' }, { status: 400 })

  const { error } = await admin
    .from('instructor_profiles')
    .update({ payout_rate_usd: payout_rate_usd ?? null })
    .eq('id', instructor_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
