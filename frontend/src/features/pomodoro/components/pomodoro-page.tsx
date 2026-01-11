import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { StatCard, IconButton, ProgressRing, TimeDisplay } from "@/components/cheval-ui"
import {
  Clock,
  Target,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Settings,
  Edit3,
  Coffee,
  Zap,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  History,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SessionPreset {
  id: string
  title: string
  duration: number // minutes
  color: string
  type: "focus" | "short-break" | "long-break" | "custom"
}

interface CompletedSession {
  id: string
  presetId: string
  title: string
  duration: number
  type: SessionPreset["type"]
  completedAt: Date
}

interface PomodoroSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number // after how many focus sessions
  autoStartBreaks: boolean
  autoStartFocus: boolean
  soundEnabled: boolean
  dailyGoal: number // minutes
}

const presetColors = [
  { hex: "#ef4444", name: "Red" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#eab308", name: "Yellow" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
]

const defaultSettings: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  dailyGoal: 120,
}

function createDefaultPresets(settings: PomodoroSettings): SessionPreset[] {
  return [
    { id: "focus", title: "Focus", duration: settings.focusDuration, color: "#ef4444", type: "focus" },
    { id: "short-break", title: "Short Break", duration: settings.shortBreakDuration, color: "#22c55e", type: "short-break" },
    { id: "long-break", title: "Long Break", duration: settings.longBreakDuration, color: "#3b82f6", type: "long-break" },
    { id: "deep-work", title: "Deep Work", duration: 50, color: "#8b5cf6", type: "focus" },
  ]
}

function generateMockHistory(): CompletedSession[] {
  const sessions: CompletedSession[] = []
  const now = new Date()

  // Generate some mock history for the past week
  for (let day = 0; day < 7; day++) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)

    const numSessions = Math.floor(Math.random() * 6) + 2
    for (let i = 0; i < numSessions; i++) {
      const hour = 9 + Math.floor(Math.random() * 10)
      const sessionDate = new Date(date)
      sessionDate.setHours(hour, Math.floor(Math.random() * 60))

      const isFocus = Math.random() > 0.3
      sessions.push({
        id: crypto.randomUUID(),
        presetId: isFocus ? "focus" : "short-break",
        title: isFocus ? "Focus" : "Short Break",
        duration: isFocus ? 25 : 5,
        type: isFocus ? "focus" : "short-break",
        completedAt: sessionDate,
      })
    }
  }

  return sessions.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
}

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

function playNotificationSound() {
  // Create a simple beep using Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = "sine"
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)

    // Play a second beep
    setTimeout(() => {
      const osc2 = audioContext.createOscillator()
      const gain2 = audioContext.createGain()
      osc2.connect(gain2)
      gain2.connect(audioContext.destination)
      osc2.frequency.value = 1000
      osc2.type = "sine"
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      osc2.start(audioContext.currentTime)
      osc2.stop(audioContext.currentTime + 0.5)
    }, 300)
  } catch (e) {
    console.log("Audio not supported")
  }
}

type ViewMode = "timer" | "history" | "stats"

