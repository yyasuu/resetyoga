import { createClient } from '@/lib/supabase/server'
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

  const { instructorId, instructorName, instructorEmail } = await request.json()

  try {
    await sendInstructorApprovalEmail({ to: instructorEmail, name: instructorName })
  } catch (err) {
    console.error('Failed to send approval email:', err)
  }

  return NextResponse.json({ success: true })
}
