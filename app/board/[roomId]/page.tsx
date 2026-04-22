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

export default function BoardPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const router = useRouter()

  const [room, setRoom] = useState<Room | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [mode, setMode] = useState<BoardMode>('retro')
  const [userName, setUserName] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [votedCards, setVotedCards] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [deletingRoom, setDeletingRoom] = useState(false)

  useEffect(() => {
    const id = generateUserId()
    const name = getUserName()
    setUserId(id)
    setUserName(name)
  }, [])

  useEffect(() => {
    async function loadRoom() {
      const res = await fetch(`/api/rooms/${roomId}`)
      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const data = await res.json()
      setRoom(data)
      setLoading(false)
    }
    loadRoom()
  }, [roomId])

  const loadCards = useCallback(async () => {
    const res = await fetch(`/api/cards?roomId=${roomId}`)
    const data = await res.json()
    setCards(data)
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
    await fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_id: roomId, content, column_type: columnType, author: userName }),
    })
  }

  async function handleVote(cardId: string) {
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
  }

  async function handleDelete(cardId: string) {
    await fetch(`/api/cards/${cardId}`, { method: 'DELETE' })
  }

  async function handleEdit(cardId: string, content: string) {
    await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
  }

  async function handleDragEnd(cardId: string, newColumn: string) {
    await fetch(`/api/cards/${cardId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ column_type: newColumn }),
    })
  }

  async function handleDeleteRoom() {
    if (!room || !userId) return
    const confirmed = window.confirm('Delete this room and all cards permanently?')
    if (!confirmed) return

    setDeletingRoom(true)
    const res = await fetch(`/api/rooms/${room.id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creatorId: userId }),
    })
    setDeletingRoom(false)

    if (!res.ok) {
      const payload = await res.json()
      window.alert(payload?.error || 'Failed to delete room')
      return
    }

    router.push('/')
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

