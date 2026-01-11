import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface ScheduleBlock {
  id: string
  title: string
  day: string
  startTime: string
  endTime: string
  color: string
}

export interface ScheduleBlockCreate {
  title: string
  day: string
  startTime: string
  endTime: string
  color?: string
}

export interface ScheduleBlockUpdate {
  title?: string
  day?: string
  startTime?: string
  endTime?: string
  color?: string
}

export function useSchedule() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBlocks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<ScheduleBlock[]>("/schedule/blocks")
      setBlocks(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch schedule")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlocks()
  }, [fetchBlocks])

  const createBlock = async (block: ScheduleBlockCreate) => {
    const newBlock = await api.post<ScheduleBlock>("/schedule/blocks", block)
    setBlocks(prev => [...prev, newBlock])
    return newBlock
  }

  const updateBlock = async (id: string, updates: ScheduleBlockUpdate) => {
    const updated = await api.patch<ScheduleBlock>(`/schedule/blocks/${id}`, updates)
    setBlocks(prev => prev.map(b => b.id === id ? updated : b))
    return updated
  }

  const deleteBlock = async (id: string) => {
    await api.delete(`/schedule/blocks/${id}`)
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  // Helper to get blocks for a specific day
  const getBlocksForDay = (day: string) => {
    return blocks.filter(b => b.day === day)
  }

  return {
    blocks,
    loading,
    error,
    refetch: fetchBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
    getBlocksForDay,
  }
}
