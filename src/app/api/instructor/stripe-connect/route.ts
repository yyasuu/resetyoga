import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink, getConnectedAccount, isConnectComplete } from '@/lib/stripe'
import { NextResponse } from 'next/server'

// ── GET: return current Connect status ────────────────────────────────────────
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()
  const { data: payoutInfo } = await admin
    .from('instructor_payout_info')
    .select('stripe_account_id, stripe_onboarding_complete')
    .eq('id', user.id)
    .single()

  if (!payoutInfo?.stripe_account_id) {
    return NextResponse.json({ connected: false })
  }

  // Re-check with Stripe in case onboarding was just completed
  try {
    const account = await getConnectedAccount(payoutInfo.stripe_account_id)
    const complete = isConnectComplete(account)

    if (complete && !payoutInfo.stripe_onboarding_complete) {
      await admin
        .from('instructor_payout_info')
        .update({ stripe_onboarding_complete: true })
        .eq('id', user.id)
    }

    return NextResponse.json({
      connected: true,
      complete,
      account_id: payoutInfo.stripe_account_id,
    })
  } catch {
    return NextResponse.json({ connected: false })
  }
}

// ── POST: start or resume Connect onboarding ──────────────────────────────────
export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

  // Get existing payout info
  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const { data: payoutInfo } = await admin
    .from('instructor_payout_info')
    .select('stripe_account_id, bank_country')
    .eq('id', user.id)
    .single()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const refreshUrl = `${appUrl}/instructor/payout-setup?reauth=true`
  const returnUrl  = `${appUrl}/instructor/payout-setup?success=true`

  let accountId = payoutInfo?.stripe_account_id

  // Create account if not yet started
  if (!accountId) {
    const country = payoutInfo?.bank_country ?? 'JP'
    // Stripe uses 2-letter ISO codes; map common values
    const countryCode = COUNTRY_CODES[country] ?? country.slice(0, 2).toUpperCase()

    const account = await createConnectAccount(profile?.email ?? '', countryCode)
    accountId = account.id

    // Upsert payout info with the new account id
    await admin
      .from('instructor_payout_info')
      .upsert({ id: user.id, stripe_account_id: accountId }, { onConflict: 'id' })
  }

  const link = await createAccountLink(accountId, refreshUrl, returnUrl)
  return NextResponse.json({ url: link.url })
}

// Country name → ISO 3166-1 alpha-2 code mapping
const COUNTRY_CODES: Record<string, string> = {
  Japan:          'JP',
  India:          'IN',
  'United States':'US',
  Australia:      'AU',
  Canada:         'CA',
  'United Kingdom':'GB',
  Singapore:      'SG',
  Thailand:       'TH',
  Indonesia:      'ID',
  Philippines:    'PH',
  Vietnam:        'VN',
  Malaysia:       'MY',
  Germany:        'DE',
  France:         'FR',
  Spain:          'ES',
  Brazil:         'BR',
  Mexico:         'MX',
  Korea:          'KR',
}
