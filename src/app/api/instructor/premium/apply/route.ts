import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  proposed_tier:  z.enum(['tier1', 'tier2', 'tier3', 'tier4']),
  categories:     z.array(z.string()).min(1).max(5),
  bio_premium_ja: z.string().min(20).max(1000),
  bio_premium_en: z.string().max(1000).optional().nullable(),
  specialties:    z.string().max(500).optional().nullable(),
  proposal_reason: z.string().min(20).max(1000),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'instructor') return NextResponse.json({ error: 'Instructors only' }, { status: 403 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const fields = Object.keys(parsed.error.flatten().fieldErrors).join(', ')
    return NextResponse.json({ error: `入力内容を確認してください: ${fields}` }, { status: 400 })
  }

  const admin = await createAdminClient()

  // Check for existing pending application
  const { data: existing } = await admin
    .from('premium_tier_applications')
    .select('id, status')
    .eq('instructor_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: '既に審査中の申請があります。結果をお待ちください。' }, { status: 409 })
  }

  const { error } = await admin.from('premium_tier_applications').insert({
    instructor_id:  user.id,
    ...parsed.data,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Mark instructor as pending in instructor_profiles
  await admin.from('instructor_profiles').update({ premium_status: 'pending' }).eq('id', user.id)

  return NextResponse.json({ ok: true })
}
