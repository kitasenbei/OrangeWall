import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface MealEntry {
  name: string
  recipeId?: string | null
  notes?: string | null
}

export interface MealPlanDay {
  date: string
  breakfast?: MealEntry | null
  lunch?: MealEntry | null
  snack?: MealEntry | null
  dinner?: MealEntry | null
}

export interface MealPlan {
  id: string
  name: string
  startDate: string
  days: MealPlanDay[]
  createdAt: string
}

export interface MealPlanCreate {
  name: string
  startDate: string
  days?: MealPlanDay[]
}

export interface MealPlanUpdate {
  name?: string
  startDate?: string
  days?: MealPlanDay[]
}

export function useMealPlans() {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMealPlans = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<MealPlan[]>("/meal-plans")
      setMealPlans(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch meal plans")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMealPlans()
  }, [fetchMealPlans])

  const createMealPlan = async (data: MealPlanCreate) => {
    const newPlan = await api.post<MealPlan>("/meal-plans", data)
    setMealPlans(prev => [...prev, newPlan])
    return newPlan
  }

  const updateMealPlan = async (id: string, updates: MealPlanUpdate) => {
    const updated = await api.patch<MealPlan>(`/meal-plans/${id}`, updates)
    setMealPlans(prev => prev.map(p => (p.id === id ? updated : p)))
    return updated
  }

  const deleteMealPlan = async (id: string) => {
    await api.delete(`/meal-plans/${id}`)
    setMealPlans(prev => prev.filter(p => p.id !== id))
  }

  const generateGroceryList = async (id: string, listName?: string) => {
    const params = listName ? `?list_name=${encodeURIComponent(listName)}` : ""
    const result = await api.post<{ groceryListId: string; groceryListName: string; itemCount: number }>(
      `/meal-plans/${id}/generate-grocery${params}`,
      {}
    )
    return result
  }

  return {
    mealPlans,
    loading,
    error,
    refetch: fetchMealPlans,
    createMealPlan,
    updateMealPlan,
    deleteMealPlan,
    generateGroceryList,
  }
}
