import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Board {
  id: string
  title: string
}

export interface Column {
  id: string
  title: string
  boardId: string
  order: number
}

export interface Card {
  id: string
  title: string
  description: string
  columnId: string
  order: number
}

export function useKanban(boardId?: string) {
  const [boards, setBoards] = useState<Board[]>([])
  const [columns, setColumns] = useState<Column[]>([])
  const [cards, setCards] = useState<Record<string, Card[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBoards = useCallback(async () => {
    try {
      const data = await api.get<Board[]>("/kanban/boards")
      setBoards(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch boards")
    }
  }, [])

  const fetchColumns = useCallback(async (bid: string) => {
    try {
      const data = await api.get<Column[]>(`/kanban/boards/${bid}/columns`)
      setColumns(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch columns")
      return []
    }
  }, [])

  const fetchCards = useCallback(async (columnId: string) => {
    try {
      const data = await api.get<Card[]>(`/kanban/columns/${columnId}/cards`)
      setCards(prev => ({ ...prev, [columnId]: data }))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cards")
      return []
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await fetchBoards()
      if (boardId) {
        const cols = await fetchColumns(boardId)
        for (const col of cols) {
          await fetchCards(col.id)
        }
      }
      setLoading(false)
    }
    init()
  }, [boardId, fetchBoards, fetchColumns, fetchCards])

  // Board operations
  const createBoard = async (title: string) => {
    const newBoard = await api.post<Board>("/kanban/boards", { title })
    setBoards(prev => [...prev, newBoard])
    return newBoard
  }

  const updateBoard = async (id: string, title: string) => {
    const updated = await api.patch<Board>(`/kanban/boards/${id}`, { title })
    setBoards(prev => prev.map(b => b.id === id ? updated : b))
    return updated
  }

  const deleteBoard = async (id: string) => {
    await api.delete(`/kanban/boards/${id}`)
    setBoards(prev => prev.filter(b => b.id !== id))
  }

  // Column operations
  const createColumn = async (title: string, bid: string) => {
    const newColumn = await api.post<Column>("/kanban/columns", { title, boardId: bid })
    setColumns(prev => [...prev, newColumn])
    return newColumn
  }

  const updateColumn = async (id: string, updates: { title?: string; order?: number }) => {
    const updated = await api.patch<Column>(`/kanban/columns/${id}`, updates)
    setColumns(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  const deleteColumn = async (id: string) => {
    await api.delete(`/kanban/columns/${id}`)
    setColumns(prev => prev.filter(c => c.id !== id))
    setCards(prev => {
      const { [id]: _, ...rest } = prev
      return rest
    })
  }

  // Card operations
  const createCard = async (title: string, columnId: string, description = "") => {
    const newCard = await api.post<Card>("/kanban/cards", { title, columnId, description })
    setCards(prev => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), newCard]
    }))
    return newCard
  }

  const updateCard = async (id: string, updates: { title?: string; description?: string; columnId?: string; order?: number }) => {
    const updated = await api.patch<Card>(`/kanban/cards/${id}`, updates)

    // Handle column move
    if (updates.columnId) {
      setCards(prev => {
        const newCards = { ...prev }
        // Remove from all columns
        for (const colId of Object.keys(newCards)) {
          newCards[colId] = newCards[colId].filter(c => c.id !== id)
        }
        // Add to new column
        newCards[updates.columnId!] = [...(newCards[updates.columnId!] || []), updated]
        return newCards
      })
    } else {
      setCards(prev => {
        const newCards = { ...prev }
        for (const colId of Object.keys(newCards)) {
          newCards[colId] = newCards[colId].map(c => c.id === id ? updated : c)
        }
        return newCards
      })
    }

    return updated
  }

  const deleteCard = async (id: string) => {
    await api.delete(`/kanban/cards/${id}`)
    setCards(prev => {
      const newCards = { ...prev }
      for (const colId of Object.keys(newCards)) {
        newCards[colId] = newCards[colId].filter(c => c.id !== id)
      }
      return newCards
    })
  }

  return {
    boards,
    columns,
    cards,
    loading,
    error,
    fetchBoards,
    fetchColumns,
    fetchCards,
    createBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
  }
}
