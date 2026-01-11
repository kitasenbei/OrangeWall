import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface CalendarEvent {
  id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  color: string
  location: string
  isAllDay: boolean
  isRecurring: boolean
  recurringType: "daily" | "weekly" | "monthly" | "yearly" | null
  reminder: number
}

export interface EventCreate {
  title: string
  description?: string
  date: string
  startTime?: string
  endTime?: string
  color?: string
  location?: string
  isAllDay?: boolean
  isRecurring?: boolean
  recurringType?: "daily" | "weekly" | "monthly" | "yearly" | null
  reminder?: number
}

export interface EventUpdate {
  title?: string
  description?: string
  date?: string
  startTime?: string
  endTime?: string
  color?: string
  location?: string
  isAllDay?: boolean
  isRecurring?: boolean
  recurringType?: "daily" | "weekly" | "monthly" | "yearly" | null
  reminder?: number
}

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<CalendarEvent[]>("/calendar/events")
      setEvents(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch events")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const createEvent = async (event: EventCreate) => {
    const newEvent = await api.post<CalendarEvent>("/calendar/events", event)
    setEvents(prev => [...prev, newEvent])
    return newEvent
  }

  const updateEvent = async (id: string, updates: EventUpdate) => {
    const updated = await api.patch<CalendarEvent>(`/calendar/events/${id}`, updates)
    setEvents(prev => prev.map(e => e.id === id ? updated : e))
    return updated
  }

  const deleteEvent = async (id: string) => {
    await api.delete(`/calendar/events/${id}`)
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  // Helper to get events for a specific date
  const getEventsForDate = (date: string) => {
    return events.filter(e => e.date === date)
  }

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
  }
}
