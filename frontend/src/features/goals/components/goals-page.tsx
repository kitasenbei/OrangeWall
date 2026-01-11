import { useState } from "react"
import { Plus, Target, ChevronDown, ChevronRight, Check, Circle, MoreHorizontal, Trash2, Edit2, AlertTriangle, TrendingUp, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge, StatCard } from "@/components/cheval-ui"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"
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

interface KeyResult {
  id: string
  title: string
  target: number
  current: number
  unit: string
}

interface Goal {
  id: string
  title: string
  description: string
  quarter: string
  category: "business" | "personal" | "health" | "learning"
  status: "active" | "completed" | "archived"
  keyResults: KeyResult[]
  deadline?: string
  createdAt: Date
}

const categoryConfig = {
  business: { label: "Business", color: "bg-blue-500", textColor: "text-blue-600" },
  personal: { label: "Personal", color: "bg-purple-500", textColor: "text-purple-600" },
  health: { label: "Health", color: "bg-green-500", textColor: "text-green-600" },
  learning: { label: "Learning", color: "bg-orange-500", textColor: "text-orange-600" },
}

const quarters = ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025", "Q1 2026"]

const initialGoals: Goal[] = [
  {
    id: "1",
    title: "Launch MVP",
    description: "Get the first version of the product to market with core features",
    quarter: "Q1 2025",
    category: "business",
    status: "active",
    deadline: "2025-03-31",
    keyResults: [
      { id: "kr1", title: "Complete core features", target: 10, current: 7, unit: "features" },
      { id: "kr2", title: "Get beta users", target: 50, current: 23, unit: "users" },
      { id: "kr3", title: "Achieve uptime", target: 99, current: 99.5, unit: "%" },
    ],
    createdAt: new Date(),
  },
  {
    id: "2",
    title: "Build Network",
    description: "Expand professional connections in the industry",
    quarter: "Q1 2025",
    category: "personal",
    status: "active",
    keyResults: [
      { id: "kr4", title: "Attend events", target: 5, current: 2, unit: "events" },
      { id: "kr5", title: "Coffee chats", target: 20, current: 8, unit: "meetings" },
    ],
    createdAt: new Date(),
  },
  {
    id: "3",
    title: "Stay Healthy",
    description: "Maintain physical and mental wellness throughout the quarter",
    quarter: "Q1 2025",
    category: "health",
    status: "active",
    keyResults: [
      { id: "kr6", title: "Workout sessions", target: 48, current: 15, unit: "sessions" },
      { id: "kr7", title: "Sleep 7+ hours", target: 90, current: 72, unit: "nights" },
    ],
    createdAt: new Date(),
  },
  {
    id: "4",
    title: "Learn TypeScript",
    description: "Master TypeScript for better code quality",
    quarter: "Q1 2025",
    category: "learning",
    status: "completed",
    keyResults: [
      { id: "kr8", title: "Complete course modules", target: 12, current: 12, unit: "modules" },
      { id: "kr9", title: "Build practice projects", target: 3, current: 3, unit: "projects" },
    ],
    createdAt: new Date(Date.now() - 2592000000),
  },
]

function getGoalProgress(goal: Goal): number {
  if (goal.keyResults.length === 0) return 0
  const total = goal.keyResults.reduce((acc, kr) => {
    const progress = Math.min((kr.current / kr.target) * 100, 100)
    return acc + progress
  }, 0)
  return Math.round(total / goal.keyResults.length)
}

function getGoalRisk(goal: Goal): "on-track" | "at-risk" | "behind" {
  const progress = getGoalProgress(goal)
  if (goal.status === "completed") return "on-track"

  // Simple risk calculation based on progress
  if (progress >= 70) return "on-track"
  if (progress >= 40) return "at-risk"
  return "behind"
}

