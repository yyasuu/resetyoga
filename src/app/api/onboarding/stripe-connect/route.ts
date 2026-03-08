import { createAdminClient } from '@/lib/supabase/server'
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
 *
 * Auth: accepts JWT via Authorization: Bearer <token> header (preferred) so
 * that this works even when session cookies are not properly set after OAuth
 * redirect — a known issue with the next/headers cookies() approach.
 */
export async function POST(request: NextRequest) {
  // Prefer JWT from Authorization header; fall back to cookie-based auth
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const admin = await createAdminClient()

  let userId: string | null = null
  let userEmail: string | null = null

  if (bearerToken) {
    // Verify the JWT using the admin client (service role key)
    const { data: { user }, error } = await admin.auth.getUser(bearerToken)
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    userId = user.id
    userEmail = user.email ?? null
  } else {
    // Fall back to cookie-based auth (for environments where cookies work)
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    userId = user.id
    userEmail = user.email ?? null
  }

  // Get email from profiles if not available from auth
  if (!userEmail) {
    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single()
    userEmail = profile?.email ?? ''
  }

  const body = await request.json().catch(() => ({}))
  const bankCountry: string = body.bankCountry ?? 'Japan'
  const countryCode = COUNTRY_CODES[bankCountry] ?? 'JP'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const returnUrl  = `${appUrl}/onboarding?role=instructor&stripe_ok=1&step=6`
  const refreshUrl = `${appUrl}/onboarding?role=instructor&stripe_reauth=1&step=5`

  try {
    const account = await createConnectAccount(userEmail, countryCode)
    const link = await createAccountLink(account.id, refreshUrl, returnUrl)
    return NextResponse.json({ url: link.url, accountId: account.id })
  } catch (err: any) {
    console.error('[onboarding/stripe-connect]', err)
    return NextResponse.json({ error: err.message ?? 'Stripe error' }, { status: 500 })
  }
}
