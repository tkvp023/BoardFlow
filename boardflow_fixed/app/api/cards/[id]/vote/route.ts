import { getSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const supabase = getSupabaseClient()

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('card_id', id)
    .eq('user_id', userId)
    .single()

  if (existing) {
    const { error: delError } = await supabase
      .from('votes')
      .delete()
      .eq('card_id', id)
      .eq('user_id', userId)
    if (delError) return NextResponse.json({ error: delError.message }, { status: 500 })

    const { error: rpcError } = await supabase.rpc('decrement_votes', { card_id: id })
    if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })

    return NextResponse.json({ voted: false })
  }

  const { error: insError } = await supabase
    .from('votes')
    .insert({ card_id: id, user_id: userId })
  if (insError) return NextResponse.json({ error: insError.message }, { status: 500 })

  const { error: rpcError } = await supabase.rpc('increment_votes', { card_id: id })
  if (rpcError) return NextResponse.json({ error: rpcError.message }, { status: 500 })

  return NextResponse.json({ voted: true })
}

