'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

interface Props {
  onAdd: (content: string) => void
}

export default function AddCardForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')

  function handleSubmit() {
    if (!content.trim()) return
    onAdd(content.trim())
    setContent('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 text-slate-500 hover:text-slate-300 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Add card
      </button>
    )
  }

  return (
    <div className="mt-2">
      <textarea
        autoFocus
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="What's on your mind..."
        className="w-full bg-[#0f1117] border border-indigo-500 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none resize-none text-sm"
        rows={3}
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Add
        </button>
        <button
          onClick={() => {
            setOpen(false)
            setContent('')
          }}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

