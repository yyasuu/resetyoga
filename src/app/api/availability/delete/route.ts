import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({ slotId: z.string().uuid() })

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { slotId } = schema.parse(body)

    // Check if any booking references this slot (even cancelled ones)
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_id', slotId)
      .limit(1)
      .maybeSingle()

    if (existingBooking) {
      // Soft-delete: mark as cancelled to avoid FK constraint violation
      const { error } = await supabase
        .from('time_slots')
        .update({ status: 'cancelled' })
        .eq('id', slotId)
        .eq('instructor_id', user.id)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // No bookings reference this slot — safe to hard delete
      const { error } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', slotId)
        .eq('instructor_id', user.id)
        .eq('status', 'available')

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
