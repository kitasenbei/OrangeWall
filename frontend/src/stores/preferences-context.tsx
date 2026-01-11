import { createContext, useContext, useState, useEffect } from "react"

interface PreferencesContextType {
  favoriteTools: string[]
  addFavorite: (href: string) => void
  removeFavorite: (href: string) => void
  toggleFavorite: (href: string) => void
  isFavorite: (href: string) => boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteTools, setFavoriteTools] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("favoriteTools")
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  useEffect(() => {
    localStorage.setItem("favoriteTools", JSON.stringify(favoriteTools))
  }, [favoriteTools])

  const addFavorite = (href: string) => {
    setFavoriteTools(prev =>
      prev.includes(href) ? prev : [...prev, href]
    )
  }

  const removeFavorite = (href: string) => {
    setFavoriteTools(prev => prev.filter(h => h !== href))
  }

  const toggleFavorite = (href: string) => {
    setFavoriteTools(prev =>
      prev.includes(href)
        ? prev.filter(h => h !== href)
        : [...prev, href]
    )
  }

  const isFavorite = (href: string) => favoriteTools.includes(href)

  return (
    <PreferencesContext.Provider value={{
      favoriteTools,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite
    }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider")
  }
  return context
}
