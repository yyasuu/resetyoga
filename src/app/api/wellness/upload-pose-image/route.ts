import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // Auth check with SSR client
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'instructor'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type. Use JPG, PNG, WebP or GIF.' }, { status: 400 })
  }

  const timestamp = Date.now()
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileName = `poses/${user.id}/${timestamp}_${filename}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Use standard supabase-js client (not SSR) for storage — SSR client doesn't support uploads
  const storageClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await storageClient.storage
    .from('wellness-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = storageClient.storage
    .from('wellness-images')
    .getPublicUrl(fileName)

  return NextResponse.json({ url: publicUrl })
}
