import { createAdminClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink, getConnectedAccount, isConnectComplete } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Verify a Supabase JWT by calling the Auth REST API directly.
 * More reliable than createServerClient.auth.getUser(jwt) for explicit JWTs.
 */
async function verifyJWT(token: string): Promise<{ id: string; email: string | null } | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data?.id ? { id: data.id, email: data.email ?? null } : null
  } catch {
    return null
  }
}

async function resolveUser(request: NextRequest): Promise<{ id: string; email: string | null } | null> {
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (bearerToken) {
    return verifyJWT(bearerToken)
  }

  // Cookie-based fallback for environments where cookies work
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user ? { id: user.id, email: user.email ?? null } : null
  } catch {
    return null
  }
}

// ── GET: return current Connect status ────────────────────────────────────────
export async function GET(request: NextRequest) {
  const user = await resolveUser(request)
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
export async function POST(request: NextRequest) {
  const user = await resolveUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await createAdminClient()

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

  if (!accountId) {
    const country = payoutInfo?.bank_country ?? 'JP'
    const countryCode = COUNTRY_CODES[country] ?? country.slice(0, 2).toUpperCase()
    const account = await createConnectAccount(profile?.email ?? user.email ?? '', countryCode)
    accountId = account.id
    await admin
      .from('instructor_payout_info')
      .upsert({ id: user.id, stripe_account_id: accountId }, { onConflict: 'id' })
  }

  const link = await createAccountLink(accountId, refreshUrl, returnUrl)
  return NextResponse.json({ url: link.url })
}

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
