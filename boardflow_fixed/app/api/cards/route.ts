import { getSupabaseClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const roomId = searchParams.get('roomId')
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 })

  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('room_id', roomId)
    .order('card_order', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { room_id, content, column_type, author } = await req.json()
  const supabase = getSupabaseClient()
  const cardOrder = Math.floor(Date.now() / 1000)
  const { data, error } = await supabase
    .from('cards')
    .insert({ room_id, content, column_type, author, votes: 0, card_order: cardOrder })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