export function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set(["1"]))
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  // Goal dialog
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [goalFormData, setGoalFormData] = useState({
    title: "",
    description: "",
    quarter: "Q1 2025",
    category: "business" as Goal["category"],
    deadline: "",
  })

  // Key Result dialog
  const [isKRDialogOpen, setIsKRDialogOpen] = useState(false)
  const [krTargetGoalId, setKrTargetGoalId] = useState<string | null>(null)
  const [krFormData, setKrFormData] = useState({
    title: "",
    target: "",
    unit: "",
  })

  // Filter goals
  const filteredGoals = goals
    .filter((g) => {
      if (!showArchived && g.status === "archived") return false
      if (selectedQuarter && g.quarter !== selectedQuarter) return false
      if (selectedCategory && g.category !== selectedCategory) return false
      return true
    })
    .sort((a, b) => {
      // Completed at bottom, then by progress
      if (a.status === "completed" && b.status !== "completed") return 1
      if (a.status !== "completed" && b.status === "completed") return -1
      return getGoalProgress(b) - getGoalProgress(a)
    })

  // Stats
  const activeGoals = goals.filter((g) => g.status === "active")
  const completedGoals = goals.filter((g) => g.status === "completed")
  const onTrackCount = activeGoals.filter((g) => getGoalRisk(g) === "on-track").length
  const atRiskCount = activeGoals.filter((g) => getGoalRisk(g) !== "on-track").length
  const overallProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((acc, g) => acc + getGoalProgress(g), 0) / activeGoals.length)
    : 0

  const toggleExpand = (id: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const openGoalDialog = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal)
      setGoalFormData({
        title: goal.title,
        description: goal.description,
        quarter: goal.quarter,
        category: goal.category,
        deadline: goal.deadline || "",
      })
    } else {
      setEditingGoal(null)
      setGoalFormData({ title: "", description: "", quarter: "Q1 2025", category: "business", deadline: "" })
    }
    setIsGoalDialogOpen(true)
  }

  const handleSaveGoal = () => {
    if (editingGoal) {
      setGoals((prev) =>
        prev.map((g) =>
          g.id === editingGoal.id
            ? { ...g, ...goalFormData, deadline: goalFormData.deadline || undefined }
            : g
        )
      )
    } else {
      const newGoal: Goal = {
        id: crypto.randomUUID(),
        ...goalFormData,
        deadline: goalFormData.deadline || undefined,
        status: "active",
        keyResults: [],
        createdAt: new Date(),
      }
      setGoals((prev) => [newGoal, ...prev])
    }
    setIsGoalDialogOpen(false)
  }

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }

  const handleArchiveGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "archived" as const } : g))
    )
  }

  const handleCompleteGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "completed" as const } : g))
    )
  }

  const handleReactivateGoal = (id: string) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: "active" as const } : g))
    )
  }

  const openKRDialog = (goalId: string) => {
    setKrTargetGoalId(goalId)
    setKrFormData({ title: "", target: "", unit: "" })
    setIsKRDialogOpen(true)
  }

  const handleAddKR = () => {
    if (!krTargetGoalId) return
    const newKR: KeyResult = {
      id: crypto.randomUUID(),
      title: krFormData.title,
      target: Number(krFormData.target),
      current: 0,
      unit: krFormData.unit,
    }
    setGoals((prev) =>
      prev.map((g) =>
        g.id === krTargetGoalId
          ? { ...g, keyResults: [...g.keyResults, newKR] }
          : g
      )
    )
    setIsKRDialogOpen(false)
  }

  const handleDeleteKR = (goalId: string, krId: string) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? { ...g, keyResults: g.keyResults.filter((kr) => kr.id !== krId) }
          : g
      )
    )
  }

  const updateKeyResult = (goalId: string, krId: string, value: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId
          ? {
              ...g,
              keyResults: g.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, current: value } : kr
              ),
            }
          : g
      )
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Goals & OKRs</h1>
            <p className="text-sm text-muted-foreground">Set objectives and track key results</p>
          </div>
        </div>
        <Button onClick={() => openGoalDialog()}>
          <Plus className="size-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Overall Progress"
          value={`${overallProgress}%`}
          icon={Target}
        />
        <StatCard
          title="On Track"
          value={onTrackCount}
          icon={TrendingUp}
          subtitle={`of ${activeGoals.length} active`}
        />
        <StatCard
          title="Needs Attention"
          value={atRiskCount}
          icon={AlertTriangle}
          className={atRiskCount > 0 ? "border-orange-200" : ""}
        />
        <StatCard
          title="Completed"
          value={completedGoals.length}
          icon={Check}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Select
          value={selectedQuarter || "all"}
          onValueChange={(v) => setSelectedQuarter(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quarters</SelectItem>
            {quarters.map((q) => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-1">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className={showArchived ? "text-primary" : "text-muted-foreground"}
        >
          <Archive className="size-4 mr-1" />
          Archived
        </Button>
      </div>

      {/* Goals List */}
      <div className="flex flex-col gap-4">
        {filteredGoals.map((goal) => {
          const progress = getGoalProgress(goal)
          const isExpanded = expandedGoals.has(goal.id)
          const risk = getGoalRisk(goal)
          const isCompleted = goal.status === "completed"
          const isArchived = goal.status === "archived"

          return (
            <div
              key={goal.id}
              className={cn(
                "rounded-lg border bg-card overflow-hidden",
                isCompleted && "opacity-75",
                isArchived && "opacity-50"
              )}
            >
              <div className="flex items-center gap-2 p-4">
                <button
                  type="button"
                  onClick={() => toggleExpand(goal.id)}
                  className="shrink-0"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="size-5 text-muted-foreground" />
                  )}
                </button>

                <div
                  className={cn("size-3 rounded-full shrink-0", categoryConfig[goal.category].color)}
                />

                <div className="flex-1 min-w-0" onClick={() => toggleExpand(goal.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("font-medium", isCompleted && "line-through")}>{goal.title}</span>
                    <Badge variant="outline" className="text-xs">{goal.quarter}</Badge>
                    {isCompleted && (
                      <Badge className="text-xs bg-green-100 text-green-700">Completed</Badge>
                    )}
                    {isArchived && (
                      <Badge className="text-xs bg-gray-100 text-gray-600">Archived</Badge>
                    )}
                    {!isCompleted && !isArchived && risk === "at-risk" && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-700">At Risk</Badge>
                    )}
                    {!isCompleted && !isArchived && risk === "behind" && (
                      <Badge className="text-xs bg-red-100 text-red-700">Behind</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{goal.description}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24 hidden sm:block">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{progress}%</span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openGoalDialog(goal)}>
                        <Edit2 className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openKRDialog(goal.id)}>
                        <Plus className="size-4 mr-2" />
                        Add Key Result
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {goal.status === "active" && (
                        <DropdownMenuItem onClick={() => handleCompleteGoal(goal.id)}>
                          <Check className="size-4 mr-2" />
                          Mark Complete
                        </DropdownMenuItem>
                      )}
                      {goal.status !== "active" && (
                        <DropdownMenuItem onClick={() => handleReactivateGoal(goal.id)}>
                          <TrendingUp className="size-4 mr-2" />
                          Reactivate
                        </DropdownMenuItem>
                      )}
                      {goal.status !== "archived" && (
                        <DropdownMenuItem onClick={() => handleArchiveGoal(goal.id)}>
                          <Archive className="size-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-muted/30 p-4">
                  {goal.deadline && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Deadline: {new Date(goal.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Key Results</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openKRDialog(goal.id)}
                    >
                      <Plus className="size-3 mr-1" />
                      Add
                    </Button>
                  </div>

                  {goal.keyResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No key results yet. Add one to track progress.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {goal.keyResults.map((kr) => {
                        const krProgress = Math.min((kr.current / kr.target) * 100, 100)
                        const isComplete = kr.current >= kr.target

                        return (
                          <div key={kr.id} className="flex items-center gap-3 group">
                            {isComplete ? (
                              <Check className="size-4 text-green-500 shrink-0" />
                            ) : (
                              <Circle className="size-4 text-muted-foreground shrink-0" />
                            )}
                            <span className={cn("flex-1 text-sm", isComplete && "line-through text-muted-foreground")}>
                              {kr.title}
                            </span>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={kr.current}
                                onChange={(e) => updateKeyResult(goal.id, kr.id, Number(e.target.value))}
                                className="w-20 h-8 text-sm"
                                disabled={isCompleted || isArchived}
                              />
                              <span className="text-sm text-muted-foreground whitespace-nowrap">
                                / {kr.target} {kr.unit}
                              </span>
                            </div>
                            <div className="w-16 hidden sm:block">
                              <Progress value={krProgress} className="h-1.5" />
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteKR(goal.id, kr.id)}
                            >
                              <Trash2 className="size-3 text-muted-foreground" />
                            </Button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredGoals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No goals found</h3>
          <p className="text-muted-foreground">
            {goals.length === 0
              ? "Create your first goal to start tracking progress"
              : "Try adjusting your filters"}
          </p>
        </div>
      )}

      {/* Goal Dialog */}
      <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={goalFormData.title}
                onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })}
                placeholder="Launch MVP..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={goalFormData.description}
                onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })}
                placeholder="What do you want to achieve?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Quarter</Label>
                <Select
                  value={goalFormData.quarter}
                  onValueChange={(v) => setGoalFormData({ ...goalFormData, quarter: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((q) => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select
                  value={goalFormData.category}
                  onValueChange={(v) => setGoalFormData({ ...goalFormData, category: v as Goal["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="deadline">Deadline (optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={goalFormData.deadline}
                onChange={(e) => setGoalFormData({ ...goalFormData, deadline: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGoalDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveGoal} disabled={!goalFormData.title.trim()}>
                {editingGoal ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Key Result Dialog */}
      <Dialog open={isKRDialogOpen} onOpenChange={setIsKRDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Key Result</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="kr-title">What will you measure?</Label>
              <Input
                id="kr-title"
                value={krFormData.title}
                onChange={(e) => setKrFormData({ ...krFormData, title: e.target.value })}
                placeholder="e.g., Get beta users"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="kr-target">Target</Label>
                <Input
                  id="kr-target"
                  type="number"
                  value={krFormData.target}
                  onChange={(e) => setKrFormData({ ...krFormData, target: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="kr-unit">Unit</Label>
                <Input
                  id="kr-unit"
                  value={krFormData.unit}
                  onChange={(e) => setKrFormData({ ...krFormData, unit: e.target.value })}
                  placeholder="users, %, hours..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsKRDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddKR}
                disabled={!krFormData.title.trim() || !krFormData.target || !krFormData.unit.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
