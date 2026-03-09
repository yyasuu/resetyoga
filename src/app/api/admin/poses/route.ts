import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }

  return { error: null, user }
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const admin = await createAdminClient()
  const { data, error: dbError } = await admin
    .from('yoga_poses')
    .select('*')
    .order('created_at', { ascending: true })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const body = await request.json()
  const admin = await createAdminClient()

  const { data, error: dbError } = await admin
    .from('yoga_poses')
    .insert({
      name_sanskrit: body.name_sanskrit,
      name_en: body.name_en,
      name_ja: body.name_ja,
      image_url: body.image_url ?? null,
      description_ja: body.description_ja ?? null,
      description_en: body.description_en ?? null,
      how_to_ja: body.how_to_ja ?? null,
      how_to_en: body.how_to_en ?? null,
      pose_family: body.pose_family ?? null,
      concerns: body.concerns ?? [],
      difficulty: body.difficulty ?? 'beginner',
      variation_number: body.variation_number ?? 1,
      access_level: body.access_level ?? 'public',
      is_published: body.is_published ?? false,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
