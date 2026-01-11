import { useState, useMemo } from "react"
import {
  Plus,
  Target,
  Edit3,
  Trash2,
  MoreVertical,
  Calendar as CalendarIcon,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Flame,
  TrendingUp,
  Archive,
  RotateCcw,
  Check,
  Dumbbell,
  BookOpen,
  Heart,
  Droplets,
  Apple,
  Pencil,
  Moon,
  Music,
  Sparkles,
  Pill,
  Sunrise,
  Sun,
  Clock,
  type LucideIcon,
} from "lucide-react"
import { StatCard, StreakFlame } from "@/components/cheval-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"

interface Habit {
  id: string
  name: string
  description: string
  color: string
  icon: string
  frequency: "daily" | "weekly" | "custom"
  targetPerPeriod: number
  customDays: number[]
  timeOfDay: "morning" | "afternoon" | "evening" | "anytime"
  completedDates: string[]
  archived: boolean
  createdAt: Date
  bestStreak: number
}

const habitColors = [
  { id: "red", hex: "#ef4444", name: "Red" },
  { id: "orange", hex: "#f97316", name: "Orange" },
  { id: "yellow", hex: "#eab308", name: "Yellow" },
  { id: "green", hex: "#22c55e", name: "Green" },
  { id: "cyan", hex: "#06b6d4", name: "Cyan" },
  { id: "blue", hex: "#3b82f6", name: "Blue" },
  { id: "violet", hex: "#8b5cf6", name: "Violet" },
  { id: "pink", hex: "#ec4899", name: "Pink" },
]

const habitIcons: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "dumbbell", icon: Dumbbell, label: "Exercise" },
  { id: "book", icon: BookOpen, label: "Reading" },
  { id: "heart", icon: Heart, label: "Wellness" },
  { id: "droplets", icon: Droplets, label: "Hydration" },
  { id: "apple", icon: Apple, label: "Nutrition" },
  { id: "target", icon: Target, label: "Goals" },
  { id: "pencil", icon: Pencil, label: "Writing" },
  { id: "moon", icon: Moon, label: "Sleep" },
  { id: "music", icon: Music, label: "Music" },
  { id: "sparkles", icon: Sparkles, label: "Mindfulness" },
  { id: "pill", icon: Pill, label: "Medication" },
  { id: "flame", icon: Flame, label: "Streak" },
]

const timeOfDayOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "morning", label: "Morning", icon: Sunrise },
  { value: "afternoon", label: "Afternoon", icon: Sun },
  { value: "evening", label: "Evening", icon: Moon },
  { value: "anytime", label: "Anytime", icon: Clock },
]

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getHabitIcon(iconId: string): LucideIcon {
  const found = habitIcons.find(i => i.id === iconId)
  return found?.icon || Target
}

const today = new Date()
const todayStr = today.toISOString().split("T")[0]

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0
  const sorted = [...completedDates].sort().reverse()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = getDateStr(yesterday)

  if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) return 0

  let streak = 0
  let currentDate = new Date(sorted[0])

  for (const dateStr of sorted) {
    const date = new Date(dateStr)
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / 86400000)
    if (diffDays <= 1) {
      streak++
      currentDate = date
    } else break
  }
  return streak
}

function getCompletionsThisWeek(completedDates: string[]): number {
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  return completedDates.filter(dateStr => {
    const date = new Date(dateStr)
    return date >= weekStart && date <= today
  }).length
}

