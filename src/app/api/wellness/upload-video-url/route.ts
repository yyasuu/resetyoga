import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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

  const admin = await createAdminClient()
  const { data, error } = await admin.storage
    .from('wellness-videos')
    .createSignedUploadUrl(path)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/wellness-videos/${path}`

  return NextResponse.json({ signedUrl: data.signedUrl, path, publicUrl })
}
