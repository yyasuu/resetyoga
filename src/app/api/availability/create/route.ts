import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { addMinutes } from 'date-fns'
import { sendSlotCreatedEmail } from '@/lib/email'

const schema = z.object({
  startTime: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'instructor') {
      return NextResponse.json({ error: 'Only instructors can add slots' }, { status: 403 })
    }

    const body = await request.json()
    const { startTime } = schema.parse(body)

    const start = new Date(startTime)
    const end = addMinutes(start, 45)

    if (start < new Date()) {
      return NextResponse.json({ error: 'Cannot add slots in the past' }, { status: 400 })
    }

    // Check for overlapping slots (same instructor, not cancelled)
    // Overlap condition: existing.start_time < new.end AND existing.end_time > new.start
    const { data: overlap } = await supabase
      .from('time_slots')
      .select('id')
      .eq('instructor_id', user.id)
      .neq('status', 'cancelled')
      .lt('start_time', end.toISOString())
      .gt('end_time', start.toISOString())
      .limit(1)
      .maybeSingle()

    if (overlap) {
      return NextResponse.json(
        { error: 'This time overlaps with an existing slot. Please choose a different time.' },
        { status: 409 }
      )
    }

    const { data, error } = await supabase
      .from('time_slots')
      .insert({
        instructor_id: user.id,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        status: 'available',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send confirmation email to instructor (fire-and-forget)
    const { data: instructorProfile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (instructorProfile) {
      sendSlotCreatedEmail({
        to: instructorProfile.email,
        instructorName: instructorProfile.full_name || 'Instructor',
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }).catch((err) => console.error('[availability/create] slot email error:', err))
    }

    return NextResponse.json({ slot: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
