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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json()
  const admin = await createAdminClient()

  const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const allowedFields = [
    'name_sanskrit', 'name_en', 'name_ja', 'image_url', 'image_url_ja', 'image_url_en',
    'description_ja', 'description_en', 'how_to_ja', 'how_to_en',
    'pose_family', 'concerns', 'difficulty', 'variation_number',
    'access_level', 'is_published',
  ]
  for (const field of allowedFields) {
    if (field in body) updateData[field] = body[field]
  }

  const { data, error: dbError } = await admin
    .from('yoga_poses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const admin = await createAdminClient()

  const { error: dbError } = await admin
    .from('yoga_poses')
    .delete()
    .eq('id', id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
