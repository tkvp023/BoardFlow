'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card } from '@/types'
import AddCardForm from './AddCardForm'
import CardComponent from './Card'

interface Props {
  cards: Card[]
  votedCards: Set<string>
  onAddCard: (content: string, columnType: string) => void
  onVote: (cardId: string) => void
  onDelete: (cardId: string) => void
  onEdit: (cardId: string, content: string) => void
  onDragEnd: (cardId: string, newColumn: string) => void
}

const KANBAN_COLUMNS = [
  { id: 'todo', title: 'To Do', emoji: '📋', color: 'bg-slate-500/20 text-slate-400' },
  { id: 'in_progress', title: 'In Progress', emoji: '⚡', color: 'bg-blue-500/20 text-blue-400' },
  { id: 'done', title: 'Done', emoji: '🎉', color: 'bg-green-500/20 text-green-400' },
]

export default function KanbanBoard({ cards, votedCards, onAddCard, onVote, onDelete, onEdit, onDragEnd }: Props) {
  function handleDragEnd(result: DropResult) {
    if (!result.destination) return
    const cardId = result.draggableId
    const newColumn = result.destination.droppableId
    onDragEnd(cardId, newColumn)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 flex-1 overflow-auto">
        {KANBAN_COLUMNS.map((col) => (
          <div
            key={col.id}
            className="flex flex-col bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl overflow-hidden min-h-[400px]"
          >
            <div className="px-4 py-3 border-b border-[#2a2d3a] flex items-center gap-2">
              <span className="text-lg">{col.emoji}</span>
              <h3 className="text-white font-semibold text-sm flex-1">{col.title}</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${col.color}`}>
                {cards.filter((c) => c.column_type === col.id).length}
              </span>
            </div>

            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 p-3 space-y-2 overflow-y-auto scrollbar-hide transition-colors ${
                    snapshot.isDraggingOver ? 'bg-indigo-500/5' : ''
                  }`}
                >
                  {cards
                    .filter((c) => c.column_type === col.id)
                    .map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'opacity-75 rotate-1' : ''}
                          >
                            <CardComponent
                              card={card}
                              hasVoted={votedCards.has(card.id)}
                              onVote={onVote}
                              onDelete={onDelete}
                              onEdit={onEdit}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            <div className="p-3 border-t border-[#2a2d3a]">
              <AddCardForm onAdd={(content) => onAddCard(content, col.id)} />
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}

