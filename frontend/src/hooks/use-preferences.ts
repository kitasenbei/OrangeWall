import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface UserPreferences {
  userId: string
  favoriteTools: string[]
  theme: string
  sidebarCollapsed: boolean
}

export interface PreferencesUpdate {
  favoriteTools?: string[]
  theme?: string
  sidebarCollapsed?: boolean
}

export function useUserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<UserPreferences>("/preferences")
      setPreferences(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch preferences")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const updatePreferences = async (updates: PreferencesUpdate) => {
    const updated = await api.patch<UserPreferences>("/preferences", updates)
    setPreferences(updated)
    return updated
  }

  const addFavoriteTool = async (href: string) => {
    if (!preferences) return
    const newFavorites = [...preferences.favoriteTools, href]
    return updatePreferences({ favoriteTools: newFavorites })
  }

  const removeFavoriteTool = async (href: string) => {
    if (!preferences) return
    const newFavorites = preferences.favoriteTools.filter(h => h !== href)
    return updatePreferences({ favoriteTools: newFavorites })
  }

  const toggleFavoriteTool = async (href: string) => {
    if (!preferences) return
    if (preferences.favoriteTools.includes(href)) {
      return removeFavoriteTool(href)
    }
    return addFavoriteTool(href)
  }

  return {
    preferences,
    loading,
    error,
    refetch: fetchPreferences,
    updatePreferences,
    addFavoriteTool,
    removeFavoriteTool,
    toggleFavoriteTool,
  }
}
