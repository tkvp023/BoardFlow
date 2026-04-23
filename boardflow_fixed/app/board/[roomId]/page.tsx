'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase'
import { generateUserId, getUserName } from '@/lib/utils'
import { Card, Room, BoardMode } from '@/types'
import BoardHeader from '@/components/BoardHeader'
import RetroBoard from '@/components/RetroBoard'
import KanbanBoard from '@/components/KanbanBoard'
import NamePrompt from '@/components/NamePrompt'

function formatTimeRemaining(expiresAt: string | null): string {
  if (!expiresAt) return ''
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'soon'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days >= 1) return `in ${days} day${days === 1 ? '' : 's'}`
  const hours = Math.max(1, Math.floor(diff / (1000 * 60 * 60)))
  return `in ${hours} hour${hours === 1 ? '' : 's'}`
}

// Safe JSON parse — never throws, returns null on any failure
async function safeJson(res: Response): Promise<unknown> {
  try {
    const text = await res.text()
    if (!text || text.trim() === '') return null
    return JSON.parse(text)
  } catch {
    return null
  }
}

export default function BoardPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [mode, setMode] = useState<BoardMode>('retro')
  const [userName, setUserName] = useState<string>('')
  const [userId] = useState<string>(() => {
    if (typeof window !== 'undefined') return generateUserId()
    return ''
  })
  const [votedCards, setVotedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deletingRoom, setDeletingRoom] = useState(false)

  useEffect(() => {
    const name = getUserName()
    setUserName(name)
  }, [])

  useEffect(() => {
    async function loadRoom() {
      try {
        const res = await fetch(`/api/rooms/${roomId}`)
        if (!res.ok) {
          setNotFound(true)
          setLoading(false)
          return
        }
        const data = await safeJson(res)
        if (data && typeof data === 'object') {
          setRoom(data as Room)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    loadRoom()
  }, [roomId])

  const loadCards = useCallback(async () => {
    try {
      const res = await fetch(`/api/cards?roomId=${roomId}`)
      if (!res.ok) return
      const data = await safeJson(res)
      if (Array.isArray(data)) setCards(data as Card[])
    } catch {
      // silently ignore — board stays showing last good state
    }
  }, [roomId])

  useEffect(() => {
    loadCards()
  }, [loadCards])

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cards',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadCards()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, loadCards])

  async function handleAddCard(content: string, columnType: string) {
    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, content, column_type: columnType, author: userName }),
      })
    } catch {
      // realtime subscription will sync the state
    }
  }

  async function handleVote(cardId: string) {
    try {
      await fetch(`/api/cards/${cardId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      setVotedCards((prev) => {
        const next = new Set(prev)
        if (next.has(cardId)) next.delete(cardId)
        else next.add(cardId)
        return next
      })
    } catch {
      // ignore
    }
  }

  async function handleDelete(cardId: string) {
    try {
      await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
    } catch {
      // ignore
    }
  }

  async function handleEdit(cardId: string, content: string) {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
    } catch {
      // ignore
    }
  }

  async function handleDragEnd(cardId: string, newColumn: string) {
    try {
      await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column_type: newColumn }),
      })
    } catch {
      // ignore
    }
  }

  async function handleDeleteRoom() {
    if (!room || !userId) return
    const confirmed = window.confirm('Delete this room and all cards permanently?')
    if (!confirmed) return

    setDeletingRoom(true)
    try {
      const res = await fetch(`/api/rooms/${room.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: userId }),
      })
      if (!res.ok) {
        const payload = await safeJson(res) as { error?: string } | null
        window.alert(payload?.error || 'Failed to delete room')
        return
      }
      router.push('/')
    } catch {
      window.alert('Failed to delete room. Please try again.')
    } finally {
      setDeletingRoom(false)
    }
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )

  if (notFound)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400">Board not found</p>
        <button onClick={() => router.push('/')} className="text-indigo-400 hover:text-indigo-300">
          ← Back to home
        </button>
      </div>
    )

  return (
    <div className="min-h-screen flex flex-col">
      {!userName && <NamePrompt onComplete={setUserName} />}

      {room && (
        <BoardHeader
          roomName={room.name}
          roomId={roomId}
          mode={mode}
          onModeChange={setMode}
          userCount={1}
          expiryText={formatTimeRemaining(room.expires_at)}
          canDeleteRoom={Boolean(room.creator_id && userId && room.creator_id === userId)}
          onDeleteRoom={handleDeleteRoom}
          deletingRoom={deletingRoom}
        />
      )}

      {mode === 'retro' ? (
        <RetroBoard
          cards={cards}
          votedCards={votedCards}
          onAddCard={handleAddCard}
          onVote={handleVote}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ) : (
        <KanbanBoard
          cards={cards}
          votedCards={votedCards}
          onAddCard={handleAddCard}
          onVote={handleVote}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onDragEnd={handleDragEnd}
        />
      )}
    </div>
  )
}
