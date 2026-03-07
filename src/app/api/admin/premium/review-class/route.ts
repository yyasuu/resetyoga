import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id, action, note } = await request.json()
  if (!id || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const admin = await createAdminClient()

  const updates: Record<string, unknown> = {
    status:     action === 'approve' ? 'approved' : 'rejected',
    approved_by: user.id,
    approved_at: new Date().toISOString(),
  }

  if (action === 'approve') {
    updates.is_published = true
    const { data: cls } = await admin.from('premium_classes').select('proposed_price_jpy').eq('id', id).single()
    if (cls) updates.approved_price_jpy = cls.proposed_price_jpy
  } else {
    updates.rejection_reason = note || null
  }

  const { error } = await admin.from('premium_classes').update(updates).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
