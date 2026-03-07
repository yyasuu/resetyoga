import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, action, approved_tier, note } = await request.json()
  if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = await createAdminClient()

  const { data: app } = await admin.from('premium_tier_applications').select('instructor_id, proposed_tier').eq('id', id).single()
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const finalTier = approved_tier || app.proposed_tier

  const { error } = await admin.from('premium_tier_applications').update({
    status:       action === 'approve' ? 'approved' : 'rejected',
    approved_tier: action === 'approve' ? finalTier : null,
    reviewed_by:  user.id,
    review_note:  note || null,
    reviewed_at:  new Date().toISOString(),
  }).eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // If approved, update the instructor_profiles
  if (action === 'approve') {
    await admin.from('instructor_profiles').update({
      premium_tier:   finalTier,
      premium_status: 'approved',
    }).eq('id', app.instructor_id)
  } else {
    await admin.from('instructor_profiles').update({
      premium_status: 'rejected',
    }).eq('id', app.instructor_id)
  }

  return NextResponse.json({ ok: true })
}
