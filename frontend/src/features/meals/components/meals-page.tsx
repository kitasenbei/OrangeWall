import { useState, useEffect } from "react"
import { Plus, Trash2, Copy, Check, ShoppingCart, Calendar, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMealPlans, type MealPlanDay, type MealEntry } from "@/hooks/use-meal-plans"

const mealTypes = ["breakfast", "lunch", "snack", "dinner"] as const
type MealType = typeof mealTypes[number]

const mealTypeLabels: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack: "Snack",
  dinner: "Dinner",
}

export function MealsPage() {
  const { mealPlans, loading, error, createMealPlan, updateMealPlan, deleteMealPlan, generateGroceryList, refetch } = useMealPlans()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [editingCell, setEditingCell] = useState<{ date: string; meal: MealType } | null>(null)
  const [newMealName, setNewMealName] = useState("")
  const [newMealNotes, setNewMealNotes] = useState("")
  const [showNewPlanDialog, setShowNewPlanDialog] = useState(false)
  const [newPlanName, setNewPlanName] = useState("")
  const [newPlanStartDate, setNewPlanStartDate] = useState("")
  const [generatingGrocery, setGeneratingGrocery] = useState(false)
  const [groceryResult, setGroceryResult] = useState<{ name: string; count: number } | null>(null)
  const [weekOffset, setWeekOffset] = useState(0)

  // Select first plan on load
  useEffect(() => {
    if (mealPlans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(mealPlans[0].id)
    }
  }, [mealPlans, selectedPlanId])

  // Reset week offset when plan changes
  useEffect(() => {
    setWeekOffset(0)
  }, [selectedPlanId])

  const selectedPlan = mealPlans.find(p => p.id === selectedPlanId)

  // Get days for current week view (7 days at a time)
  const getWeekDays = () => {
    if (!selectedPlan || selectedPlan.days.length === 0) return []
    const sortedDays = [...selectedPlan.days].sort((a, b) => a.date.localeCompare(b.date))
    const startIdx = weekOffset * 7
    return sortedDays.slice(startIdx, startIdx + 7)
  }

  const weekDays = getWeekDays()
  const totalWeeks = selectedPlan ? Math.ceil(selectedPlan.days.length / 7) : 0
  const currentWeek = weekOffset + 1

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  const formatDayName = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00")
    return date.toLocaleDateString("en-US", { weekday: "long" })
  }

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0]
    return dateStr === today
  }

  const getMeal = (day: MealPlanDay, mealType: MealType): MealEntry | null => {
    return day[mealType] || null
  }

  const updateMeal = async (date: string, mealType: MealType, meal: MealEntry | null) => {
    if (!selectedPlan) return

    const days = [...selectedPlan.days]
    let dayIndex = days.findIndex(d => d.date === date)

    if (dayIndex === -1) {
      // Create the day if it doesn't exist
      days.push({ date, [mealType]: meal })
      days.sort((a, b) => a.date.localeCompare(b.date))
    } else {
      days[dayIndex] = { ...days[dayIndex], [mealType]: meal }
    }

    await updateMealPlan(selectedPlan.id, { days })
  }

  const addMeal = async (date: string, mealType: MealType, name: string, notes?: string) => {
    if (!name.trim()) return
    await updateMeal(date, mealType, { name: name.trim(), notes: notes || null, recipeId: null })
    setNewMealName("")
    setNewMealNotes("")
    setEditingCell(null)
  }

  const removeMeal = async (date: string, mealType: MealType) => {
    await updateMeal(date, mealType, null)
  }

  const copyToClipboard = () => {
    if (!selectedPlan) return

    const lines: string[] = []
    lines.push(selectedPlan.name)
    lines.push("=".repeat(40))

    selectedPlan.days.forEach(day => {
      lines.push("")
      lines.push(`${formatDayName(day.date)} (${formatDate(day.date)})`)
      lines.push("-".repeat(20))
      mealTypes.forEach(mealType => {
        const meal = getMeal(day, mealType)
        if (meal) {
          const notes = meal.notes ? ` (${meal.notes})` : ""
          lines.push(`  ${mealTypeLabels[mealType]}: ${meal.name}${notes}`)
        }
      })
    })

    navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCreatePlan = async () => {
    if (!newPlanName.trim() || !newPlanStartDate) return
    const plan = await createMealPlan({ name: newPlanName.trim(), startDate: newPlanStartDate, days: [] })
    setSelectedPlanId(plan.id)
    setShowNewPlanDialog(false)
    setNewPlanName("")
    setNewPlanStartDate("")
  }

  const handleGenerateGrocery = async () => {
    if (!selectedPlan) return
    setGeneratingGrocery(true)
    try {
      const result = await generateGroceryList(selectedPlan.id)
      setGroceryResult({ name: result.groceryListName, count: result.itemCount })
    } finally {
      setGeneratingGrocery(false)
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return
    await deleteMealPlan(selectedPlan.id)
    setSelectedPlanId(mealPlans.find(p => p.id !== selectedPlan.id)?.id || null)
  }

  const getMealCount = () => {
    if (!selectedPlan) return 0
    let count = 0
    selectedPlan.days.forEach(day => {
      mealTypes.forEach(mealType => {
        if (getMeal(day, mealType)) count++
      })
    })
    return count
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={refetch}>Retry</Button>
      </div>
    )
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
          <Button variant="outline" size="sm" onClick={handleGenerateGrocery} disabled={!selectedPlan || generatingGrocery}>
            {generatingGrocery ? <Loader2 className="size-4 mr-2 animate-spin" /> : <ShoppingCart className="size-4 mr-2" />}
            Generate Grocery
          </Button>
          <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!selectedPlan}>
            {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
            {copied ? "Copied" : "Copy Plan"}
          </Button>
          <Button size="sm" onClick={() => setShowNewPlanDialog(true)}>
            <Plus className="size-4 mr-2" />
            New Plan
          </Button>
        </div>
      </div>

      {/* Plan Selector */}
      {mealPlans.length > 0 ? (
        <>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={selectedPlanId || ""} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meal plan" />
                </SelectTrigger>
                <SelectContent>
                  {mealPlans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} ({plan.days.length} days)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPlan && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDeletePlan} className="text-destructive">
                    Delete this plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Week Navigation */}
          {selectedPlan && totalWeeks > 0 && (
            <div className="flex items-center justify-between bg-card border rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-lg font-semibold">{getMealCount()} meals / {selectedPlan.days.length} days</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  disabled={weekOffset === 0}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <div className="px-4 text-center min-w-[120px]">
                  <p className="font-medium">Week {currentWeek} of {totalWeeks}</p>
                  {weekDays.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(weekDays[0].date)} - {formatDate(weekDays[weekDays.length - 1].date)}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  disabled={weekOffset >= totalWeeks - 1}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Meal Grid */}
          {selectedPlan && weekDays.length > 0 ? (
            <div className="bg-card border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left text-sm font-medium text-muted-foreground w-24">Meal</th>
                      {weekDays.map(day => (
                        <th key={day.date} className={`p-3 text-center text-sm font-medium ${isToday(day.date) ? "bg-primary/10" : ""}`}>
                          <div className={isToday(day.date) ? "text-primary" : ""}>{formatDayName(day.date)}</div>
                          <div className={`text-xs font-normal ${isToday(day.date) ? "text-primary/80" : "text-muted-foreground"}`}>
                            {formatDate(day.date)}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mealTypes.map(mealType => (
                      <tr key={mealType} className="border-b last:border-b-0">
                        <td className="p-3 text-sm font-medium text-muted-foreground bg-muted/30 align-top">
                          {mealTypeLabels[mealType]}
                        </td>
                        {weekDays.map(day => {
                          const meal = getMeal(day, mealType)
                          const isEditing = editingCell?.date === day.date && editingCell?.meal === mealType

                          return (
                            <td
                              key={day.date}
                              className={`p-2 align-top border-l ${isToday(day.date) ? "bg-primary/5" : ""}`}
                            >
                              <div className="min-h-[60px] space-y-1">
                                {meal && !isEditing && (
                                  <div className="group flex items-start gap-1 text-sm p-1.5 rounded bg-muted/50 hover:bg-muted">
                                    <div className="flex-1">
                                      <span className="leading-tight">{meal.name}</span>
                                      {meal.notes && (
                                        <span className="block text-xs text-muted-foreground">({meal.notes})</span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => removeMeal(day.date, mealType)}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    >
                                      <X className="size-3" />
                                    </button>
                                  </div>
                                )}

                                {isEditing ? (
                                  <div className="space-y-1">
                                    <Input
                                      autoFocus
                                      value={newMealName}
                                      onChange={e => setNewMealName(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") {
                                          addMeal(day.date, mealType, newMealName, newMealNotes)
                                        }
                                        if (e.key === "Escape") {
                                          setEditingCell(null)
                                          setNewMealName("")
                                          setNewMealNotes("")
                                        }
                                      }}
                                      placeholder="Meal name..."
                                      className="h-7 text-sm"
                                    />
                                    <Input
                                      value={newMealNotes}
                                      onChange={e => setNewMealNotes(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") {
                                          addMeal(day.date, mealType, newMealName, newMealNotes)
                                        }
                                        if (e.key === "Escape") {
                                          setEditingCell(null)
                                          setNewMealName("")
                                          setNewMealNotes("")
                                        }
                                      }}
                                      placeholder="Notes (optional)..."
                                      className="h-7 text-sm"
                                    />
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        className="h-6 text-xs"
                                        onClick={() => addMeal(day.date, mealType, newMealName, newMealNotes)}
                                      >
                                        Add
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 text-xs"
                                        onClick={() => {
                                          setEditingCell(null)
                                          setNewMealName("")
                                          setNewMealNotes("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : !meal && (
                                  <button
                                    onClick={() => {
                                      setEditingCell({ date: day.date, meal: mealType })
                                      setNewMealName("")
                                      setNewMealNotes("")
                                    }}
                                    className="w-full text-left text-xs text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted/50 flex items-center gap-1"
                                  >
                                    <Plus className="size-3" />
                                    Add
                                  </button>
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedPlan ? (
            <div className="text-center py-12 bg-card border rounded-lg">
              <Calendar className="size-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">No days in this meal plan yet</p>
              <p className="text-sm text-muted-foreground">Import a meal plan via CLI or add days manually</p>
            </div>
          ) : null}
        </>
      ) : (
        <div className="text-center py-12 bg-card border rounded-lg">
          <Calendar className="size-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground mb-4">No meal plans yet</p>
          <Button onClick={() => setShowNewPlanDialog(true)}>
            <Plus className="size-4 mr-2" />
            Create First Plan
          </Button>
        </div>
      )}

      {/* New Plan Dialog */}
      <Dialog open={showNewPlanDialog} onOpenChange={setShowNewPlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                value={newPlanName}
                onChange={e => setNewPlanName(e.target.value)}
                placeholder="e.g., Week of Jan 12"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={newPlanStartDate}
                onChange={e => setNewPlanStartDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPlanDialog(false)}>Cancel</Button>
            <Button onClick={handleCreatePlan} disabled={!newPlanName.trim() || !newPlanStartDate}>
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grocery Generated Dialog */}
      <Dialog open={!!groceryResult} onOpenChange={() => setGroceryResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grocery List Generated</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Created grocery list: <strong>{groceryResult?.name}</strong></p>
            <p>Items: {groceryResult?.count}</p>
            <p className="text-sm text-muted-foreground">
              View it in the Grocery page or via CLI:
              <code className="block mt-2 p-2 bg-muted rounded text-xs">
                orangewall grocery show "{groceryResult?.name}"
              </code>
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setGroceryResult(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