function generateInitialHabits(): Habit[] {
  const dates: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dates.push(getDateStr(d))
  }

  return [
    {
      id: "1",
      name: "Morning Exercise",
      description: "30 minutes of cardio or strength training",
      color: "#22c55e",
      icon: "dumbbell",
      frequency: "daily",
      targetPerPeriod: 7,
      customDays: [],
      timeOfDay: "morning",
      completedDates: dates.filter((_, i) => i === 0 || i === 1 || i === 2 || i === 4 || i === 5 || i === 7 || i === 8 || i === 10 || i === 12),
      archived: false,
      createdAt: new Date(Date.now() - 30 * 86400000),
      bestStreak: 5,
    },
    {
      id: "2",
      name: "Read 30 minutes",
      description: "Read non-fiction or educational content",
      color: "#3b82f6",
      icon: "book",
      frequency: "daily",
      targetPerPeriod: 5,
      customDays: [],
      timeOfDay: "evening",
      completedDates: dates.filter((_, i) => i === 1 || i === 2 || i === 3 || i === 6 || i === 8 || i === 11 || i === 14),
      archived: false,
      createdAt: new Date(Date.now() - 25 * 86400000),
      bestStreak: 4,
    },
    {
      id: "3",
      name: "Meditate",
      description: "10 minutes of mindfulness meditation",
      color: "#8b5cf6",
      icon: "sparkles",
      frequency: "daily",
      targetPerPeriod: 7,
      customDays: [],
      timeOfDay: "morning",
      completedDates: dates.filter((_, i) => i === 0 || i === 1 || i === 3 || i === 4 || i === 5 || i === 9 || i === 10),
      archived: false,
      createdAt: new Date(Date.now() - 20 * 86400000),
      bestStreak: 3,
    },
    {
      id: "4",
      name: "Drink Water",
      description: "8 glasses throughout the day",
      color: "#06b6d4",
      icon: "droplets",
      frequency: "daily",
      targetPerPeriod: 7,
      customDays: [],
      timeOfDay: "anytime",
      completedDates: dates.filter((_, i) => i === 0 || i === 2 || i === 5 || i === 7),
      archived: false,
      createdAt: new Date(Date.now() - 15 * 86400000),
      bestStreak: 2,
    },
    {
      id: "5",
      name: "Weekly Review",
      description: "Review goals and plan the week ahead",
      color: "#f97316",
      icon: "target",
      frequency: "weekly",
      targetPerPeriod: 1,
      customDays: [0], // Sunday
      timeOfDay: "evening",
      completedDates: dates.filter((_, i) => i === 7 || i === 14 || i === 21),
      archived: false,
      createdAt: new Date(Date.now() - 28 * 86400000),
      bestStreak: 3,
    },
  ]
}

type ViewMode = "today" | "calendar" | "stats"

