import { createAdminClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { NextRequest, NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder_build')
const FROM = process.env.EMAIL_FROM || 'Reset Yoga <noreply@resetyoga.app>'
const BRAND_NAVY = '#1B2B4B'
const BRAND_SAGE = '#6B8069'
const BRAND_LINEN = '#F2ECE3'

export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await createAdminClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tryresetyoga.com'

  // ── Date range: previous calendar month ───────────────────────────────────
  const now = new Date()
  const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // ── Confirmed bookings whose slot ended during the previous month ──────────
  const { data: bookings, error: bookingsErr } = await admin
    .from('bookings')
    .select('id, instructor_id, is_trial, time_slots!slot_id(start_time, end_time)')
    .eq('status', 'confirmed')

  if (bookingsErr) {
    console.error('[cron/monthly-payout] bookings query error:', bookingsErr)
    return NextResponse.json({ error: bookingsErr.message }, { status: 500 })
  }

  const lastMonthBookings = (bookings ?? []).filter((b: any) => {
    const end = b.time_slots?.end_time
    if (!end) return false
    const t = new Date(end).getTime()
    return t >= firstOfLastMonth.getTime() && t < firstOfThisMonth.getTime()
  })

  if (lastMonthBookings.length === 0) {
    return NextResponse.json({ sent: false, reason: 'No sessions completed last month' })
  }

  const instructorIds = [...new Set(lastMonthBookings.map((b: any) => b.instructor_id as string))]

  const [{ data: profiles }, { data: payoutInfos }] = await Promise.all([
    admin
      .from('profiles')
      .select('id, full_name, email, instructor_profiles(payout_rate_usd)')
      .in('id', instructorIds),
    admin
      .from('instructor_payout_info')
      .select('id, stripe_account_id, stripe_onboarding_complete, account_number, account_holder_name, bank_name')
      .in('id', instructorIds),
  ])

  // ── Build per-instructor summary ──────────────────────────────────────────
  type InstructorRow = {
    name: string
    email: string
    sessionCount: number
    rateUsd: number | null
    suggestedUsd: number | null
    hasStripe: boolean
    hasBankInfo: boolean
  }

  const rows: InstructorRow[] = instructorIds.map(instructorId => {
    const sessions = lastMonthBookings.filter((b: any) => b.instructor_id === instructorId)
    const profile = (profiles ?? []).find((p: any) => p.id === instructorId) as any
    const rate = (profile?.instructor_profiles as any)?.payout_rate_usd ?? null
    const payoutInfo = (payoutInfos ?? []).find((p: any) => p.id === instructorId) as any
    return {
      name: profile?.full_name ?? profile?.email ?? 'Unknown',
      email: profile?.email ?? '',
      sessionCount: sessions.length,
      rateUsd: rate,
      suggestedUsd: rate != null ? Math.round(rate * sessions.length * 100) / 100 : null,
      hasStripe: !!(payoutInfo?.stripe_account_id && payoutInfo?.stripe_onboarding_complete),
      hasBankInfo: !!(payoutInfo?.account_number && payoutInfo?.account_holder_name),
    }
  })

  const totalSessions = rows.reduce((s, r) => s + r.sessionCount, 0)
  const totalAmount = rows.reduce((s, r) => s + (r.suggestedUsd ?? 0), 0)

  const monthLabel = firstOfLastMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

  // ── Build HTML table rows ─────────────────────────────────────────────────
  const tableRows = rows.map(r => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 12px;">${r.name}<br/><span style="font-size:11px;color:#9ca3af;">${r.email}</span></td>
      <td style="padding:10px 12px;text-align:center;">${r.sessionCount}</td>
      <td style="padding:10px 12px;text-align:right;">${r.rateUsd != null ? `$${r.rateUsd.toFixed(2)}` : '—'}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:bold;">${r.suggestedUsd != null ? `$${r.suggestedUsd.toFixed(2)}` : '—'}</td>
      <td style="padding:10px 12px;text-align:center;">
        ${r.hasStripe
          ? '<span style="background:#d1fae5;color:#065f46;padding:2px 8px;border-radius:12px;font-size:12px;">Stripe ✓</span>'
          : r.hasBankInfo
            ? '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:12px;font-size:12px;">Bank</span>'
            : '<span style="background:#fee2e2;color:#991b1b;padding:2px 8px;border-radius:12px;font-size:12px;">None</span>'}
      </td>
    </tr>
  `).join('')

  // ── Send email to admin ───────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_FROM || 'admin@tryresetyoga.com'
  const recipientEmail = adminEmail.includes('<')
    ? (adminEmail.match(/<(.+)>/)?.[1] ?? adminEmail)
    : adminEmail

  await resend.emails.send({
    from: FROM,
    to: recipientEmail,
    subject: `[Reset Yoga] Monthly Payout Summary — ${monthLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:700px;margin:0 auto;background:${BRAND_LINEN};padding:24px;border-radius:12px;">
        <h2 style="color:${BRAND_NAVY};margin-top:0;">Monthly Payout Summary</h2>
        <p style="color:#374151;">Here is the payout summary for <strong>${monthLabel}</strong>. Please review and process payments via the Admin Dashboard.</p>

        <div style="display:flex;gap:16px;margin:20px 0;">
          <div style="background:#fff;padding:16px 20px;border-radius:8px;border-left:4px solid ${BRAND_NAVY};flex:1;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Total Sessions</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:${BRAND_NAVY};">${totalSessions}</p>
          </div>
          <div style="background:#fff;padding:16px 20px;border-radius:8px;border-left:4px solid ${BRAND_SAGE};flex:1;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Suggested Total</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:${BRAND_SAGE};">$${totalAmount.toFixed(2)}</p>
          </div>
          <div style="background:#fff;padding:16px 20px;border-radius:8px;border-left:4px solid #f59e0b;flex:1;">
            <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em;">Instructors</p>
            <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#d97706;">${rows.length}</p>
          </div>
        </div>

        <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;margin-top:8px;">
          <thead>
            <tr style="background:${BRAND_NAVY};color:white;">
              <th style="padding:10px 12px;text-align:left;font-size:13px;">Instructor</th>
              <th style="padding:10px 12px;text-align:center;font-size:13px;">Sessions</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;">Rate/Session</th>
              <th style="padding:10px 12px;text-align:right;font-size:13px;">Suggested</th>
              <th style="padding:10px 12px;text-align:center;font-size:13px;">Payout Method</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
          <tfoot>
            <tr style="background:#f9fafb;font-weight:bold;">
              <td style="padding:10px 12px;">Total</td>
              <td style="padding:10px 12px;text-align:center;">${totalSessions}</td>
              <td style="padding:10px 12px;"></td>
              <td style="padding:10px 12px;text-align:right;">$${totalAmount.toFixed(2)}</td>
              <td style="padding:10px 12px;"></td>
            </tr>
          </tfoot>
        </table>

        <div style="text-align:center;margin-top:24px;">
          <a href="${appUrl}/admin/payouts"
             style="display:inline-block;background:${BRAND_NAVY};color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:15px;">
            Open Payout Dashboard →
          </a>
        </div>

        <p style="margin-top:24px;font-size:12px;color:#9ca3af;">
          This is an automated summary. Sessions with rate not set are marked —. Instructors without Stripe or bank info are marked None — ask them to complete setup before sending payment.
        </p>
        <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
        <p style="color:#9ca3af;font-size:12px;">Reset Yoga Admin — ${appUrl}</p>
      </div>
    `,
  })

  return NextResponse.json({
    sent: true,
    month: monthLabel,
    instructors: rows.length,
    totalSessions,
    totalAmount,
  })
}
