import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface GroceryItem {
  id: string
  name: string
  category: string
  checked: boolean
  quantity: number
  unit: string
  note?: string
  price?: number
}

export interface GroceryList {
  id: string
  name: string
  items: GroceryItem[]
  createdAt: string
}

export interface GroceryListCreate {
  name: string
  items?: GroceryItem[]
}

export interface GroceryListUpdate {
  name?: string
  items?: GroceryItem[]
}

export function useGrocery() {
  const [lists, setLists] = useState<GroceryList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<GroceryList[]>("/grocery")
      setLists(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch grocery lists")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const createList = async (data: GroceryListCreate) => {
    const newList = await api.post<GroceryList>("/grocery", data)
    setLists(prev => [...prev, newList])
    return newList
  }

  const updateList = async (id: string, updates: GroceryListUpdate) => {
    const updated = await api.patch<GroceryList>(`/grocery/${id}`, updates)
    setLists(prev => prev.map(l => (l.id === id ? updated : l)))
    return updated
  }

  const deleteList = async (id: string) => {
    await api.delete(`/grocery/${id}`)
    setLists(prev => prev.filter(l => l.id !== id))
  }

  // Convenience method to update items in a list
  const updateListItems = async (id: string, items: GroceryItem[]) => {
    return updateList(id, { items })
  }

  return {
    lists,
    loading,
    error,
    refetch: fetchLists,
    createList,
    updateList,
    deleteList,
    updateListItems,
  }
}
