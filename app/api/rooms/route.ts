import { getSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { name, creator_id, duration_days } = await req.json()
  const parsedDuration = Number(duration_days)
  const allowedDurations = new Set([1, 7, 15, 30])
  if (!name || !creator_id) {
    return NextResponse.json({ error: 'name and creator_id are required' }, { status: 400 })
  }
  if (!allowedDurations.has(parsedDuration)) {
    return NextResponse.json({ error: 'Invalid room duration' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000).toISOString()
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('rooms')
    .insert({ name, creator_id, duration_days: parsedDuration, expires_at: expiresAt })
    .select()
    .single()

  if (error) {
    const missingColumn =
      error.message.includes('creator_id') ||
      error.message.includes('duration_days') ||
      error.message.includes('expires_at')
    if (!missingColumn) return NextResponse.json({ error: error.message }, { status: 500 })

    const fallback = await supabase.from('rooms').insert({ name }).select().single()
    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 })
    return NextResponse.json({
      ...fallback.data,
      creator_id: null,
      duration_days: null,
      expires_at: null,
      feature_limited: true,
    })
  }

  return NextResponse.json(data)
}

