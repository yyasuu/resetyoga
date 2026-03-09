import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// One-time admin-only endpoint to ensure storage buckets are public
// Visit /api/admin/fix-storage to apply
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const storageClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: Record<string, string> = {}

  // Fix wellness-images bucket
  const imagesCreate = await storageClient.storage.createBucket('wellness-images', {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  })
  if (imagesCreate.error?.message?.includes('already exists') || imagesCreate.data) {
    const imagesUpdate = await storageClient.storage.updateBucket('wellness-images', { public: true })
    results['wellness-images'] = imagesUpdate.error
      ? `update error: ${imagesUpdate.error.message}`
      : 'set to public ✓'
  } else {
    results['wellness-images'] = imagesCreate.error
      ? `create error: ${imagesCreate.error.message}`
      : 'created as public ✓'
  }

  // Fix wellness-videos bucket
  const videosCreate = await storageClient.storage.createBucket('wellness-videos', {
    public: true,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  })
  if (videosCreate.error?.message?.includes('already exists') || videosCreate.data) {
    const videosUpdate = await storageClient.storage.updateBucket('wellness-videos', { public: true })
    results['wellness-videos'] = videosUpdate.error
      ? `update error: ${videosUpdate.error.message}`
      : 'set to public ✓'
  } else {
    results['wellness-videos'] = videosCreate.error
      ? `create error: ${videosCreate.error.message}`
      : 'created as public ✓'
  }

  // Verify bucket status
  const { data: buckets } = await storageClient.storage.listBuckets()
  const bucketStatus = (buckets ?? [])
    .filter(b => ['wellness-images', 'wellness-videos'].includes(b.id))
    .map(b => ({ id: b.id, public: b.public }))

  return NextResponse.json({ results, bucketStatus })
}
