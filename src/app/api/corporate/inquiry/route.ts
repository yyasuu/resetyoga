import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendCorporateInquiryAdmin, sendCorporateInquiryConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, company, team_size, plan, message } = body

  if (!name || !email || !company || !team_size) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const admin = await createAdminClient()
  const { error } = await admin.from('corporate_inquiries').insert({
    name, email, company, team_size, plan: plan || null, message: message || null,
  })

  if (error) {
    console.error('corporate_inquiries insert error:', error)
    return NextResponse.json({ error: 'Failed to save inquiry' }, { status: 500 })
  }

  await Promise.all([
    sendCorporateInquiryAdmin({ name, email, company, teamSize: team_size, plan, message }),
    sendCorporateInquiryConfirmation({ to: email, name }),
  ])

  return NextResponse.json({ success: true })
}
