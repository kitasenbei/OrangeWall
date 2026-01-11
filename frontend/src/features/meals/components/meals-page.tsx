import { useState } from "react"
import { Plus, Trash2, Copy, Check, ShoppingCart, ChevronLeft, ChevronRight, RotateCcw, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"] as const
type MealType = typeof mealTypes[number]

interface Meal {
  name: string
  notes?: string
}

type DayPlan = Record<MealType, Meal[]>
type WeekPlan = Record<string, DayPlan>

const emptyDay = (): DayPlan => ({
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snacks: [],
})

const initialPlan: WeekPlan = {
  Monday: {
    Breakfast: [{ name: "Oatmeal with berries" }],
    Lunch: [{ name: "Grilled chicken salad" }],
    Dinner: [{ name: "Spaghetti bolognese" }, { name: "Garlic bread" }],
    Snacks: [{ name: "Apple" }],
  },
  Tuesday: {
    Breakfast: [{ name: "Scrambled eggs" }, { name: "Toast" }],
    Lunch: [{ name: "Turkey sandwich" }],
    Dinner: [{ name: "Beef stir fry" }, { name: "Rice" }],
    Snacks: [],
  },
  Wednesday: {
    Breakfast: [{ name: "Greek yogurt parfait" }],
    Lunch: [{ name: "Minestrone soup" }],
    Dinner: [{ name: "Chicken tacos" }],
    Snacks: [{ name: "Mixed nuts" }],
  },
  Thursday: {
    Breakfast: [{ name: "Smoothie bowl" }],
    Lunch: [{ name: "Caesar wrap" }],
    Dinner: [{ name: "Grilled salmon" }, { name: "Roasted vegetables" }],
    Snacks: [],
  },
  Friday: {
    Breakfast: [{ name: "Pancakes" }],
    Lunch: [{ name: "Leftover salmon" }],
    Dinner: [{ name: "Homemade pizza" }],
    Snacks: [{ name: "Popcorn" }],
  },
  Saturday: {
    Breakfast: [{ name: "Eggs benedict" }],
    Lunch: [],
    Dinner: [{ name: "BBQ ribs" }, { name: "Coleslaw" }, { name: "Corn on the cob" }],
    Snacks: [],
  },
  Sunday: {
    Breakfast: [{ name: "French toast" }],
    Lunch: [{ name: "Garden salad" }],
    Dinner: [{ name: "Roast chicken" }, { name: "Mashed potatoes" }, { name: "Gravy" }],
    Snacks: [{ name: "Cheese and crackers" }],
  },
}

const defaultFavorites = [
  "Grilled chicken salad",
  "Spaghetti bolognese",
  "Beef stir fry",
  "Chicken tacos",
  "Grilled salmon",
  "Roast chicken",
  "Caesar wrap",
  "Greek yogurt parfait",
  "Smoothie bowl",
  "Homemade pizza",
]

export function MealsPage() {
  const [plan, setPlan] = useState<WeekPlan>(initialPlan)
  const [weekOffset, setWeekOffset] = useState(0)
  const [copied, setCopied] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(defaultFavorites)
  const [editingCell, setEditingCell] = useState<{ day: string; meal: MealType } | null>(null)
  const [newMealName, setNewMealName] = useState("")
  const [shoppingListOpen, setShoppingListOpen] = useState(false)

  const getWeekDates = () => {
    const today = new Date()
    const currentDay = today.getDay()
    const monday = new Date(today)
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1) + weekOffset * 7)

    return days.map((_, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const addMeal = (day: string, mealType: MealType, name: string) => {
    if (!name.trim()) return
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [...(prev[day]?.[mealType] || []), { name: name.trim() }],
      },
    }))
    setNewMealName("")
  }

  const removeMeal = (day: string, mealType: MealType, index: number) => {
    setPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day]?.[mealType].filter((_, i) => i !== index) || [],
      },
    }))
  }

  const clearDay = (day: string) => {
    setPlan(prev => ({ ...prev, [day]: emptyDay() }))
  }

  const clearWeek = () => {
    const empty: WeekPlan = {}
    days.forEach(day => { empty[day] = emptyDay() })
    setPlan(empty)
  }

  const copyToClipboard = () => {
    const lines: string[] = []
    lines.push(`Meal Plan: ${formatDate(weekStart)} - ${formatDate(weekEnd)}`)
    lines.push("=".repeat(40))

    days.forEach((day, i) => {
      lines.push("")
      lines.push(`${day} (${formatDate(weekDates[i])})`)
      lines.push("-".repeat(20))
      mealTypes.forEach(meal => {
        const items = plan[day]?.[meal] || []
        if (items.length > 0) {
          lines.push(`  ${meal}: ${items.map(m => m.name).join(", ")}`)
        }
      })
    })

    navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleFavorite = (name: string) => {
    setFavorites(prev =>
      prev.includes(name)
        ? prev.filter(f => f !== name)
        : [...prev, name]
    )
  }

  const generateShoppingList = () => {
    const items = new Set<string>()
    days.forEach(day => {
      mealTypes.forEach(meal => {
        plan[day]?.[meal]?.forEach(m => {
          items.add(m.name)
        })
      })
    })
    return Array.from(items).sort()
  }

  const getMealCount = () => {
    let count = 0
    days.forEach(day => {
      mealTypes.forEach(meal => {
        count += plan[day]?.[meal]?.length || 0
      })
    })
    return count
  }

  const getFilledDays = () => {
    return days.filter(day => {
      return mealTypes.some(meal => (plan[day]?.[meal]?.length || 0) > 0)
    }).length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meal Planner</h1>
          <p className="text-sm text-muted-foreground">Plan and organize your weekly meals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShoppingListOpen(true)}>
            <ShoppingCart className="size-4 mr-2" />
            Shopping List
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
            {copied ? "Copied" : "Copy Plan"}
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between bg-card border rounded-lg p-4">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(prev => prev - 1)}>
          <ChevronLeft className="size-4 mr-1" />
          Previous
        </Button>
        <div className="text-center">
          <p className="font-medium">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
            {weekOffset === 0 && <span className="ml-2 text-xs text-muted-foreground">(This Week)</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {weekOffset !== 0 && (
            <Button variant="ghost" size="sm" onClick={() => setWeekOffset(0)}>
              Today
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setWeekOffset(prev => prev + 1)}>
            Next
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Meals</p>
          <p className="text-2xl font-semibold">{getMealCount()}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Days Planned</p>
          <p className="text-2xl font-semibold">{getFilledDays()} / 7</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Saved Favorites</p>
          <p className="text-2xl font-semibold">{favorites.length}</p>
        </div>
      </div>

      {/* Meal Grid */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left text-sm font-medium text-muted-foreground w-24">Meal</th>
                {days.map((day, i) => (
                  <th key={day} className={`p-3 text-center text-sm font-medium ${isToday(weekDates[i]) ? "bg-primary/10" : ""}`}>
                    <div className={isToday(weekDates[i]) ? "text-primary" : ""}>{day}</div>
                    <div className={`text-xs font-normal ${isToday(weekDates[i]) ? "text-primary/80" : "text-muted-foreground"}`}>
                      {formatDate(weekDates[i])}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mealTypes.map(mealType => (
                <tr key={mealType} className="border-b last:border-b-0">
                  <td className="p-3 text-sm font-medium text-muted-foreground bg-muted/30 align-top">
                    {mealType}
                  </td>
                  {days.map((day, i) => {
                    const meals = plan[day]?.[mealType] || []
                    const isEditing = editingCell?.day === day && editingCell?.meal === mealType

                    return (
                      <td
                        key={day}
                        className={`p-2 align-top border-l ${isToday(weekDates[i]) ? "bg-primary/5" : ""}`}
                      >
                        <div className="min-h-[60px] space-y-1">
                          {meals.map((meal, idx) => (
                            <div
                              key={idx}
                              className="group flex items-start gap-1 text-sm p-1.5 rounded bg-muted/50 hover:bg-muted"
                            >
                              <span className="flex-1 leading-tight">{meal.name}</span>
                              <button
                                onClick={() => toggleFavorite(meal.name)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Star className={`size-3 ${favorites.includes(meal.name) ? "fill-amber-500 text-amber-500" : "text-muted-foreground"}`} />
                              </button>
                              <button
                                onClick={() => removeMeal(day, mealType, idx)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          ))}

                          {isEditing ? (
                            <div className="flex gap-1">
                              <Input
                                autoFocus
                                value={newMealName}
                                onChange={e => setNewMealName(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === "Enter") {
                                    addMeal(day, mealType, newMealName)
                                    setEditingCell(null)
                                  }
                                  if (e.key === "Escape") {
                                    setEditingCell(null)
                                    setNewMealName("")
                                  }
                                }}
                                onBlur={() => {
                                  if (newMealName.trim()) {
                                    addMeal(day, mealType, newMealName)
                                  }
                                  setEditingCell(null)
                                }}
                                placeholder="Add meal..."
                                className="h-7 text-sm"
                              />
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50 flex items-center gap-1">
                                  <Plus className="size-3" />
                                  Add
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem onClick={() => {
                                  setEditingCell({ day, meal: mealType })
                                  setNewMealName("")
                                }}>
                                  <Plus className="size-4 mr-2" />
                                  Custom meal
                                </DropdownMenuItem>
                                {favorites.length > 0 && (
                                  <>
                                    <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Favorites</div>
                                    {favorites.slice(0, 8).map(fav => (
                                      <DropdownMenuItem key={fav} onClick={() => addMeal(day, mealType, fav)}>
                                        <Star className="size-3 mr-2 text-amber-500" />
                                        {fav}
                                      </DropdownMenuItem>
                                    ))}
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr className="bg-muted/30">
                <td className="p-2"></td>
                {days.map(day => (
                  <td key={day} className="p-2 text-center border-l">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearDay(day)}
                      className="text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3 mr-1" />
                      Clear
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={clearWeek}>
          <RotateCcw className="size-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Favorites Section */}
      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium">Favorite Meals</h3>
            <p className="text-xs text-muted-foreground">Quick access to your go-to meals</p>
          </div>
        </div>
        {favorites.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {favorites.map(fav => (
              <div
                key={fav}
                className="group flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm"
              >
                <Star className="size-3 text-amber-500" />
                <span>{fav}</span>
                <button
                  onClick={() => toggleFavorite(fav)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No favorites yet. Star meals in the planner to add them here.</p>
        )}
      </div>

      {/* Shopping List Dialog */}
      <Dialog open={shoppingListOpen} onOpenChange={setShoppingListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Meals planned for {formatDate(weekStart)} - {formatDate(weekEnd)}
            </p>
            <div className="max-h-[400px] overflow-y-auto">
              {generateShoppingList().length > 0 ? (
                <ul className="space-y-2">
                  {generateShoppingList().map((item, i) => (
                    <li key={i} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                      <div className="size-4 border rounded" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No meals planned yet.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const list = generateShoppingList().join("\n")
                  navigator.clipboard.writeText(list)
                }}
              >
                <Copy className="size-4 mr-2" />
                Copy List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
