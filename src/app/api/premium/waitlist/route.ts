import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email:   z.string().email(),
  name:    z.string().max(100).optional().nullable(),
  concern: z.string().max(100).optional().nullable(),
  locale:  z.string().max(10).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

    const { email, name, concern, locale } = parsed.data
    const admin = await createAdminClient()

    const { error } = await admin.from('premium_waitlist').insert({ email, name, concern, locale: locale ?? 'ja' })

    if (error) {
      if (error.code === '23505') {
        // Already registered — treat as success
        return NextResponse.json({ ok: true, already: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