export function PomodoroPage() {
  const [settings, setSettings] = useState<PomodoroSettings>(defaultSettings)
  const [presets, setPresets] = useState<SessionPreset[]>(() => createDefaultPresets(defaultSettings))
  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>(generateMockHistory)
  const [activePreset, setActivePreset] = useState<SessionPreset | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [focusSessionsCount, setFocusSessionsCount] = useState(0)
  const [viewMode, setViewMode] = useState<ViewMode>("timer")
  const [historyDate, setHistoryDate] = useState(new Date())

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [editingPreset, setEditingPreset] = useState<SessionPreset | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    duration: "25",
    color: presetColors[0].hex,
    type: "custom" as SessionPreset["type"],
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const today = useMemo(() => new Date(), [])
  const todayStr = getDateStr(today)

  const todaySessions = useMemo(
    () => completedSessions.filter((s) => getDateStr(s.completedAt) === todayStr),
    [completedSessions, todayStr]
  )

  const todayFocusMinutes = useMemo(
    () => todaySessions.filter((s) => s.type === "focus").reduce((acc, s) => acc + s.duration, 0),
    [todaySessions]
  )

  const goalProgress = Math.min(100, Math.round((todayFocusMinutes / settings.dailyGoal) * 100))

  const stats = useMemo(() => {
    const last7Days = completedSessions.filter((s) => {
      const diff = (today.getTime() - s.completedAt.getTime()) / (1000 * 60 * 60 * 24)
      return diff < 7 && s.type === "focus"
    })
    const totalMinutes = last7Days.reduce((acc, s) => acc + s.duration, 0)
    const avgPerDay = Math.round(totalMinutes / 7)

    // Calculate streak (consecutive days with at least one focus session)
    let streak = 0
    const checkDate = new Date(today)
    while (true) {
      const dateStr = getDateStr(checkDate)
      const hasFocus = completedSessions.some(
        (s) => getDateStr(s.completedAt) === dateStr && s.type === "focus"
      )
      if (hasFocus) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return {
      weeklyMinutes: totalMinutes,
      avgPerDay,
      streak,
      totalSessions: last7Days.length,
    }
  }, [completedSessions, today])

  const handleSessionComplete = useCallback(() => {
    if (!activePreset) return

    if (settings.soundEnabled) {
      playNotificationSound()
    }

    // Record completed session
    const newSession: CompletedSession = {
      id: crypto.randomUUID(),
      presetId: activePreset.id,
      title: activePreset.title,
      duration: activePreset.duration,
      type: activePreset.type,
      completedAt: new Date(),
    }
    setCompletedSessions((prev) => [newSession, ...prev])

    // Handle auto-start next session
    if (activePreset.type === "focus") {
      const newCount = focusSessionsCount + 1
      setFocusSessionsCount(newCount)

      if (settings.autoStartBreaks) {
        const isLongBreak = newCount % settings.longBreakInterval === 0
        const breakPreset = presets.find(
          (p) => p.type === (isLongBreak ? "long-break" : "short-break")
        )
        if (breakPreset) {
          setActivePreset(breakPreset)
          setSecondsLeft(breakPreset.duration * 60)
          setIsRunning(true)
          return
        }
      }
    } else if (
      (activePreset.type === "short-break" || activePreset.type === "long-break") &&
      settings.autoStartFocus
    ) {
      const focusPreset = presets.find((p) => p.type === "focus")
      if (focusPreset) {
        setActivePreset(focusPreset)
        setSecondsLeft(focusPreset.duration * 60)
        setIsRunning(true)
        return
      }
    }

    setIsRunning(false)
  }, [activePreset, settings, focusSessionsCount, presets])

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, secondsLeft, handleSessionComplete])

  const handleSelectPreset = (preset: SessionPreset) => {
    setActivePreset(preset)
    setSecondsLeft(preset.duration * 60)
    setIsRunning(false)
  }

  const handleToggle = () => {
    if (!activePreset) return
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    if (!activePreset) return
    setSecondsLeft(activePreset.duration * 60)
    setIsRunning(false)
  }

  const handleSkip = () => {
    if (!activePreset) return
    handleSessionComplete()
  }

  const handleOpenCreate = () => {
    setEditingPreset(null)
    setFormData({ title: "", duration: "25", color: presetColors[0].hex, type: "custom" })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (preset: SessionPreset) => {
    setEditingPreset(preset)
    setFormData({
      title: preset.title,
      duration: preset.duration.toString(),
      color: preset.color,
      type: preset.type,
    })
    setIsDialogOpen(true)
  }

  const handleSavePreset = () => {
    if (editingPreset) {
      setPresets((prev) =>
        prev.map((p) =>
          p.id === editingPreset.id
            ? { ...p, title: formData.title, duration: Number(formData.duration), color: formData.color }
            : p
        )
      )
      if (activePreset?.id === editingPreset.id) {
        setActivePreset((prev) =>
          prev ? { ...prev, title: formData.title, duration: Number(formData.duration), color: formData.color } : null
        )
      }
    } else {
      const newPreset: SessionPreset = {
        id: crypto.randomUUID(),
        title: formData.title,
        duration: Number(formData.duration),
        color: formData.color,
        type: formData.type,
      }
      setPresets((prev) => [...prev, newPreset])
    }
    setIsDialogOpen(false)
  }

  const handleDeletePreset = (id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
    if (activePreset?.id === id) {
      setActivePreset(null)
      setSecondsLeft(0)
      setIsRunning(false)
    }
  }

  const handleUpdateSettings = (updates: Partial<PomodoroSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const totalSeconds = activePreset ? activePreset.duration * 60 : 0
  const progress = totalSeconds > 0 ? totalSeconds - secondsLeft : 0

  // Get sessions for history date
  const historyDateStr = getDateStr(historyDate)
  const historySessions = completedSessions.filter((s) => getDateStr(s.completedAt) === historyDateStr)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pomodoro Timer</h1>
            <p className="text-sm text-muted-foreground">Stay focused with timed work sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="size-4" />
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="size-4 mr-2" />
            New Preset
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Sessions Today"
          value={todaySessions.filter((s) => s.type === "focus").length}
          icon={Target}
        />
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Daily Goal</span>
            <span className="text-xs text-muted-foreground">{todayFocusMinutes}/{settings.dailyGoal}m</span>
          </div>
          <Progress value={goalProgress} className="h-2" />
          <span className="text-2xl font-bold">{goalProgress}%</span>
        </div>
        <StatCard
          title="Focus Streak"
          value={`${stats.streak} days`}
          icon={Zap}
        />
        <StatCard
          title="Week Average"
          value={`${stats.avgPerDay}m/day`}
          icon={TrendingUp}
        />
      </div>

      {/* View Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList>
          <TabsTrigger value="timer" className="gap-2">
            <Clock className="size-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="size-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <Trophy className="size-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        {/* Timer View */}
        <TabsContent value="timer" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Timer */}
            <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-8">
              {activePreset ? (
                <>
                  <div
                    className="text-sm font-medium px-3 py-1 rounded-full mb-4 flex items-center gap-2"
                    style={{ backgroundColor: `${activePreset.color}20`, color: activePreset.color }}
                  >
                    {activePreset.type === "focus" && <Zap className="size-3" />}
                    {(activePreset.type === "short-break" || activePreset.type === "long-break") && <Coffee className="size-3" />}
                    {activePreset.title}
                  </div>
                  <ProgressRing
                    value={progress}
                    max={totalSeconds}
                    size={220}
                    strokeWidth={10}
                    style={{ stroke: activePreset.color } as React.CSSProperties}
                  >
                    <TimeDisplay seconds={secondsLeft} size="xl" />
                  </ProgressRing>
                  <div className="flex items-center gap-3 mt-6">
                    <IconButton
                      icon={isRunning ? Pause : Play}
                      variant="default"
                      size="lg"
                      onClick={handleToggle}
                      label={isRunning ? "Pause" : "Start"}
                    />
                    <IconButton
                      icon={RotateCcw}
                      variant="outline"
                      size="md"
                      onClick={handleReset}
                      label="Reset"
                    />
                    <IconButton
                      icon={SkipForward}
                      variant="outline"
                      size="md"
                      onClick={handleSkip}
                      label="Skip"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                    >
                      {settings.soundEnabled ? (
                        <Volume2 className="size-4" />
                      ) : (
                        <VolumeX className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>

                  {/* Pomodoro counter */}
                  {activePreset.type === "focus" && (
                    <div className="mt-4 flex items-center gap-2">
                      {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
                        <div
                          key={i}
                          className={cn(
                            "size-3 rounded-full transition-colors",
                            i < focusSessionsCount % settings.longBreakInterval
                              ? "bg-primary"
                              : "bg-muted"
                          )}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground ml-2">
                        {settings.longBreakInterval - (focusSessionsCount % settings.longBreakInterval)} until long break
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <OrangeLogo className="size-12 mx-auto mb-4 opacity-50" />
                  <p>Select a session to start</p>
                </div>
              )}
            </div>

            {/* Session Presets */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Session Presets</h2>
              </div>
              <div className="p-4 space-y-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      activePreset?.id === preset.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted"
                    )}
                    onClick={() => handleSelectPreset(preset)}
                  >
                    <div
                      className="size-8 rounded-full shrink-0 flex items-center justify-center text-white"
                      style={{ backgroundColor: preset.color }}
                    >
                      {preset.type === "focus" && <Zap className="size-4" />}
                      {preset.type === "short-break" && <Coffee className="size-4" />}
                      {preset.type === "long-break" && <Coffee className="size-4" />}
                      {preset.type === "custom" && <Clock className="size-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{preset.title}</p>
                      <p className="text-sm text-muted-foreground">{preset.duration} minutes</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(preset)}>
                          <Edit3 className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePreset(preset.id)
                          }}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Sessions */}
          {todaySessions.length > 0 && (
            <div className="rounded-lg border bg-card mt-6">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Today's Sessions</h2>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {todaySessions.map((session) => (
                    <Badge
                      key={session.id}
                      variant={session.type === "focus" ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {session.type === "focus" ? <Zap className="size-3" /> : <Coffee className="size-3" />}
                      {session.title} ({session.duration}m) at{" "}
                      {session.completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* History View */}
        <TabsContent value="history" className="mt-4">
          <div className="rounded-lg border bg-card">
            <div className="p-4 border-b flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHistoryDate((d) => new Date(d.setDate(d.getDate() - 1)))}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <h2 className="font-semibold">
                {historyDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setHistoryDate((d) => new Date(d.setDate(d.getDate() + 1)))}
                disabled={historyDateStr === todayStr}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="p-4">
              {historySessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No sessions on this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historySessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center gap-3 p-3 rounded-lg border"
                    >
                      <div
                        className={cn(
                          "size-10 rounded-full flex items-center justify-center text-white",
                          session.type === "focus" ? "bg-red-500" : "bg-green-500"
                        )}
                      >
                        {session.type === "focus" ? <Zap className="size-5" /> : <Coffee className="size-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{session.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <Badge variant="secondary">{session.duration}m</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-muted/30">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total focus time</span>
                <span className="font-medium">
                  {historySessions.filter((s) => s.type === "focus").reduce((acc, s) => acc + s.duration, 0)} minutes
                </span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Stats View */}
        <TabsContent value="stats" className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Week</p>
                  <p className="text-2xl font-bold">{stats.weeklyMinutes}m</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {Math.floor(stats.weeklyMinutes / 60)}h {stats.weeklyMinutes % 60}m total focus time
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Zap className="size-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Focus Streak</p>
                  <p className="text-2xl font-bold">{stats.streak} days</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Keep it going!
              </p>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Target className="size-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sessions This Week</p>
                  <p className="text-2xl font-bold">{stats.totalSessions}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                ~{Math.round(stats.totalSessions / 7)} sessions per day
              </p>
            </div>

            {/* Weekly chart placeholder */}
            <div className="rounded-lg border bg-card p-6 sm:col-span-2 lg:col-span-3">
              <h3 className="font-semibold mb-4">Weekly Overview</h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {Array.from({ length: 7 }).map((_, i) => {
                  const date = new Date(today)
                  date.setDate(date.getDate() - (6 - i))
                  const dateStr = getDateStr(date)
                  const dayMinutes = completedSessions
                    .filter((s) => getDateStr(s.completedAt) === dateStr && s.type === "focus")
                    .reduce((acc, s) => acc + s.duration, 0)
                  const heightPercent = Math.min(100, (dayMinutes / settings.dailyGoal) * 100)

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-muted rounded-t-sm relative" style={{ height: "100px" }}>
                        <div
                          className={cn(
                            "absolute bottom-0 w-full rounded-t-sm transition-all",
                            heightPercent >= 100 ? "bg-green-500" : "bg-primary"
                          )}
                          style={{ height: `${heightPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                <span>Goal: {settings.dailyGoal}m/day</span>
                <span className="flex items-center gap-2">
                  <div className="size-3 rounded bg-primary" />
                  <span>Focus time</span>
                  <div className="size-3 rounded bg-green-500 ml-2" />
                  <span>Goal reached</span>
                </span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Preset Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPreset ? "Edit Preset" : "New Session Preset"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Focus, Deep Work, Break..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min={1}
                max={120}
              />
            </div>
            {!editingPreset && (
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as SessionPreset["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focus">Focus Session</SelectItem>
                    <SelectItem value="short-break">Short Break</SelectItem>
                    <SelectItem value="long-break">Long Break</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.hex })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      formData.color === color.hex ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSavePreset} disabled={!formData.title.trim() || !formData.duration}>
                {editingPreset ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Timer Durations</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="focus" className="text-xs">Focus</Label>
                  <Input
                    id="focus"
                    type="number"
                    value={settings.focusDuration}
                    onChange={(e) => handleUpdateSettings({ focusDuration: Number(e.target.value) })}
                    min={1}
                    max={120}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="short" className="text-xs">Short Break</Label>
                  <Input
                    id="short"
                    type="number"
                    value={settings.shortBreakDuration}
                    onChange={(e) => handleUpdateSettings({ shortBreakDuration: Number(e.target.value) })}
                    min={1}
                    max={30}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="long" className="text-xs">Long Break</Label>
                  <Input
                    id="long"
                    type="number"
                    value={settings.longBreakDuration}
                    onChange={(e) => handleUpdateSettings({ longBreakDuration: Number(e.target.value) })}
                    min={1}
                    max={60}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Goals</h3>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dailyGoal">Daily Focus Goal (minutes)</Label>
                <Input
                  id="dailyGoal"
                  type="number"
                  value={settings.dailyGoal}
                  onChange={(e) => handleUpdateSettings({ dailyGoal: Number(e.target.value) })}
                  min={15}
                  max={480}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="interval">Long Break After</Label>
                <Select
                  value={settings.longBreakInterval.toString()}
                  onValueChange={(v) => handleUpdateSettings({ longBreakInterval: Number(v) })}
                >
                  <SelectTrigger id="interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5, 6].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} focus sessions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Automation</h3>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start breaks</Label>
                  <p className="text-xs text-muted-foreground">Automatically start break after focus</p>
                </div>
                <Switch
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(v) => handleUpdateSettings({ autoStartBreaks: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-start focus</Label>
                  <p className="text-xs text-muted-foreground">Automatically start focus after break</p>
                </div>
                <Switch
                  checked={settings.autoStartFocus}
                  onCheckedChange={(v) => handleUpdateSettings({ autoStartFocus: v })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sound notifications</Label>
                  <p className="text-xs text-muted-foreground">Play sound when timer ends</p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(v) => handleUpdateSettings({ soundEnabled: v })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsSettingsOpen(false)}>Done</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
