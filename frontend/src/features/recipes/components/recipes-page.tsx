import { useState, useMemo } from "react"
import {
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  Clock,
  Users,
  Search,
  Star,
  ChefHat,
  Flame,
  UtensilsCrossed,
  Salad,
  Beef,
  Fish,
  Cake,
  Coffee,
  Loader2,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/cheval-ui"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useRecipes, type Recipe } from "@/hooks"

const categories: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "lunch", label: "Lunch", icon: Salad },
  { id: "dinner", label: "Dinner", icon: UtensilsCrossed },
  { id: "dessert", label: "Dessert", icon: Cake },
  { id: "snack", label: "Snack", icon: ChefHat },
  { id: "meat", label: "Meat", icon: Beef },
  { id: "seafood", label: "Seafood", icon: Fish },
  { id: "vegetarian", label: "Vegetarian", icon: Salad },
]

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function RecipesPage() {
  const { recipes, loading, createRecipe, updateRecipe, deleteRecipe, toggleFavorite } = useRecipes()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "dinner",
    prepTime: "",
    cookTime: "",
    servings: "4",
    difficulty: "medium" as Recipe["difficulty"],
    ingredients: "",
    instructions: "",
    tags: "",
  })

  const filteredRecipes = useMemo(() => {
    let result = [...recipes]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    if (filterCategory) {
      result = result.filter((r) => r.category === filterCategory)
    }

    if (filterDifficulty) {
      result = result.filter((r) => r.difficulty === filterDifficulty)
    }

    result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

    return result
  }, [recipes, searchQuery, filterCategory, filterDifficulty])

  const stats = useMemo(() => ({
    total: recipes.length,
    favorites: recipes.filter((r) => r.isFavorite).length,
    categories: new Set(recipes.map((r) => r.category)).size,
    avgTime: recipes.length ? Math.round(recipes.reduce((acc, r) => acc + r.prepTime + r.cookTime, 0) / recipes.length) : 0,
  }), [recipes])

  const handleOpenAdd = () => {
    setEditingRecipe(null)
    setFormData({
      title: "",
      description: "",
      category: "dinner",
      prepTime: "",
      cookTime: "",
      servings: "4",
      difficulty: "medium",
      ingredients: "",
      instructions: "",
      tags: "",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      prepTime: recipe.prepTime.toString(),
      cookTime: recipe.cookTime.toString(),
      servings: recipe.servings.toString(),
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients.join("\n"),
      instructions: recipe.instructions.join("\n"),
      tags: recipe.tags.join(", "),
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return

    setIsSaving(true)
    try {
      const recipeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        prepTime: parseInt(formData.prepTime) || 0,
        cookTime: parseInt(formData.cookTime) || 0,
        servings: parseInt(formData.servings) || 4,
        difficulty: formData.difficulty,
        ingredients: formData.ingredients.split("\n").filter((i) => i.trim()),
        instructions: formData.instructions.split("\n").filter((i) => i.trim()),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }

      if (editingRecipe) {
        await updateRecipe(editingRecipe.id, recipeData)
      } else {
        await createRecipe(recipeData)
      }
      setIsDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteRecipe(id)
  }

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id)
    // Update viewing recipe if it's the one being toggled
    if (viewingRecipe?.id === id) {
      setViewingRecipe(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null)
    }
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || categories[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recipes</h1>
          <p className="text-muted-foreground">Your personal cookbook</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4 mr-2" />
          Add Recipe
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Recipes" value={stats.total.toString()} icon={ChefHat} />
        <StatCard title="Favorites" value={stats.favorites.toString()} icon={Star} />
        <StatCard title="Categories" value={stats.categories.toString()} icon={UtensilsCrossed} />
        <StatCard title="Avg Time" value={`${stats.avgTime} min`} icon={Clock} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory || "all"} onValueChange={(v) => setFilterCategory(v === "all" ? null : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDifficulty || "all"} onValueChange={(v) => setFilterDifficulty(v === "all" ? null : v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredRecipes.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <ChefHat className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">No recipes found</h3>
          <p className="text-sm text-muted-foreground mb-4">Start building your cookbook</p>
          <Button onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" />
            Add Recipe
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => {
            const catInfo = getCategoryInfo(recipe.category)
            const CatIcon = catInfo.icon

            return (
              <div
                key={recipe.id}
                className="group rounded-lg border bg-card overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => setViewingRecipe(recipe)}
              >
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                  <CatIcon className="size-16 text-muted-foreground/30" />
                  {recipe.isFavorite && (
                    <Star className="absolute top-2 left-2 size-5 fill-yellow-400 text-yellow-400" />
                  )}
                  {recipe.rating && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      <Star className="size-3 fill-yellow-400 text-yellow-400" />
                      {recipe.rating}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1">{recipe.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{recipe.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      <Clock className="size-3" />
                      {recipe.prepTime + recipe.cookTime} min
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="size-3" />
                      {recipe.servings}
                    </Badge>
                    <Badge className={difficultyColors[recipe.difficulty]}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* View Recipe Dialog */}
      <Dialog open={!!viewingRecipe} onOpenChange={() => setViewingRecipe(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {viewingRecipe && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <DialogTitle className="text-xl">{viewingRecipe.title}</DialogTitle>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleToggleFavorite(viewingRecipe.id)}>
                      <Star className={cn("size-5", viewingRecipe.isFavorite && "fill-yellow-400 text-yellow-400")} />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setViewingRecipe(null); handleOpenEdit(viewingRecipe); }}>
                          <Edit3 className="size-4 mr-2" />Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => { handleDelete(viewingRecipe.id); setViewingRecipe(null); }}>
                          <Trash2 className="size-4 mr-2" />Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </DialogHeader>
              <p className="text-muted-foreground">{viewingRecipe.description}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline"><Clock className="size-3 mr-1" />Prep: {viewingRecipe.prepTime} min</Badge>
                <Badge variant="outline"><Flame className="size-3 mr-1" />Cook: {viewingRecipe.cookTime} min</Badge>
                <Badge variant="outline"><Users className="size-3 mr-1" />{viewingRecipe.servings} servings</Badge>
                <Badge className={difficultyColors[viewingRecipe.difficulty]}>{viewingRecipe.difficulty}</Badge>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ingredients</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {viewingRecipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Instructions</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  {viewingRecipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingRecipe ? "Edit Recipe" : "Add Recipe"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Recipe name" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v as Recipe["difficulty"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Prep (min)</Label>
                <Input type="number" value={formData.prepTime} onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Cook (min)</Label>
                <Input type="number" value={formData.cookTime} onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })} />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Servings</Label>
                <Input type="number" value={formData.servings} onChange={(e) => setFormData({ ...formData, servings: e.target.value })} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ingredients (one per line)</Label>
              <Textarea value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} rows={4} placeholder="2 cups flour&#10;1 egg&#10;..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Instructions (one per line)</Label>
              <Textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} rows={4} placeholder="Preheat oven...&#10;Mix ingredients..." />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tags (comma separated)</Label>
              <Input value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} placeholder="quick, healthy, vegetarian" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.title.trim() || isSaving}>
                {isSaving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                {editingRecipe ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
