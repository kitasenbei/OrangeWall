import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Calendar,
  Clock,
  PartyPopper,
  Plane,
  GraduationCap,
  Heart,
  Gift,
  Star,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface Countdown {
  id: string
  title: string
  date: string
  time: string
  icon: string
  color: string
}

const icons: { id: string; icon: LucideIcon }[] = [
  { id: "party", icon: PartyPopper },
  { id: "plane", icon: Plane },
  { id: "graduation", icon: GraduationCap },
  { id: "heart", icon: Heart },
  { id: "gift", icon: Gift },
  { id: "star", icon: Star },
  { id: "calendar", icon: Calendar },
]

const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"]

const initialCountdowns: Countdown[] = [
  { id: "1", title: "New Year 2025", date: "2025-01-01", time: "00:00", icon: "party", color: "#f97316" },
  { id: "2", title: "Summer Vacation", date: "2024-07-15", time: "09:00", icon: "plane", color: "#06b6d4" },
  { id: "3", title: "Birthday", date: "2024-06-20", time: "00:00", icon: "gift", color: "#ec4899" },
]

function getTimeRemaining(dateStr: string, timeStr: string) {
  const target = new Date(`${dateStr}T${timeStr || "00:00"}`)
  const now = new Date()
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, passed: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, passed: false }
}

function getIconComponent(iconId: string): LucideIcon {
  return icons.find(i => i.id === iconId)?.icon || Calendar
}

export function CountdownsPage() {
  const [countdowns, setCountdowns] = useState<Countdown[]>(initialCountdowns)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [, setTick] = useState(0)

  // Form state
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [selectedIcon, setSelectedIcon] = useState("calendar")
  const [selectedColor, setSelectedColor] = useState(colors[0])

  // Update every second
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleAdd = () => {
    if (!title.trim() || !date) return

    const countdown: Countdown = {
      id: Date.now().toString(),
      title,
      date,
      time: time || "00:00",
      icon: selectedIcon,
      color: selectedColor,
    }
    setCountdowns(prev => [...prev, countdown])
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setTitle("")
    setDate("")
    setTime("")
    setSelectedIcon("calendar")
    setSelectedColor(colors[0])
  }

  const deleteCountdown = (id: string) => {
    setCountdowns(prev => prev.filter(c => c.id !== id))
  }

  // Sort: upcoming first, then by date
  const sortedCountdowns = [...countdowns].sort((a, b) => {
    const aTime = getTimeRemaining(a.date, a.time)
    const bTime = getTimeRemaining(b.date, b.time)
    if (aTime.passed && !bTime.passed) return 1
    if (!aTime.passed && bTime.passed) return -1
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Countdowns</h1>
          <p className="text-sm text-muted-foreground">Track upcoming events</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="size-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Countdown</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Event Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Vacation starts"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time (optional)</Label>
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex gap-2">
                  {icons.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedIcon(id)}
                      className={cn(
                        "size-10 rounded-lg flex items-center justify-center transition-colors",
                        selectedIcon === id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <Icon className="size-5" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "size-8 rounded-full transition-transform",
                        selectedColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Countdown</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="size-4" />
            <span className="text-sm">Active Countdowns</span>
          </div>
          <span className="text-2xl font-semibold">
            {countdowns.filter(c => !getTimeRemaining(c.date, c.time).passed).length}
          </span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="size-4" />
            <span className="text-sm">Next Event</span>
          </div>
          <span className="text-lg font-semibold truncate">
            {sortedCountdowns.find(c => !getTimeRemaining(c.date, c.time).passed)?.title || "None"}
          </span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <PartyPopper className="size-4" />
            <span className="text-sm">Passed Events</span>
          </div>
          <span className="text-2xl font-semibold">
            {countdowns.filter(c => getTimeRemaining(c.date, c.time).passed).length}
          </span>
        </div>
      </div>

      {/* Countdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedCountdowns.map((countdown) => {
          const remaining = getTimeRemaining(countdown.date, countdown.time)
          const Icon = getIconComponent(countdown.icon)

          return (
            <div
              key={countdown.id}
              className={cn(
                "bg-card border rounded-lg p-5",
                remaining.passed && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${countdown.color}20` }}
                  >
                    <Icon className="size-6" style={{ color: countdown.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium">{countdown.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(countdown.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                      {countdown.time && ` at ${countdown.time}`}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => deleteCountdown(countdown.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {remaining.passed ? (
                <div className="text-center py-4">
                  <span className="text-lg font-medium text-muted-foreground">Event has passed</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold" style={{ color: countdown.color }}>
                      {remaining.days}
                    </div>
                    <div className="text-xs text-muted-foreground">Days</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold" style={{ color: countdown.color }}>
                      {remaining.hours}
                    </div>
                    <div className="text-xs text-muted-foreground">Hours</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold" style={{ color: countdown.color }}>
                      {remaining.minutes}
                    </div>
                    <div className="text-xs text-muted-foreground">Mins</div>
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="text-2xl font-bold" style={{ color: countdown.color }}>
                      {remaining.seconds}
                    </div>
                    <div className="text-xs text-muted-foreground">Secs</div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {countdowns.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="size-12 mx-auto mb-4 opacity-50" />
          <p>No countdowns yet</p>
          <p className="text-sm">Add an event to start counting down</p>
        </div>
      )}
    </div>
  )
}
