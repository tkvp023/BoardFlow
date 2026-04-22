import { getSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await req.json()

  const supabase = getSupabaseClient()
  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('card_id', id)
    .eq('user_id', userId)
    .single()

  if (existing) {
    await supabase.from('votes').delete().eq('card_id', id).eq('user_id', userId)
    await supabase.rpc('decrement_votes', { card_id: id })
    return NextResponse.json({ voted: false })
  }

  await supabase.from('votes').insert({ card_id: id, user_id: userId })
  await supabase.rpc('increment_votes', { card_id: id })
  return NextResponse.json({ voted: true })
}

