export interface Room {
  id: string
  name: string
  creator_id: string | null
  duration_days: number | null
  expires_at: string | null
  created_at: string
  feature_limited?: boolean
}

export interface Card {
  id: string
  room_id: string
  content: string
  column_type: string
  author: string
  votes: number
  card_order: number
  created_at: string
}

export type BoardMode = 'retro' | 'kanban'