export function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(generateInitialHabits)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>("today")
  const [showArchived, setShowArchived] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: habitColors[3].hex,
    icon: "target",
    frequency: "daily" as "daily" | "weekly" | "custom",
    targetPerPeriod: 7,
    customDays: [] as number[],
    timeOfDay: "anytime" as "morning" | "afternoon" | "evening" | "anytime",
  })

  const activeHabits = useMemo(() => habits.filter(h => !h.archived), [habits])
  const archivedHabits = useMemo(() => habits.filter(h => h.archived), [habits])

  const stats = useMemo(() => {
    const completedToday = activeHabits.filter(h => h.completedDates.includes(todayStr)).length
    const totalActive = activeHabits.length
    const longestCurrentStreak = Math.max(...activeHabits.map(h => getStreak(h.completedDates)), 0)
    const allTimeBestStreak = Math.max(...habits.map(h => h.bestStreak), 0)
    const completionRate = totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0

    // Weekly stats
    const weeklyCompletions = activeHabits.reduce((sum, h) => sum + getCompletionsThisWeek(h.completedDates), 0)
    const weeklyTarget = activeHabits.reduce((sum, h) => sum + Math.min(h.targetPerPeriod, 7), 0)

    return {
      completedToday,
      totalActive,
      longestCurrentStreak,
      allTimeBestStreak,
      completionRate,
      weeklyCompletions,
      weeklyTarget,
    }
  }, [habits, activeHabits])

  const handleToggleDate = (habitId: string, dateStr: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== habitId) return h
      const hasDate = h.completedDates.includes(dateStr)
      const newDates = hasDate
        ? h.completedDates.filter(d => d !== dateStr)
        : [...h.completedDates, dateStr]

      const newStreak = getStreak(newDates)
      const newBestStreak = Math.max(h.bestStreak, newStreak)

      return { ...h, completedDates: newDates, bestStreak: newBestStreak }
    }))
  }

  const handleCreate = () => {
    setEditingHabit(null)
    setFormData({
      name: "",
      description: "",
      color: habitColors[3].hex,
      icon: "target",
      frequency: "daily",
      targetPerPeriod: 7,
      customDays: [],
      timeOfDay: "anytime",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit)
    setFormData({
      name: habit.name,
      description: habit.description,
      color: habit.color,
      icon: habit.icon,
      frequency: habit.frequency,
      targetPerPeriod: habit.targetPerPeriod,
      customDays: habit.customDays,
      timeOfDay: habit.timeOfDay,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingHabit) {
      setHabits(prev => prev.map(h =>
        h.id === editingHabit.id
          ? { ...h, ...formData }
          : h
      ))
    } else {
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        ...formData,
        completedDates: [],
        archived: false,
        createdAt: new Date(),
        bestStreak: 0,
      }
      setHabits(prev => [...prev, newHabit])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const handleArchive = (id: string) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, archived: !h.archived } : h
    ))
  }

  const handleReset = (id: string) => {
    setHabits(prev => prev.map(h =>
      h.id === id ? { ...h, completedDates: [], bestStreak: 0 } : h
    ))
  }

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }, [calendarMonth])

  const getCompletionCountForDate = (dateStr: string): number => {
    if (selectedHabitForCalendar) {
      const habit = habits.find(h => h.id === selectedHabitForCalendar)
      return habit?.completedDates.includes(dateStr) ? 1 : 0
    }
    return activeHabits.filter(h => h.completedDates.includes(dateStr)).length
  }

  const displayedHabits = showArchived ? archivedHabits : activeHabits

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
            <p className="text-sm text-muted-foreground">Build better routines, one day at a time</p>
          </div>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          New Habit
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Completed Today"
          value={`${stats.completedToday}/${stats.totalActive}`}
          icon={Target}
        />
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <span className="text-sm text-muted-foreground">Today's Progress</span>
          <Progress value={stats.completionRate} className="h-2" />
          <span className="text-2xl font-bold">{stats.completionRate}%</span>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <span className="text-sm text-muted-foreground">Current Streak</span>
          <div className="flex items-center gap-2">
            <StreakFlame count={stats.longestCurrentStreak} size="lg" />
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-sm">This Week</span>
          </div>
          <span className="text-2xl font-bold">{stats.weeklyCompletions}/{stats.weeklyTarget}</span>
        </div>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="today" className="gap-2">
              <Target className="size-4" />
              Today
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarIcon className="size-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="stats" className="gap-2">
              <BarChart3 className="size-4" />
              Stats
            </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="size-4 mr-2" />
            {showArchived ? "Show Active" : `Archived (${archivedHabits.length})`}
          </Button>
        </div>

        {/* Today View */}
        <TabsContent value="today" className="mt-4">
          {displayedHabits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <OrangeLogo className="size-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">
                {showArchived ? "No archived habits" : "No habits yet"}
              </h3>
              <p className="text-muted-foreground">
                {showArchived ? "Archived habits will appear here" : "Create your first habit to start tracking"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {displayedHabits.map((habit) => {
                const streak = getStreak(habit.completedDates)
                const completedToday = habit.completedDates.includes(todayStr)
                const weeklyProgress = getCompletionsThisWeek(habit.completedDates)
                const TimeIcon = timeOfDayOptions.find(t => t.value === habit.timeOfDay)?.icon
                const HabitIcon = getHabitIcon(habit.icon)

                return (
                  <div
                    key={habit.id}
                    className={cn(
                      "group flex items-center gap-4 rounded-lg border bg-card p-4 transition-all",
                      habit.archived && "opacity-60"
                    )}
                    style={completedToday ? { boxShadow: `0 0 0 2px var(--background), 0 0 0 4px ${habit.color}` } : undefined}
                  >
                    {/* Toggle button */}
                    <button
                      onClick={() => handleToggleDate(habit.id, todayStr)}
                      className={cn(
                        "flex items-center justify-center size-10 rounded-full border-2 transition-all hover:scale-105",
                        completedToday ? "text-white" : "text-muted-foreground hover:border-current"
                      )}
                      style={{
                        backgroundColor: completedToday ? habit.color : "transparent",
                        borderColor: habit.color,
                      }}
                      disabled={habit.archived}
                    >
                      {completedToday ? <Check className="size-5" /> : <HabitIcon className="size-5" />}
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{habit.name}</h3>
                        {streak > 0 && (
                          <Badge variant="secondary" className="gap-1">
                            <Flame className="size-3 text-orange-500" />
                            {streak}
                          </Badge>
                        )}
                        {habit.archived && <Badge variant="outline">Archived</Badge>}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          {TimeIcon && <TimeIcon className="size-3" />} {habit.timeOfDay}
                        </span>
                        <span>•</span>
                        <span>{weeklyProgress}/{habit.targetPerPeriod} this week</span>
                      </div>
                    </div>

                    {/* Weekly dots */}
                    <div className="hidden sm:flex items-center gap-1">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const d = new Date(today)
                        d.setDate(d.getDate() - (6 - i))
                        const dateStr = getDateStr(d)
                        const completed = habit.completedDates.includes(dateStr)
                        const isToday = dateStr === todayStr

                        return (
                          <button
                            key={i}
                            onClick={() => handleToggleDate(habit.id, dateStr)}
                            disabled={habit.archived}
                            className={cn(
                              "size-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                              completed ? "text-white" : "bg-muted text-muted-foreground",
                              isToday && !completed && "ring-2 ring-primary ring-offset-1",
                              !habit.archived && "hover:scale-110"
                            )}
                            style={{ backgroundColor: completed ? habit.color : undefined }}
                            title={d.toLocaleDateString()}
                          >
                            {weekDays[d.getDay()][0]}
                          </button>
                        )
                      })}
                    </div>

                    {/* Best streak */}
                    <div className="hidden lg:flex flex-col items-center text-xs text-muted-foreground">
                      <span>Best</span>
                      <span className="font-bold text-foreground">{habit.bestStreak}</span>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(habit)}>
                          <Edit3 className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedHabitForCalendar(habit.id)
                          setViewMode("calendar")
                        }}>
                          <CalendarIcon className="size-4 mr-2" />
                          View Calendar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleArchive(habit.id)}>
                          <Archive className="size-4 mr-2" />
                          {habit.archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleReset(habit.id)}>
                          <RotateCcw className="size-4 mr-2" />
                          Reset Progress
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(habit.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-4">
          <div className="rounded-lg border bg-card p-4">
            {/* Calendar header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <h3 className="font-semibold min-w-[140px] text-center">
                  {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
              <Select
                value={selectedHabitForCalendar || "all"}
                onValueChange={(v) => setSelectedHabitForCalendar(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All habits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Habits</SelectItem>
                  {activeHabits.map((h) => {
                    const HIcon = getHabitIcon(h.icon)
                    return (
                      <SelectItem key={h.id} value={h.id}>
                        <span className="flex items-center gap-2">
                          <HIcon className="size-4" />
                          {h.name}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, i) => {
                if (!date) {
                  return <div key={`empty-${i}`} className="aspect-square" />
                }

                const dateStr = getDateStr(date)
                const count = getCompletionCountForDate(dateStr)
                const maxCount = selectedHabitForCalendar ? 1 : activeHabits.length
                const intensity = maxCount > 0 ? count / maxCount : 0
                const isToday = dateStr === todayStr
                const isFuture = date > today

                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      if (selectedHabitForCalendar && !isFuture) {
                        handleToggleDate(selectedHabitForCalendar, dateStr)
                      }
                    }}
                    disabled={!selectedHabitForCalendar || isFuture}
                    className={cn(
                      "aspect-square rounded-md flex flex-col items-center justify-center text-sm transition-all",
                      isToday && "ring-2 ring-primary",
                      isFuture && "text-muted-foreground/50",
                      !isFuture && count > 0 && "text-white",
                      selectedHabitForCalendar && !isFuture && "hover:scale-105 cursor-pointer"
                    )}
                    style={{
                      backgroundColor: !isFuture && count > 0
                        ? selectedHabitForCalendar
                          ? habits.find(h => h.id === selectedHabitForCalendar)?.color
                          : `rgba(34, 197, 94, ${0.3 + intensity * 0.7})`
                        : undefined,
                    }}
                  >
                    <span className="font-medium">{date.getDate()}</span>
                    {!selectedHabitForCalendar && count > 0 && (
                      <span className="text-xs">{count}/{maxCount}</span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-4 rounded bg-muted" />
                <span>No completions</span>
              </div>
              <div className="flex items-center gap-1">
                {[0.3, 0.5, 0.7, 1].map((intensity, i) => (
                  <div
                    key={i}
                    className="size-4 rounded"
                    style={{ backgroundColor: `rgba(34, 197, 94, ${intensity})` }}
                  />
                ))}
                <span className="ml-1">More</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Stats View */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeHabits.map((habit) => {
              const streak = getStreak(habit.completedDates)
              const weeklyProgress = getCompletionsThisWeek(habit.completedDates)
              const totalCompletions = habit.completedDates.length
              const daysSinceCreation = Math.ceil((today.getTime() - habit.createdAt.getTime()) / 86400000)
              const overallRate = daysSinceCreation > 0
                ? Math.round((totalCompletions / daysSinceCreation) * 100)
                : 0
              const StatsIcon = getHabitIcon(habit.icon)

              return (
                <div
                  key={habit.id}
                  className="rounded-lg border bg-card p-4"
                  style={{ borderTopWidth: "4px", borderTopColor: habit.color }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <StatsIcon className="size-6" style={{ color: habit.color }} />
                    <h3 className="font-semibold">{habit.name}</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Streak</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Flame className={cn("size-4", streak > 0 && "text-orange-500")} />
                        <span className="font-bold text-lg">{streak}</span>
                        <span className="text-muted-foreground">days</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Best Streak</span>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="size-4 text-green-500" />
                        <span className="font-bold text-lg">{habit.bestStreak}</span>
                        <span className="text-muted-foreground">days</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">This Week</span>
                      <div className="mt-1">
                        <span className="font-bold text-lg">{weeklyProgress}</span>
                        <span className="text-muted-foreground">/{habit.targetPerPeriod}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total</span>
                      <div className="mt-1">
                        <span className="font-bold text-lg">{totalCompletions}</span>
                        <span className="text-muted-foreground"> times</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Overall completion</span>
                      <span className="font-medium">{overallRate}%</span>
                    </div>
                    <Progress value={overallRate} className="h-2" />
                  </div>
                </div>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingHabit ? "Edit Habit" : "New Habit"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Morning Exercise"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about your habit..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {habitIcons.map((iconItem) => {
                    const IconComponent = iconItem.icon
                    return (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: iconItem.id })}
                        className={cn(
                          "size-9 rounded-lg flex items-center justify-center transition-all hover:scale-110",
                          formData.icon === iconItem.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                        title={iconItem.label}
                      >
                        <IconComponent className="size-5" />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.hex })}
                      className={cn(
                        "size-8 rounded-full transition-transform hover:scale-110",
                        formData.color === color.hex && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Time of Day</Label>
              <div className="flex gap-2">
                {timeOfDayOptions.map((option) => {
                  const TimeOfDayIcon = option.icon
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeOfDay: option.value as typeof formData.timeOfDay })}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                        formData.timeOfDay === option.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <TimeOfDayIcon className="size-5" />
                      <span className="text-xs">{option.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Weekly Target</Label>
              <Select
                value={formData.targetPerPeriod.toString()}
                onValueChange={(v) => setFormData({ ...formData, targetPerPeriod: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} {n === 1 ? "day" : "days"} per week
                      {n === 7 && " (daily)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim()}>
                {editingHabit ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
