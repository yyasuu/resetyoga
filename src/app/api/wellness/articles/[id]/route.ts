import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAuthor() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'instructor'].includes(profile.role)) return null
  return { user, role: profile.role as string }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthor()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const admin = await createAdminClient()

  // Instructors can only update their own articles
  if (auth.role === 'instructor') {
    const { data: article } = await admin
      .from('wellness_articles')
      .select('author_id')
      .eq('id', id)
      .single()
    if (article?.author_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  // Explicitly whitelist fields; include is_premium only when present
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
    title_ja:       body.title_ja,
    title_en:       body.title_en,
    subtitle_ja:    body.subtitle_ja,
    subtitle_en:    body.subtitle_en,
    content_ja:     body.content_ja,
    content_en:     body.content_en,
    category:       body.category,
    cover_image_url: body.cover_image_url,
    image_urls:     body.image_urls,
    concerns:       body.concerns,
    movement_type:  body.movement_type,
    difficulty_level: body.difficulty_level,
    is_published:   body.is_published,
  }
  if (body.is_premium !== undefined) payload.is_premium = body.is_premium

  const { error } = await admin
    .from('wellness_articles')
    .update(payload)
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthor()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const admin = await createAdminClient()

  // Instructors can only delete their own articles
  if (auth.role === 'instructor') {
    const { data: article } = await admin
      .from('wellness_articles')
      .select('author_id')
      .eq('id', id)
      .single()
    if (article?.author_id !== auth.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const { error } = await admin.from('wellness_articles').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
