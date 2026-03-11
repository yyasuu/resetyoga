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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const admin = await createAdminClient()

  const update: Record<string, unknown> = {}
  if (typeof body.rating === 'number') {
    const rating = Math.max(1, Math.min(5, Math.round(body.rating)))
    update.rating = rating
  }
  if ('comment' in body) {
    update.comment = typeof body.comment === 'string' && body.comment.trim() ? body.comment.trim() : null
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data: updated, error: updateError } = await admin
    .from('reviews')
    .update(update)
    .eq('id', id)
    .select('id, instructor_id')
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message || 'Review not found' }, { status: 500 })
  }

  const { data: rows, error: rowsError } = await admin
    .from('reviews')
    .select('rating')
    .eq('instructor_id', updated.instructor_id)

  if (!rowsError && rows) {
    const total = rows.length
    const avg = total > 0 ? Number((rows.reduce((sum: number, r: any) => sum + Number(r.rating || 0), 0) / total).toFixed(2)) : 0
    await admin
      .from('instructor_profiles')
      .update({ rating: avg, total_reviews: total })
      .eq('id', updated.instructor_id)
  }

  return NextResponse.json({ success: true })
}
