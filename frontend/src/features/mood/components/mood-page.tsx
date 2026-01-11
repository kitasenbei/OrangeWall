import { useState } from "react"
import {
  Plus,
  Smile,
  Meh,
  Frown,
  Angry,
  Heart,
  Sun,
  Cloud,
  CloudRain,
  Zap,
  Moon,
  Coffee,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type MoodLevel = 1 | 2 | 3 | 4 | 5

interface MoodEntry {
  id: string
  date: string
  mood: MoodLevel
  energy: MoodLevel
  note: string
  tags: string[]
  createdAt: Date
}

const moodConfig: Record<MoodLevel, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  1: { label: "Terrible", icon: Angry, color: "text-red-500", bgColor: "bg-red-500/10" },
  2: { label: "Bad", icon: Frown, color: "text-orange-500", bgColor: "bg-orange-500/10" },
  3: { label: "Okay", icon: Meh, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  4: { label: "Good", icon: Smile, color: "text-green-500", bgColor: "bg-green-500/10" },
  5: { label: "Amazing", icon: Heart, color: "text-pink-500", bgColor: "bg-pink-500/10" },
}

const energyConfig: Record<MoodLevel, { label: string; icon: LucideIcon; color: string }> = {
  1: { label: "Exhausted", icon: Moon, color: "text-slate-500" },
  2: { label: "Low", icon: CloudRain, color: "text-blue-400" },
  3: { label: "Normal", icon: Cloud, color: "text-gray-400" },
  4: { label: "Energized", icon: Sun, color: "text-yellow-500" },
  5: { label: "Hyper", icon: Zap, color: "text-amber-500" },
}

const suggestedTags = [
  "Work", "Exercise", "Social", "Family", "Sleep", "Weather",
  "Health", "Stress", "Relaxed", "Creative", "Productive", "Tired"
]

const initialEntries: MoodEntry[] = [
  {
    id: "1",
    date: new Date().toISOString().split('T')[0],
    mood: 4,
    energy: 4,
    note: "Great day! Got a lot done and had a nice walk.",
    tags: ["Productive", "Exercise"],
    createdAt: new Date(),
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    mood: 3,
    energy: 3,
    note: "Average day, nothing special happened.",
    tags: ["Work"],
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "3",
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    mood: 5,
    energy: 5,
    note: "Amazing weekend! Spent time with friends and family.",
    tags: ["Social", "Family", "Relaxed"],
    createdAt: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "4",
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    mood: 2,
    energy: 2,
    note: "Didn't sleep well, felt groggy all day.",
    tags: ["Sleep", "Tired"],
    createdAt: new Date(Date.now() - 86400000 * 3),
  },
  {
    id: "5",
    date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    mood: 4,
    energy: 3,
    note: "Good mood despite being tired. Coffee helped!",
    tags: ["Work", "Productive"],
    createdAt: new Date(Date.now() - 86400000 * 4),
  },
]

export function MoodPage() {
  const [entries, setEntries] = useState<MoodEntry[]>(initialEntries)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newMood, setNewMood] = useState<MoodLevel>(3)
  const [newEnergy, setNewEnergy] = useState<MoodLevel>(3)
  const [newNote, setNewNote] = useState("")
  const [newTags, setNewTags] = useState<string[]>([])
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])

  const handleAddEntry = () => {
    if (!newDate) return

    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: newDate,
      mood: newMood,
      energy: newEnergy,
      note: newNote,
      tags: newTags,
      createdAt: new Date(),
    }

    setEntries(prev => [entry, ...prev])
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setNewMood(3)
    setNewEnergy(3)
    setNewNote("")
    setNewTags([])
    setNewDate(new Date().toISOString().split('T')[0])
  }

  const toggleTag = (tag: string) => {
    setNewTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(Date.now() - 86400000)

    if (dateStr === today.toISOString().split('T')[0]) return "Today"
    if (dateStr === yesterday.toISOString().split('T')[0]) return "Yesterday"

    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  }

  // Calculate stats
  const last7Days = entries.filter(e => {
    const entryDate = new Date(e.date)
    const weekAgo = new Date(Date.now() - 7 * 86400000)
    return entryDate >= weekAgo
  })

  const avgMood = last7Days.length > 0
    ? last7Days.reduce((sum, e) => sum + e.mood, 0) / last7Days.length
    : 0

  const avgEnergy = last7Days.length > 0
    ? last7Days.reduce((sum, e) => sum + e.energy, 0) / last7Days.length
    : 0

  const moodTrend = last7Days.length >= 2
    ? last7Days[0].mood - last7Days[last7Days.length - 1].mood
    : 0

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return TrendingUp
    if (trend < 0) return TrendingDown
    return Minus
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return "text-green-500"
    if (trend < 0) return "text-red-500"
    return "text-gray-500"
  }

  const TrendIcon = getTrendIcon(moodTrend)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mood Tracker</h1>
          <p className="text-sm text-muted-foreground">Track your daily mood and energy levels</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="size-4 mr-2" />
              Log Mood
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Log Your Mood</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pt-4">
              {/* Date */}
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>

              {/* Mood Selection */}
              <div className="space-y-3">
                <Label>How are you feeling?</Label>
                <div className="flex justify-between gap-2">
                  {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
                    const config = moodConfig[level]
                    const Icon = config.icon
                    return (
                      <button
                        key={level}
                        onClick={() => setNewMood(level)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all flex-1",
                          newMood === level
                            ? `${config.bgColor} border-current ${config.color}`
                            : "border-transparent hover:bg-muted"
                        )}
                      >
                        <Icon className={cn("size-6", config.color)} />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Energy Selection */}
              <div className="space-y-3">
                <Label>Energy Level</Label>
                <div className="flex justify-between gap-2">
                  {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
                    const config = energyConfig[level]
                    const Icon = config.icon
                    return (
                      <button
                        key={level}
                        onClick={() => setNewEnergy(level)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all flex-1",
                          newEnergy === level
                            ? "bg-muted border-foreground/20"
                            : "border-transparent hover:bg-muted"
                        )}
                      >
                        <Icon className={cn("size-5", config.color)} />
                        <span className="text-xs">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm transition-colors",
                        newTags.includes(tag)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-2">
                <Label>Notes (optional)</Label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="How was your day?"
                  rows={3}
                />
              </div>

              <Button onClick={handleAddEntry} className="w-full">
                Save Entry
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sparkles className="size-4" />
            <span className="text-sm">Avg Mood (7d)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{avgMood.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Coffee className="size-4" />
            <span className="text-sm">Avg Energy (7d)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{avgEnergy.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendIcon className={cn("size-4", getTrendColor(moodTrend))} />
            <span className="text-sm">Mood Trend</span>
          </div>
          <div className={cn("text-2xl font-semibold", getTrendColor(moodTrend))}>
            {moodTrend > 0 ? "Improving" : moodTrend < 0 ? "Declining" : "Stable"}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="size-4" />
            <span className="text-sm">Entries</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{entries.length}</span>
            <span className="text-sm text-muted-foreground">total</span>
          </div>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3">
        {entries.map((entry) => {
          const moodConf = moodConfig[entry.mood]
          const energyConf = energyConfig[entry.energy]
          const MoodIcon = moodConf.icon
          const EnergyIcon = energyConf.icon

          return (
            <div
              key={entry.id}
              className="bg-card border rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                {/* Mood Icon */}
                <div className={cn("p-3 rounded-full", moodConf.bgColor)}>
                  <MoodIcon className={cn("size-6", moodConf.color)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{formatDate(entry.date)}</span>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <EnergyIcon className={cn("size-4", energyConf.color)} />
                        <span>{energyConf.label}</span>
                      </div>
                    </div>
                  </div>

                  {entry.note && (
                    <p className="text-sm text-muted-foreground mb-2">{entry.note}</p>
                  )}

                  {entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-muted rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mood Label */}
                <div className={cn("text-sm font-medium", moodConf.color)}>
                  {moodConf.label}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
