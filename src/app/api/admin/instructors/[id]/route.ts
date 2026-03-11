import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
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

  const allowedProfileFields = ['full_name', 'timezone']
  const allowedIpFields = [
    'tagline', 'bio', 'yoga_styles', 'languages', 'years_experience',
    'certifications', 'career_history', 'instagram_url', 'youtube_url', 'is_approved',
  ]

  const profileUpdate: Record<string, unknown> = {}
  for (const f of allowedProfileFields) {
    if (f in body) profileUpdate[f] = body[f]
  }

  const ipUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const f of allowedIpFields) {
    if (f in body) ipUpdate[f] = body[f]
  }

  if (Object.keys(profileUpdate).length > 0) {
    const { error: pe } = await admin.from('profiles').update(profileUpdate).eq('id', id)
    if (pe) return NextResponse.json({ error: pe.message }, { status: 500 })
  }

  if (Object.keys(ipUpdate).length > 1) {
    const { error: ie } = await admin.from('instructor_profiles').update(ipUpdate).eq('id', id)
    if (ie) return NextResponse.json({ error: ie.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const admin = await createAdminClient()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', id).single()
  const { data: ip } = await admin.from('instructor_profiles').select('*').eq('id', id).single()

  return NextResponse.json({ profile, instructor_profile: ip })
}
