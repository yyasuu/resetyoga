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

export async function GET(request: Request) {
  const auth = await requireAuthor()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const authorId = searchParams.get('author_id')

  const admin = await createAdminClient()
  let query = admin
    .from('wellness_articles')
    .select('*, profiles(full_name, role)')
    .order('created_at', { ascending: false })

  // Instructors can only see their own articles
  if (auth.role === 'instructor') {
    query = query.eq('author_id', auth.user.id)
  } else if (authorId) {
    query = query.eq('author_id', authorId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const auth = await requireAuthor()
  if (!auth) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const admin = await createAdminClient()
  const { data, error } = await admin
    .from('wellness_articles')
    .insert({ ...body, author_id: auth.user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
