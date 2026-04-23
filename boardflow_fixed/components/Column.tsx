'use client'

import { Card as CardType } from '@/types'
import Card from './Card'
import AddCardForm from './AddCardForm'

interface Props {
  title: string
  emoji: string
  color: string
  cards: CardType[]
  votedCards: Set<string>
  onAddCard: (content: string) => void
  onVote: (cardId: string) => void
  onDelete: (cardId: string) => void
  onEdit: (cardId: string, content: string) => void
}

export default function Column({ title, emoji, color, cards, votedCards, onAddCard, onVote, onDelete, onEdit }: Props) {
  const sorted = [...cards].sort((a, b) => b.votes - a.votes)

  return (
    <div className="flex flex-col bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden min-h-[400px]">
      <div className="px-4 py-3 border-b border-[#2a2d3a] flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h3 className="text-white font-semibold text-sm flex-1">{title}</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{cards.length}</span>
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hide">
        {sorted.map((card) => (
          <Card
            key={card.id}
            card={card}
            hasVoted={votedCards.has(card.id)}
            onVote={onVote}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </div>

      <div className="p-3 border-t border-[#2a2d3a]">
        <AddCardForm onAdd={onAddCard} />
      </div>
    </div>
  )
}

