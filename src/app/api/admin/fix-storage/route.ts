import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sc = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  ) as any

  const results: Record<string, string> = {}

  for (const [bucket, opts] of [
    ['wellness-images', { public: true, fileSizeLimit: 5 * 1024 * 1024 }],
    ['wellness-videos', { public: true, fileSizeLimit: 500 * 1024 * 1024 }],
  ] as const) {
    await sc.storage.createBucket(bucket, opts).catch(() => {})
    const { error } = await sc.storage.updateBucket(bucket, { public: true })
    results[bucket] = error ? `error: ${error.message}` : 'public ✓'
  }

  const { data: buckets } = await sc.storage.listBuckets()
  const status = (buckets ?? [])
    .filter((b: { id: string }) => b.id.startsWith('wellness'))
    .map((b: { id: string; public: boolean }) => ({ id: b.id, public: b.public }))

  return NextResponse.json({ results, status })
}
