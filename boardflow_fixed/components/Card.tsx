'use client'

import { useState } from 'react'
import { ThumbsUp, Trash2, Pencil, Check, X } from 'lucide-react'
import { Card as CardType } from '@/types'

interface Props {
  card: CardType
  onVote: (cardId: string) => void
  onDelete: (cardId: string) => void
  onEdit: (cardId: string, content: string) => void
  hasVoted: boolean
}

export default function Card({ card, onVote, onDelete, onEdit, hasVoted }: Props) {
  const [editing, setEditing] = useState(false)
  const [editContent, setEditContent] = useState(card.content)

  function handleEdit() {
    if (!editContent.trim()) return
    onEdit(card.id, editContent.trim())
    setEditing(false)
  }

  return (
    <div className="bg-[#0f1117] border border-[#2a2d3a] rounded-xl p-3 group hover:border-[#3a3d4a] transition-all">
      {editing ? (
        <div>
          <textarea
            autoFocus
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-[#1a1d27] border border-indigo-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none resize-none"
            rows={3}
          />
          <div className="flex gap-1 mt-1">
            <button onClick={handleEdit} className="text-green-400 hover:text-green-300 p-1">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setEditContent(card.content)
              }}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <p className="text-slate-200 text-sm leading-relaxed mb-3">{card.content}</p>
      )}

      <div className="flex items-center justify-between">
        <span className="text-slate-600 text-xs">{card.author}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditing(true)}
            className="text-slate-500 hover:text-slate-300 p-1 rounded transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onVote(card.id)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
              hasVoted
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            {card.votes}
          </button>
        </div>
      </div>
    </div>
  )
}

