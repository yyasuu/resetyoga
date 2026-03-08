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
 * Verify a Supabase JWT by calling the Auth REST API directly.
 *
 * We avoid using createServerClient from @supabase/ssr here because that
 * wrapper is designed for cookie-based session management and does not
 * reliably handle auth.getUser(jwt) with an explicit JWT argument.
 * The direct REST call is guaranteed to work with any valid access token.
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

/**
 * POST /api/onboarding/stripe-connect
 *
 * Creates a Stripe Connect Express account during instructor onboarding.
 * Returns { url, accountId } — the client stores accountId in localStorage
 * and redirects the user to Stripe. On return, the onboarding form reads
 * accountId from localStorage and passes it to /api/onboarding/instructor.
 *
 * Auth: requires Authorization: Bearer <access_token> header.
 * The JWT is verified via a direct call to the Supabase Auth REST API.
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!bearerToken) {
    return NextResponse.json(
      { error: 'ログインが必要です。ページを再読み込みしてください。 / Not logged in. Please reload and log in.' },
      { status: 401 }
    )
  }

  const userData = await verifyJWT(bearerToken)
  if (!userData) {
    return NextResponse.json(
      { error: 'セッションが無効です。再ログインしてください。 / Session invalid or expired. Please log in again.', needsLogin: true },
      { status: 401 }
    )
  }

  const { id: userId } = userData
  let userEmail = userData.email

  // Get email from profiles table if not in the JWT
  if (!userEmail) {
    const admin = await createAdminClient()
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
    const account = await createConnectAccount(userEmail ?? '', countryCode)
    const link = await createAccountLink(account.id, refreshUrl, returnUrl)
    return NextResponse.json({ url: link.url, accountId: account.id })
  } catch (err: any) {
    console.error('[onboarding/stripe-connect]', err)
    const msg = err?.message ?? 'Stripe error'
    return NextResponse.json(
      { error: `Stripe エラー: ${msg}` },
      { status: 500 }
    )
  }
}
