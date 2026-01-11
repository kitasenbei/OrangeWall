import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Recipe {
  id: string
  title: string
  description: string
  category: string
  prepTime: number
  cookTime: number
  servings: number
  difficulty: "easy" | "medium" | "hard"
  ingredients: string[]
  instructions: string[]
  tags: string[]
  isFavorite: boolean
  rating: number | null
  createdAt: string
}

export interface RecipeCreate {
  title: string
  description?: string
  category?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: "easy" | "medium" | "hard"
  ingredients?: string[]
  instructions?: string[]
  tags?: string[]
  isFavorite?: boolean
  rating?: number | null
}

export interface RecipeUpdate {
  title?: string
  description?: string
  category?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: "easy" | "medium" | "hard"
  ingredients?: string[]
  instructions?: string[]
  tags?: string[]
  isFavorite?: boolean
  rating?: number | null
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecipes = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Recipe[]>("/recipes")
      setRecipes(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recipes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [fetchRecipes])

  const createRecipe = async (recipe: RecipeCreate) => {
    const newRecipe = await api.post<Recipe>("/recipes", recipe)
    setRecipes(prev => [...prev, newRecipe])
    return newRecipe
  }

  const updateRecipe = async (id: string, updates: RecipeUpdate) => {
    const updated = await api.patch<Recipe>(`/recipes/${id}`, updates)
    setRecipes(prev => prev.map(r => r.id === id ? updated : r))
    return updated
  }

  const deleteRecipe = async (id: string) => {
    await api.delete(`/recipes/${id}`)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  const toggleFavorite = async (id: string) => {
    const recipe = recipes.find(r => r.id === id)
    if (recipe) {
      return updateRecipe(id, { isFavorite: !recipe.isFavorite })
    }
  }

  return {
    recipes,
    loading,
    error,
    refetch: fetchRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleFavorite,
  }
}
