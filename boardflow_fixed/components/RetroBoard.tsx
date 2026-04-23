'use client'

import Column from './Column'
import { Card } from '@/types'

interface Props {
  cards: Card[]
  votedCards: Set<string>
  onAddCard: (content: string, columnType: string) => void
  onVote: (cardId: string) => void
  onDelete: (cardId: string) => void
  onEdit: (cardId: string, content: string) => void
}

const RETRO_COLUMNS = [
  { id: 'went_well', title: 'Went Well', emoji: '✅', color: 'bg-green-500/20 text-green-400' },
  { id: 'didnt_go_well', title: "Didn't Go Well", emoji: '❌', color: 'bg-red-500/20 text-red-400' },
  { id: 'action_items', title: 'Action Items', emoji: '💡', color: 'bg-yellow-500/20 text-yellow-400' },
]

export default function RetroBoard({ cards, votedCards, onAddCard, onVote, onDelete, onEdit }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 flex-1 overflow-auto">
      {RETRO_COLUMNS.map((col) => (
        <Column
          key={col.id}
          title={col.title}
          emoji={col.emoji}
          color={col.color}
          cards={cards.filter((c) => c.column_type === col.id)}
          votedCards={votedCards}
          onAddCard={(content) => onAddCard(content, col.id)}
          onVote={onVote}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

