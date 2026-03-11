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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const admin = await createAdminClient()

  const { data, error: qError } = await admin
    .from('bookings')
    .select('id, student_id, created_at, status, profiles!bookings_student_id_fkey(full_name), reviews(id)')
    .eq('instructor_id', id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (qError) {
    return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  const candidates = (data || [])
    .filter((b: any) => {
      const existing = b.reviews
      return !existing || (Array.isArray(existing) && existing.length === 0)
    })
    .map((b: any) => ({
      booking_id: b.id,
      student_id: b.student_id,
      student_name: b.profiles?.full_name || 'Student',
      created_at: b.created_at,
    }))

  return NextResponse.json({ candidates })
}
