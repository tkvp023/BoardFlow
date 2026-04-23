import { getSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_PATCH_FIELDS = ['content', 'column_type'] as const
type AllowedField = typeof ALLOWED_PATCH_FIELDS[number]

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // Only allow whitelisted fields — prevent arbitrary column overwrites
  const update: Partial<Record<AllowedField, unknown>> = {}
  for (const field of ALLOWED_PATCH_FIELDS) {
    if (field in body) update[field] = body[field]
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('cards').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

