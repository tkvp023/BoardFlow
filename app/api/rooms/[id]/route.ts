import { getSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.from('rooms').select('*').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  if (data.expires_at && new Date(data.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Room has expired' }, { status: 404 })
  }
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { creatorId } = await req.json()
  if (!creatorId) return NextResponse.json({ error: 'creatorId is required' }, { status: 400 })

  const supabase = getSupabaseClient()
  const { data: room, error: roomError } = await supabase.from('rooms').select('*').eq('id', id).single()
  if (roomError || !room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  if (room.creator_id !== creatorId) {
    return NextResponse.json({ error: 'Only the room creator can delete this room' }, { status: 403 })
  }

  const { error } = await supabase.from('rooms').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

