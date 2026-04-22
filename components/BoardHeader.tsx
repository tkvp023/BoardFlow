'use client'

import { Copy, Check, Layers, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { copyToClipboard } from '@/lib/utils'
import { BoardMode } from '@/types'

interface Props {
  roomName: string
  roomId: string
  mode: BoardMode
  onModeChange: (mode: BoardMode) => void
  userCount: number
  expiryText?: string
  canDeleteRoom?: boolean
  onDeleteRoom?: () => void
  deletingRoom?: boolean
}

export default function BoardHeader({
  roomName,
  roomId,
  mode,
  onModeChange,
  userCount,
  expiryText,
  canDeleteRoom = false,
  onDeleteRoom,
  deletingRoom = false,
}: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyToClipboard(`${window.location.origin}/board/${roomId}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="border-b border-[#2a2d3a] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-white font-semibold">{roomName}</h1>
          <p className="text-slate-500 text-xs">
            {userCount} active • BoardFlow {expiryText ? `• Expires ${expiryText}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-1">
        <button
          onClick={() => onModeChange('retro')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'retro' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Retro
        </button>
        <button
          onClick={() => onModeChange('kanban')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === 'kanban' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Kanban
        </button>
      </div>

      <div className="flex items-center gap-2">
        {canDeleteRoom && onDeleteRoom && (
          <button
            onClick={onDeleteRoom}
            disabled={deletingRoom}
            className="flex items-center gap-2 bg-[#1a1d27] border border-[#2a2d3a] hover:border-red-500 text-slate-300 hover:text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            {deletingRoom ? 'Deleting...' : 'Delete Room'}
          </button>
        )}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 bg-[#1a1d27] border border-[#2a2d3a] hover:border-indigo-500 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-medium transition-all"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </header>
  )
}

