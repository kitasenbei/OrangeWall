import { useState, useEffect, useRef, useMemo } from "react"
import {
  Play,
  Pause,
  Square,
  Clock,
  Calendar,
  BarChart3,
  Plus,
  Edit3,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Target,
  TrendingUp,
  FolderPlus,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { IconButton, StatCard } from "@/components/cheval-ui"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"

interface Project {
  id: string
  name: string
  color: string
}

interface TimeEntry {
  id: string
  projectId: string
  description: string
  tags: string[]
  startTime: Date
  endTime: Date | null
  duration: number // in seconds
}

interface TimeGoals {
  dailyGoal: number // in minutes
  weeklyGoal: number // in minutes
}

const projectColors = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
]

const defaultProjects: Project[] = [
  { id: "orangewall", name: "Orangewall", color: "#f97316" },
  { id: "client", name: "Client Work", color: "#3b82f6" },
  { id: "learning", name: "Learning", color: "#22c55e" },
  { id: "admin", name: "Admin", color: "#8b5cf6" },
  { id: "marketing", name: "Marketing", color: "#ec4899" },
  { id: "other", name: "Other", color: "#6b7280" },
]

const defaultTags = ["design", "development", "meeting", "research", "planning", "review"]

function generateMockEntries(projects: Project[]): TimeEntry[] {
  const entries: TimeEntry[] = []
  const now = new Date()

  for (let day = 0; day < 7; day++) {
    const numEntries = Math.floor(Math.random() * 4) + 2
    for (let i = 0; i < numEntries; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() - day)
      const hour = 9 + Math.floor(Math.random() * 8)
      date.setHours(hour, Math.floor(Math.random() * 60), 0, 0)

      const duration = (30 + Math.floor(Math.random() * 90)) * 60 // 30-120 minutes
      const endDate = new Date(date.getTime() + duration * 1000)

      const project = projects[Math.floor(Math.random() * projects.length)]
      const descriptions = [
        "Working on new features",
        "Bug fixes and testing",
        "Code review",
        "Planning session",
        "Documentation updates",
        "Client meeting",
        "Research and learning",
      ]

      entries.push({
        id: crypto.randomUUID(),
        projectId: project.id,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        tags: defaultTags.filter(() => Math.random() > 0.7).slice(0, 2),
        startTime: date,
        endTime: endDate,
        duration,
      })
    }
  }

  return entries.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

