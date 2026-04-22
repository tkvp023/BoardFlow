export interface Room {
  id: string
  name: string
  created_at: string
  creator_id: string | null
  expires_at: string | null
  duration_days: number | null
}

export interface Card {
  id: string
  room_id: string
  content: string
  column_type:
    | 'went_well'
    | 'didnt_go_well'
    | 'action_items'
    | 'todo'
    | 'in_progress'
    | 'done'
  author: string
  votes: number
  card_order: number
  created_at: string
}

export type BoardMode = 'retro' | 'kanban'

export type RetroColumn = 'went_well' | 'didnt_go_well' | 'action_items'
export type KanbanColumn = 'todo' | 'in_progress' | 'done'

