'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, ArrowRight, Hash } from 'lucide-react'
import { generateUserId } from '@/lib/utils'

const DURATION_OPTIONS = [
  { label: '1 day', value: 1 },
  { label: '7 days', value: 7 },
  { label: '15 days', value: 15 },
  { label: '30 days', value: 30 },
]

export default function HomePage() {
  const router = useRouter()
  const [boardName, setBoardName] = useState('')
  const [durationDays, setDurationDays] = useState<number>(7)
  const [joinId, setJoinId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function createBoard() {
    if (!boardName.trim()) return setError('Please enter a board name')
    setLoading(true)
    try {
      const creatorId = generateUserId()
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: boardName.trim(), creator_id: creatorId, duration_days: durationDays }),
      })
      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload?.error || 'Failed to create board')
      }
      const data = await res.json()
      router.push(`/board/${data.id}`)
    } catch {
      setError('Failed to create board. Try again.')
      setLoading(false)
    }
  }

  function joinBoard() {
    if (!joinId.trim()) return setError('Please enter a board ID or URL')
    const id = joinId.includes('/') ? joinId.split('/').pop() : joinId.trim()
    router.push(`/board/${id}`)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">BoardFlow</h1>
      </div>
      <p className="text-slate-400 mb-12 text-center">Where teams reflect and ship</p>

      <div className="w-full max-w-md space-y-4">
        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Create a new board</h2>
          <input
            type="text"
            placeholder="Sprint 42 Retro, Q1 Planning..."
            value={boardName}
            onChange={(e) => {
              setBoardName(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && createBoard()}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors mb-3"
          />
          <select
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors mb-3"
          >
            {DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                Auto delete after {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={createBoard}
            disabled={loading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? 'Creating...' : 'Create Board'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#2a2d3a]" />
          <span className="text-slate-500 text-sm">or</span>
          <div className="flex-1 h-px bg-[#2a2d3a]" />
        </div>

        <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4">Join an existing board</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Paste board ID or URL"
                value={joinId}
                onChange={(e) => {
                  setJoinId(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && joinBoard()}
                className="w-full bg-[#0f1117] border border-[#2a2d3a] rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button
              onClick={joinBoard}
              className="bg-[#2a2d3a] hover:bg-[#3a3d4a] text-white font-medium px-5 rounded-xl transition-colors"
            >
              Join
            </button>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </div>

      <p className="mt-12 text-slate-600 text-sm">
        No account needed · Free forever · Real-time collaboration
      </p>
    </main>
  )
}
