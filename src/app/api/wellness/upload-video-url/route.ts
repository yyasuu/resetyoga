import { createClient, createAdminClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const BUCKET = 'wellness-videos'

async function ensureBucketPublic(storageClient: ReturnType<typeof createSupabaseClient>) {
  await storageClient.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 500 * 1024 * 1024,
    allowedMimeTypes: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'],
  }).catch(() => {})

  await storageClient.storage.updateBucket(BUCKET, { public: true }).catch(() => {})
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const filename = searchParams.get('filename')
  if (!filename) return NextResponse.json({ error: 'filename required' }, { status: 400 })

  const ext = filename.split('.').pop()?.toLowerCase() || 'mp4'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const storageClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Ensure bucket exists and is public
  await ensureBucketPublic(storageClient)

  const admin = await createAdminClient()
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
