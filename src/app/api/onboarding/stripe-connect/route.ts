import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

const COUNTRY_CODES: Record<string, string> = {
  Japan:           'JP',
  India:           'IN',
  'United States': 'US',
  Australia:       'AU',
  Canada:          'CA',
  'United Kingdom':'GB',
  Singapore:       'SG',
  Thailand:        'TH',
  Indonesia:       'ID',
  Philippines:     'PH',
  Vietnam:         'VN',
  Malaysia:        'MY',
  Germany:         'DE',
  France:          'FR',
  Spain:           'ES',
  Brazil:          'BR',
  Mexico:          'MX',
  Korea:           'KR',
}

/**
 * POST /api/onboarding/stripe-connect
 *
 * Creates a Stripe Connect account during onboarding (before instructor_profiles
 * exists). Returns { url, accountId } — the client stores accountId in
 * localStorage and redirects to Stripe. On return the onboarding form reads
 * accountId from localStorage and passes it to /api/onboarding/instructor.
 *
 * We intentionally do NOT write to instructor_payout_info here because that
 * table has a FK → instructor_profiles(id) which doesn't exist yet.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  const body = await request.json().catch(() => ({}))
  const bankCountry: string = body.bankCountry ?? 'Japan'
  const countryCode = COUNTRY_CODES[bankCountry] ?? 'JP'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl  = `${appUrl}/onboarding?role=instructor&stripe_ok=1&step=6`
  const refreshUrl = `${appUrl}/onboarding?role=instructor&stripe_reauth=1&step=5`

  try {
    const account = await createConnectAccount(profile?.email ?? '', countryCode)
    const link = await createAccountLink(account.id, refreshUrl, returnUrl)
    return NextResponse.json({ url: link.url, accountId: account.id })
  } catch (err: any) {
    console.error('[onboarding/stripe-connect]', err)
    return NextResponse.json({ error: err.message ?? 'Stripe error' }, { status: 500 })
  }
}
