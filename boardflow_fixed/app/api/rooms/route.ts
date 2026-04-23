import { getSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, creator_id, duration_days } = await req.json()
    const parsedDuration = Number(duration_days)
    const allowedDurations = new Set([1, 7, 15, 30])

    if (!name || !creator_id) {
      return NextResponse.json({ error: 'name and creator_id are required' }, { status: 400 })
    }
    if (!allowedDurations.has(parsedDuration)) {
      return NextResponse.json({ error: 'Invalid room duration. Must be 1, 7, 15, or 30 days.' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + parsedDuration * 24 * 60 * 60 * 1000).toISOString()
    const supabase = getSupabaseClient()
    const { data, error } = await supabase
      .from('rooms')
      .insert({ name, creator_id, duration_days: parsedDuration, expires_at: expiresAt })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected server error while creating room'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