function formatDurationShort(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

type ViewMode = "timer" | "entries" | "reports"

export function TimeTrackerPage() {
  const [projects, setProjects] = useState<Project[]>(defaultProjects)
  const [entries, setEntries] = useState<TimeEntry[]>(() => generateMockEntries(defaultProjects))
  const [goals, setGoals] = useState<TimeGoals>({ dailyGoal: 360, weeklyGoal: 2000 }) // 6h daily, ~33h weekly
  const [viewMode, setViewMode] = useState<ViewMode>("timer")
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Timer state
  const [isRunning, setIsRunning] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<Partial<TimeEntry>>({
    projectId: "orangewall",
    description: "",
    tags: [],
  })
  const [elapsed, setElapsed] = useState(0)
  const [startTime, setStartTime] = useState<Date | null>(null)

  // Dialog state
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false)
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isGoalsDialogOpen, setIsGoalsDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [entryFormData, setEntryFormData] = useState({
    projectId: "orangewall",
    description: "",
    tags: [] as string[],
    date: "",
    startTime: "",
    endTime: "",
  })
  const [projectFormData, setProjectFormData] = useState({ name: "", color: projectColors[0].hex })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const today = useMemo(() => new Date(), [])
  const todayStr = getDateStr(today)
  const weekStart = getWeekStart(today)

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000))
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, startTime])

  const todayEntries = useMemo(
    () => entries.filter((e) => getDateStr(e.startTime) === todayStr),
    [entries, todayStr]
  )

  const weekEntries = useMemo(
    () => entries.filter((e) => e.startTime >= weekStart),
    [entries, weekStart]
  )

  const todayTotal = useMemo(
    () => todayEntries.reduce((acc, e) => acc + e.duration, 0) + (isRunning ? elapsed : 0),
    [todayEntries, isRunning, elapsed]
  )

  const weekTotal = useMemo(
    () => weekEntries.reduce((acc, e) => acc + e.duration, 0) + (isRunning ? elapsed : 0),
    [weekEntries, isRunning, elapsed]
  )

  const dailyProgress = Math.min(100, Math.round((todayTotal / 60 / goals.dailyGoal) * 100))
  const weeklyProgress = Math.min(100, Math.round((weekTotal / 60 / goals.weeklyGoal) * 100))

  const projectStats = useMemo(() => {
    const stats: Record<string, number> = {}
    weekEntries.forEach((e) => {
      stats[e.projectId] = (stats[e.projectId] || 0) + e.duration
    })
    return Object.entries(stats)
      .map(([id, duration]) => ({
        project: projects.find((p) => p.id === id) || { id, name: "Unknown", color: "#6b7280" },
        duration,
      }))
      .sort((a, b) => b.duration - a.duration)
  }, [weekEntries, projects])

  // Group entries by date for the entries view
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimeEntry[]> = {}
    entries.forEach((e) => {
      const dateStr = getDateStr(e.startTime)
      if (!groups[dateStr]) groups[dateStr] = []
      groups[dateStr].push(e)
    })
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 7)
  }, [entries])

  const handleStart = () => {
    setStartTime(new Date())
    setElapsed(0)
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleResume = () => {
    if (startTime) {
      setStartTime(new Date(Date.now() - elapsed * 1000))
      setIsRunning(true)
    }
  }

  const handleStop = () => {
    if (startTime && elapsed > 0) {
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        projectId: currentEntry.projectId || "other",
        description: currentEntry.description || "Untitled",
        tags: currentEntry.tags || [],
        startTime,
        endTime: new Date(),
        duration: elapsed,
      }
      setEntries((prev) => [newEntry, ...prev])
    }
    setIsRunning(false)
    setStartTime(null)
    setElapsed(0)
    setCurrentEntry({ projectId: "orangewall", description: "", tags: [] })
  }

  const handleOpenAddEntry = () => {
    setEditingEntry(null)
    const now = new Date()
    setEntryFormData({
      projectId: "orangewall",
      description: "",
      tags: [],
      date: getDateStr(now),
      startTime: formatTime(new Date(now.getTime() - 3600000)),
      endTime: formatTime(now),
    })
    setIsEntryDialogOpen(true)
  }

  const handleOpenEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setEntryFormData({
      projectId: entry.projectId,
      description: entry.description,
      tags: entry.tags,
      date: getDateStr(entry.startTime),
      startTime: formatTime(entry.startTime),
      endTime: entry.endTime ? formatTime(entry.endTime) : "",
    })
    setIsEntryDialogOpen(true)
  }

  const handleSaveEntry = () => {
    const [startHour, startMin] = entryFormData.startTime.split(":").map(Number)
    const [endHour, endMin] = entryFormData.endTime.split(":").map(Number)
    const dateObj = new Date(entryFormData.date)

    const start = new Date(dateObj)
    start.setHours(startHour, startMin, 0, 0)

    const end = new Date(dateObj)
    end.setHours(endHour, endMin, 0, 0)

    const duration = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000))

    if (editingEntry) {
      setEntries((prev) =>
        prev.map((e) =>
          e.id === editingEntry.id
            ? {
                ...e,
                projectId: entryFormData.projectId,
                description: entryFormData.description,
                tags: entryFormData.tags,
                startTime: start,
                endTime: end,
                duration,
              }
            : e
        )
      )
    } else {
      const newEntry: TimeEntry = {
        id: crypto.randomUUID(),
        projectId: entryFormData.projectId,
        description: entryFormData.description,
        tags: entryFormData.tags,
        startTime: start,
        endTime: end,
        duration,
      }
      setEntries((prev) => [newEntry, ...prev].sort((a, b) => b.startTime.getTime() - a.startTime.getTime()))
    }
    setIsEntryDialogOpen(false)
  }

  const handleDeleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const handleAddProject = () => {
    if (!projectFormData.name.trim()) return
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectFormData.name,
      color: projectFormData.color,
    }
    setProjects((prev) => [...prev, newProject])
    setProjectFormData({ name: "", color: projectColors[0].hex })
    setIsProjectDialogOpen(false)
  }

  const getProjectById = (id: string) => projects.find((p) => p.id === id)

  const toggleTag = (tag: string) => {
    setEntryFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const toggleCurrentTag = (tag: string) => {
    setCurrentEntry((prev) => ({
      ...prev,
      tags: (prev.tags || []).includes(tag)
        ? (prev.tags || []).filter((t) => t !== tag)
        : [...(prev.tags || []), tag],
    }))
  }

  // Calendar data
  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const days: (Date | null)[] = []

    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }

    return days
  }, [calendarDate])

  const getDayTotal = (date: Date): number => {
    const dateStr = getDateStr(date)
    return entries
      .filter((e) => getDateStr(e.startTime) === dateStr)
      .reduce((acc, e) => acc + e.duration, 0)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Time Tracker</h1>
            <p className="text-sm text-muted-foreground">Track where your time goes</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsGoalsDialogOpen(true)}>
            <Target className="size-4 mr-2" />
            Goals
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsProjectDialogOpen(true)}>
            <FolderPlus className="size-4 mr-2" />
            Project
          </Button>
          <Button onClick={handleOpenAddEntry}>
            <Plus className="size-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Timer */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Input
              placeholder="What are you working on?"
              value={currentEntry.description}
              onChange={(e) => setCurrentEntry({ ...currentEntry, description: e.target.value })}
              className="flex-1"
            />
            <Select
              value={currentEntry.projectId}
              onValueChange={(v) => setCurrentEntry({ ...currentEntry, projectId: v })}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-mono font-bold min-w-32 text-center">
                {formatDuration(elapsed)}
              </span>
              {!isRunning && elapsed === 0 && (
                <IconButton icon={Play} onClick={handleStart} size="lg" label="Start" />
              )}
              {isRunning && (
                <IconButton icon={Pause} onClick={handlePause} size="lg" label="Pause" />
              )}
              {!isRunning && elapsed > 0 && (
                <IconButton icon={Play} onClick={handleResume} size="lg" label="Resume" />
              )}
              {(isRunning || elapsed > 0) && (
                <IconButton icon={Square} onClick={handleStop} size="lg" variant="destructive" label="Stop" />
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {defaultTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleCurrentTag(tag)}
                className={cn(
                  "px-2 py-1 text-xs rounded-full border transition-colors",
                  (currentEntry.tags || []).includes(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:bg-muted"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Today</span>
            <span className="text-xs text-muted-foreground">{dailyProgress}%</span>
          </div>
          <Progress value={dailyProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{formatDurationShort(todayTotal)}</span>
            <span className="text-xs text-muted-foreground">/ {Math.floor(goals.dailyGoal / 60)}h goal</span>
          </div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Week</span>
            <span className="text-xs text-muted-foreground">{weeklyProgress}%</span>
          </div>
          <Progress value={weeklyProgress} className="h-2 mb-2" />
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold">{formatDurationShort(weekTotal)}</span>
            <span className="text-xs text-muted-foreground">/ {Math.floor(goals.weeklyGoal / 60)}h goal</span>
          </div>
        </div>
        <StatCard
          title="Entries Today"
          value={todayEntries.length}
          icon={Clock}
        />
        <StatCard
          title="Top Project"
          value={projectStats[0]?.project.name || "None"}
          icon={TrendingUp}
          subtitle={projectStats[0] ? formatDurationShort(projectStats[0].duration) : ""}
        />
      </div>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="timer" className="gap-2">
            <Clock className="size-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-2">
            <Calendar className="size-4" />
            Entries
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <BarChart3 className="size-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Timer View */}
        <TabsContent value="timer" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Entries */}
            <div className="lg:col-span-2 rounded-lg border bg-card">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Today's Entries</h2>
                <span className="text-sm text-muted-foreground">
                  {todayEntries.length} entries
                </span>
              </div>
              <div className="divide-y max-h-96 overflow-auto">
                {todayEntries.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    No entries today. Start tracking!
                  </div>
                ) : (
                  todayEntries.map((entry) => {
                    const project = getProjectById(entry.projectId)
                    return (
                      <div
                        key={entry.id}
                        className="group flex items-center gap-4 p-4 hover:bg-muted/50"
                      >
                        <div
                          className="size-3 rounded-full shrink-0"
                          style={{ backgroundColor: project?.color || "#6b7280" }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{entry.description}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{project?.name}</span>
                            {entry.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <div className="flex gap-1">
                                  {entry.tags.map((t) => (
                                    <Badge key={t} variant="outline" className="text-xs px-1 py-0">
                                      {t}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{formatDuration(entry.duration)}</p>
                          <p className="text-muted-foreground">
                            {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : "now"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditEntry(entry)}>
                              <Edit3 className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

            {/* Project Breakdown */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h2 className="font-semibold">This Week by Project</h2>
              </div>
              <div className="p-4 space-y-3">
                {projectStats.map(({ project, duration }) => {
                  const percentage = weekTotal > 0 ? (duration / weekTotal) * 100 : 0
                  return (
                    <div key={project.id}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: project.color }} />
                          {project.name}
                        </span>
                        <span className="font-medium">{formatDurationShort(duration)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${percentage}%`, backgroundColor: project.color }}
                        />
                      </div>
                    </div>
                  )
                })}
                {projectStats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No data yet</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Entries View */}
        <TabsContent value="entries" className="mt-4">
          <div className="rounded-lg border bg-card">
            {groupedEntries.map(([dateStr, dayEntries]) => {
              const date = new Date(dateStr)
              const dayTotal = dayEntries.reduce((acc, e) => acc + e.duration, 0)
              const isToday = dateStr === todayStr

              return (
                <div key={dateStr}>
                  <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                    <div>
                      <span className="font-semibold">
                        {isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <Badge variant="secondary">{formatDurationShort(dayTotal)}</Badge>
                  </div>
                  <div className="divide-y">
                    {dayEntries.map((entry) => {
                      const project = getProjectById(entry.projectId)
                      return (
                        <div
                          key={entry.id}
                          className="group flex items-center gap-4 p-4 hover:bg-muted/50"
                        >
                          <div
                            className="size-3 rounded-full shrink-0"
                            style={{ backgroundColor: project?.color || "#6b7280" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{entry.description}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{project?.name}</span>
                              {entry.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {entry.tags.map((t) => (
                                    <Badge key={t} variant="outline" className="text-xs px-1 py-0">
                                      {t}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatDuration(entry.duration)}</p>
                            <p className="text-muted-foreground">
                              {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : "now"}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 opacity-0 group-hover:opacity-100"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditEntry(entry)}>
                                <Edit3 className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteEntry(entry.id)}
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
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Reports View */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar Heatmap */}
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <h3 className="font-semibold">
                  {calendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                  <div key={i} className="text-center text-xs text-muted-foreground py-1">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} className="aspect-square" />

                  const total = getDayTotal(date)
                  const hours = total / 3600
                  const intensity = Math.min(1, hours / 8) // Max at 8 hours
                  const isToday = getDateStr(date) === todayStr

                  return (
                    <div
                      key={getDateStr(date)}
                      className={cn(
                        "aspect-square rounded-sm flex items-center justify-center text-xs",
                        isToday && "ring-2 ring-primary",
                        hours > 0 && "text-white"
                      )}
                      style={{
                        backgroundColor: hours > 0 ? `rgba(59, 130, 246, ${0.3 + intensity * 0.7})` : undefined,
                      }}
                      title={`${date.toLocaleDateString()}: ${formatDurationShort(total)}`}
                    >
                      {date.getDate()}
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  {[0.3, 0.5, 0.7, 1].map((intensity, i) => (
                    <div
                      key={i}
                      className="size-4 rounded"
                      style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">This Week</h3>
              <div className="flex items-end justify-between gap-2 h-48">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(weekStart)
                  date.setDate(date.getDate() + i)
                  const dayTotal = getDayTotal(date)
                  const heightPercent = Math.min(100, (dayTotal / 60 / goals.dailyGoal) * 100)
                  const isToday = getDateStr(date) === todayStr

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatDurationShort(dayTotal)}
                      </span>
                      <div className="w-full bg-muted rounded-t-sm relative" style={{ height: "120px" }}>
                        <div
                          className={cn(
                            "absolute bottom-0 w-full rounded-t-sm transition-all",
                            heightPercent >= 100 ? "bg-green-500" : "bg-primary"
                          )}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className={cn("text-xs", isToday ? "font-bold" : "text-muted-foreground")}>
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Project Pie Chart (simplified as bars) */}
            <div className="rounded-lg border bg-card p-4 lg:col-span-2">
              <h3 className="font-semibold mb-4">Weekly Breakdown by Project</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projectStats.slice(0, 6).map(({ project, duration }) => {
                  const percentage = weekTotal > 0 ? Math.round((duration / weekTotal) * 100) : 0
                  return (
                    <div key={project.id} className="flex items-center gap-3">
                      <div
                        className="size-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: project.color }}
                      >
                        {percentage}%
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{formatDurationShort(duration)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Entry Dialog */}
      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Entry" : "Add Time Entry"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Input
                value={entryFormData.description}
                onChange={(e) => setEntryFormData({ ...entryFormData, description: e.target.value })}
                placeholder="What did you work on?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Project</Label>
              <Select
                value={entryFormData.projectId}
                onValueChange={(v) => setEntryFormData({ ...entryFormData, projectId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {defaultTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-2 py-1 text-xs rounded-full border transition-colors",
                      entryFormData.tags.includes(tag)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={entryFormData.date}
                  onChange={(e) => setEntryFormData({ ...entryFormData, date: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Start</Label>
                <Input
                  type="time"
                  value={entryFormData.startTime}
                  onChange={(e) => setEntryFormData({ ...entryFormData, startTime: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>End</Label>
                <Input
                  type="time"
                  value={entryFormData.endTime}
                  onChange={(e) => setEntryFormData({ ...entryFormData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEntryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} disabled={!entryFormData.description.trim()}>
                {editingEntry ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Project</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Name</Label>
              <Input
                value={projectFormData.name}
                onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                placeholder="Project name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {projectColors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setProjectFormData({ ...projectFormData, color: c.hex })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      projectFormData.color === c.hex ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddProject} disabled={!projectFormData.name.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goals Dialog */}
      <Dialog open={isGoalsDialogOpen} onOpenChange={setIsGoalsDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Time Goals</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Daily Goal (hours)</Label>
              <Input
                type="number"
                value={Math.floor(goals.dailyGoal / 60)}
                onChange={(e) => setGoals({ ...goals, dailyGoal: Number(e.target.value) * 60 })}
                min={1}
                max={16}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Weekly Goal (hours)</Label>
              <Input
                type="number"
                value={Math.floor(goals.weeklyGoal / 60)}
                onChange={(e) => setGoals({ ...goals, weeklyGoal: Number(e.target.value) * 60 })}
                min={1}
                max={100}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setIsGoalsDialogOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
