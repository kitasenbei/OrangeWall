import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Routine {
  id: string
  title: string
  description: string
  icon: string
  color: string
  recurrenceType: "weekly" | "biweekly" | "monthly" | "custom"
  daysOfWeek?: number[]
  weeksOfMonth?: number[]
  daysOfMonth?: number[]
  customPattern?: string
  category: string
}

export interface RoutineCreate {
  title: string
  description?: string
  icon?: string
  color?: string
  recurrenceType: "weekly" | "biweekly" | "monthly" | "custom"
  daysOfWeek?: number[]
  weeksOfMonth?: number[]
  daysOfMonth?: number[]
  customPattern?: string
  category?: string
}

export interface RoutineUpdate {
  title?: string
  description?: string
  icon?: string
  color?: string
  recurrenceType?: "weekly" | "biweekly" | "monthly" | "custom"
  daysOfWeek?: number[]
  weeksOfMonth?: number[]
  daysOfMonth?: number[]
  customPattern?: string
  category?: string
}

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRoutines = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Routine[]>("/routines")
      setRoutines(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch routines")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRoutines()
  }, [fetchRoutines])

  const createRoutine = async (routine: RoutineCreate) => {
    const newRoutine = await api.post<Routine>("/routines", routine)
    setRoutines(prev => [...prev, newRoutine])
    return newRoutine
  }

  const updateRoutine = async (id: string, updates: RoutineUpdate) => {
    const updated = await api.patch<Routine>(`/routines/${id}`, updates)
    setRoutines(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }

  const deleteRoutine = async (id: string) => {
    await api.delete(`/routines/${id}`)
    setRoutines(prev => prev.filter(r => r.id !== id))
  }

  return {
    routines,
    loading,
    error,
    refetch: fetchRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
  }
}
