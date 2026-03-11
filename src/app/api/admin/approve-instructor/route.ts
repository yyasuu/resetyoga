import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendInstructorApprovalEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { instructorId } = await request.json()
  if (!instructorId || typeof instructorId !== 'string') {
    return NextResponse.json({ error: 'Missing instructorId' }, { status: 400 })
  }

  const adminSupabase = await createAdminClient()

  // Fetch instructor details from DB (never trust client-supplied name/email)
  const { data: instructorProfile } = await adminSupabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', instructorId)
    .single()

  if (!instructorProfile) {
    return NextResponse.json({ error: 'Instructor not found' }, { status: 404 })
  }

  // Guard: check current approval status to prevent double-approval
  const { data: current } = await adminSupabase
    .from('instructor_profiles')
    .select('is_approved')
    .eq('id', instructorId)
    .single()

  if (current?.is_approved) {
    return NextResponse.json({ success: true, alreadyApproved: true })
  }

  // Upsert approval so "missing instructor_profiles row" doesn't cause infinite approve loop.
  const { error: upsertError } = await adminSupabase
    .from('instructor_profiles')
    .upsert({ id: instructorId, is_approved: true }, { onConflict: 'id' })

  if (upsertError) {
    console.error('Failed to approve instructor in DB:', upsertError)
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  try {
    await sendInstructorApprovalEmail({
      to: instructorProfile.email,
      name: instructorProfile.full_name || 'Instructor',
    })
  } catch (err) {
    console.error('Failed to send approval email:', err)
  }

  return NextResponse.json({ success: true })
}
