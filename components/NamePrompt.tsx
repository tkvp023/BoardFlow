'use client'

import { useState } from 'react'
import { setUserName } from '@/lib/utils'
import { User } from 'lucide-react'

interface Props {
  onComplete: (name: string) => void
}

export default function NamePrompt({ onComplete }: Props) {
  const [name, setName] = useState('')

  function handleSubmit() {
    if (!name.trim()) return
    setUserName(name.trim())
    onComplete(name.trim())
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-8 w-full max-w-sm">
        <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-white text-xl font-bold mb-1">What's your name?</h2>
        <p className="text-slate-400 text-sm mb-6">Your name will appear on cards you create</p>
        <input
          autoFocus
          type="text"
          placeholder="Enter your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors mb-3"
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Join Board
        </button>
      </div>
    </div>
  )
}

