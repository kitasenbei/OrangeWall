import { useState } from "react"
import {
  Plus,
  Trash2,
  Pencil,
  MoreVertical,
  RefreshCw,
  Calendar,
  Recycle,
  Flame,
  Package,
  Bell,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OrangeLogo } from "@/components/common/orange-logo"
import { cn } from "@/lib/utils"
import { useRoutines, type Routine } from "@/hooks"

type RecurrenceType = "weekly" | "biweekly" | "monthly" | "custom"

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const weekDaysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const weeksInMonth = ["1st", "2nd", "3rd", "4th"]
const categories = ["Trash", "Bills", "Maintenance", "Personal", "Other"]
const colors = [
  { name: "Green", value: "bg-green-500", text: "text-green-500" },
  { name: "Blue", value: "bg-blue-500", text: "text-blue-500" },
  { name: "Orange", value: "bg-orange-500", text: "text-orange-500" },
  { name: "Purple", value: "bg-purple-500", text: "text-purple-500" },
  { name: "Red", value: "bg-red-500", text: "text-red-500" },
  { name: "Cyan", value: "bg-cyan-500", text: "text-cyan-500" },
]

const icons = [
  { name: "Recycle", icon: Recycle },
  { name: "Flame", icon: Flame },
  { name: "Package", icon: Package },
  { name: "Bell", icon: Bell },
  { name: "Calendar", icon: Calendar },
  { name: "Refresh", icon: RefreshCw },
]

function getOccurrenceText(routine: Routine): string {
  if (routine.recurrenceType === "weekly") {
    const days = routine.daysOfWeek?.map(d => weekDays[d]).join(" & ") || ""
    return `Every ${days}`
  }
  if (routine.recurrenceType === "biweekly") {
    const days = routine.daysOfWeek?.map(d => weekDaysFull[d]).join(" & ") || ""
    const weeks = routine.weeksOfMonth?.map(w => weeksInMonth[w - 1]).join(" & ") || ""
    return `${weeks} ${days}`
  }
  if (routine.recurrenceType === "monthly") {
    const days = routine.daysOfMonth?.map(d => `${d}${getOrdinalSuffix(d)}`).join(", ") || ""
    return `${days} of each month`
  }
  return routine.customPattern || "Custom"
}

function getOrdinalSuffix(n: number): string {
  if (n > 3 && n < 21) return "th"
  switch (n % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}

function isToday(routine: Routine): boolean {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()
  const weekOfMonth = Math.ceil(dayOfMonth / 7)

  if (routine.recurrenceType === "weekly") {
    return routine.daysOfWeek?.includes(dayOfWeek) || false
  }
  if (routine.recurrenceType === "biweekly") {
    return (
      (routine.daysOfWeek?.includes(dayOfWeek) || false) &&
      (routine.weeksOfMonth?.includes(weekOfMonth) || false)
    )
  }
  if (routine.recurrenceType === "monthly") {
    return routine.daysOfMonth?.includes(dayOfMonth) || false
  }
  return false
}

function getNextOccurrence(routine: Routine): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()

  if (routine.recurrenceType === "weekly" && routine.daysOfWeek) {
    const sortedDays = [...routine.daysOfWeek].sort((a, b) => a - b)
    let nextDay = sortedDays.find(d => d > dayOfWeek)
    if (nextDay === undefined) {
      nextDay = sortedDays[0]
      const daysUntil = 7 - dayOfWeek + nextDay
      return `in ${daysUntil} days`
    }
    const daysUntil = nextDay - dayOfWeek
    if (daysUntil === 0) return "Today"
    if (daysUntil === 1) return "Tomorrow"
    return `in ${daysUntil} days`
  }

  if (routine.recurrenceType === "monthly" && routine.daysOfMonth) {
    const sortedDays = [...routine.daysOfMonth].sort((a, b) => a - b)
    let nextDay = sortedDays.find(d => d >= dayOfMonth)
    if (nextDay === dayOfMonth) return "Today"
    if (nextDay === dayOfMonth + 1) return "Tomorrow"
    if (nextDay !== undefined) {
      return `on the ${nextDay}${getOrdinalSuffix(nextDay)}`
    }
    return `on the ${sortedDays[0]}${getOrdinalSuffix(sortedDays[0])} next month`
  }

  return "Soon"
}

function IconComponent({ name, className }: { name: string; className?: string }) {
  const iconData = icons.find(i => i.name === name)
  if (!iconData) return <RefreshCw className={className || "size-5"} />
  const Icon = iconData.icon
  return <Icon className={className || "size-5"} />
}

// Mini Week View for cards
function MiniWeekView({ routine }: { routine: Routine }) {
  const today = new Date()
  const dayOfWeek = today.getDay()

  const isActiveDay = (dayIndex: number): boolean => {
    if (routine.recurrenceType === "weekly") {
      return routine.daysOfWeek?.includes(dayIndex) || false
    }
    if (routine.recurrenceType === "biweekly") {
      // For biweekly, just show the days (simplified view)
      return routine.daysOfWeek?.includes(dayIndex) || false
    }
    return false
  }

  return (
    <div className="flex gap-1 mt-3">
      {weekDays.map((day, i) => {
        const active = isActiveDay(i)
        const isCurrentDay = i === dayOfWeek
        return (
          <div
            key={day}
            className={cn(
              "flex-1 h-6 rounded text-[10px] font-medium flex items-center justify-center transition-all",
              active && routine.color,
              active && "text-white",
              !active && "bg-muted/50 text-muted-foreground",
              isCurrentDay && !active && "ring-1 ring-primary",
              isCurrentDay && active && "ring-1 ring-white/50"
            )}
          >
            {day[0]}
          </div>
        )
      })}
    </div>
  )
}

// Week View Component
function WeekView({ routine, weekOffset, onChangeWeek }: { routine: Routine; weekOffset: number; onChangeWeek: (offset: number) => void }) {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7))

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const isRoutineDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay()
    const dayOfMonth = date.getDate()
    const weekOfMonth = Math.ceil(dayOfMonth / 7)

    if (routine.recurrenceType === "weekly") {
      return routine.daysOfWeek?.includes(dayOfWeek) || false
    }
    if (routine.recurrenceType === "biweekly") {
      return (
        (routine.daysOfWeek?.includes(dayOfWeek) || false) &&
        (routine.weeksOfMonth?.includes(weekOfMonth) || false)
      )
    }
    return false
  }

  const isCurrentDay = (date: Date): boolean => {
    return date.toDateString() === today.toDateString()
  }

  const formatMonth = (date: Date) => date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onChangeWeek(weekOffset - 1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="font-medium">{formatMonth(weekDates[0])}</span>
        <Button variant="ghost" size="icon" onClick={() => onChangeWeek(weekOffset + 1)}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDaysFull.map((day, i) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
            {weekDays[i]}
          </div>
        ))}
        {weekDates.map((date, i) => {
          const active = isRoutineDay(date)
          const current = isCurrentDay(date)
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-xl flex flex-col items-center justify-center border transition-all",
                active && routine.color,
                active && "text-white border-transparent",
                !active && "bg-muted/30",
                current && !active && "ring-2 ring-primary",
                current && active && "ring-2 ring-white/50"
              )}
            >
              <span className={cn("text-lg font-semibold", !active && "text-foreground")}>
                {date.getDate()}
              </span>
              {active && <IconComponent name={routine.icon} className="size-4 mt-1" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Month View Component
function MonthView({ routine, monthOffset, onChangeMonth }: { routine: Routine; monthOffset: number; onChangeMonth: (offset: number) => void }) {
  const today = new Date()
  const viewMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const firstDayOfWeek = viewMonth.getDay()

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const emptyDays = Array.from({ length: firstDayOfWeek }, () => null)

  const isRoutineDay = (day: number): boolean => {
    return routine.daysOfMonth?.includes(day) || false
  }

  const isCurrentDay = (day: number): boolean => {
    return (
      today.getMonth() === viewMonth.getMonth() &&
      today.getFullYear() === viewMonth.getFullYear() &&
      today.getDate() === day
    )
  }

  const formatMonth = (date: Date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onChangeMonth(monthOffset - 1)}>
          <ChevronLeft className="size-5" />
        </Button>
        <span className="font-medium">{formatMonth(viewMonth)}</span>
        <Button variant="ghost" size="icon" onClick={() => onChangeMonth(monthOffset + 1)}>
          <ChevronRight className="size-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
            {day}
          </div>
        ))}
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map((day) => {
          const active = isRoutineDay(day)
          const current = isCurrentDay(day)
          return (
            <div
              key={day}
              className={cn(
                "aspect-square rounded-lg flex flex-col items-center justify-center border transition-all text-sm",
                active && routine.color,
                active && "text-white border-transparent",
                !active && "bg-muted/30",
                current && !active && "ring-2 ring-primary",
                current && active && "ring-2 ring-white/50"
              )}
            >
              <span className={cn("font-medium", !active && "text-foreground")}>
                {day}
              </span>
              {active && <IconComponent name={routine.icon} className="size-3 mt-0.5" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Detail View Component
function RoutineDetailView({ routine, onBack, onEdit, onDelete }: { routine: Routine; onBack: () => void; onEdit: () => void; onDelete: () => void }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [monthOffset, setMonthOffset] = useState(0)

  const isWeekBased = routine.recurrenceType === "weekly" || routine.recurrenceType === "biweekly"

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
          </Button>
          <div className={cn("size-12 rounded-xl flex items-center justify-center text-white", routine.color)}>
            <IconComponent name={routine.icon} className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{routine.title}</h1>
            <p className="text-sm text-muted-foreground">{getOccurrenceText(routine)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="size-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {routine.description && (
        <p className="text-muted-foreground">{routine.description}</p>
      )}

      {/* Calendar View */}
      <div className="bg-card border rounded-xl p-6">
        {isWeekBased ? (
          <WeekView routine={routine} weekOffset={weekOffset} onChangeWeek={setWeekOffset} />
        ) : (
          <MonthView routine={routine} monthOffset={monthOffset} onChangeMonth={setMonthOffset} />
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={cn("size-4 rounded", routine.color)} />
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 rounded ring-2 ring-primary bg-muted/30" />
          <span>Today</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => isWeekBased ? setWeekOffset(0) : setMonthOffset(0)}>
          <Calendar className="size-4 mr-2" />
          Go to Today
        </Button>
      </div>
    </div>
  )
}

export function RoutinesPage() {
  const {
    routines,
    loading,
    error,
    createRoutine,
    updateRoutine,
    deleteRoutine: deleteRoutineApi,
  } = useRoutines()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null)
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("Recycle")
  const [color, setColor] = useState(colors[0].value)
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("weekly")
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([])
  const [selectedMonthDays, setSelectedMonthDays] = useState<number[]>([])
  const [category, setCategory] = useState("Trash")

  const todayRoutines = routines.filter(isToday)
  const groupedRoutines = categories.reduce((acc, cat) => {
    acc[cat] = routines.filter(r => r.category === cat)
    return acc
  }, {} as Record<string, Routine[]>)

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setIcon("Recycle")
    setColor(colors[0].value)
    setRecurrenceType("weekly")
    setSelectedDays([])
    setSelectedWeeks([])
    setSelectedMonthDays([])
    setCategory("Trash")
    setEditingRoutine(null)
  }

  const openEdit = (routine: Routine) => {
    setEditingRoutine(routine)
    setTitle(routine.title)
    setDescription(routine.description || "")
    setIcon(routine.icon)
    setColor(routine.color)
    setRecurrenceType(routine.recurrenceType)
    setSelectedDays(routine.daysOfWeek || [])
    setSelectedWeeks(routine.weeksOfMonth || [])
    setSelectedMonthDays(routine.daysOfMonth || [])
    setCategory(routine.category)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!title.trim()) return

    try {
      const routineData = {
        title,
        description: description || "",
        icon,
        color,
        recurrenceType,
        daysOfWeek: recurrenceType !== "monthly" ? selectedDays : undefined,
        weeksOfMonth: recurrenceType === "biweekly" ? selectedWeeks : undefined,
        daysOfMonth: recurrenceType === "monthly" ? selectedMonthDays : undefined,
        category,
      }

      if (editingRoutine) {
        await updateRoutine(editingRoutine.id, routineData)
      } else {
        await createRoutine(routineData)
      }

      resetForm()
      setDialogOpen(false)
    } catch (err) {
      console.error("Failed to save routine:", err)
    }
  }

  const deleteRoutine = async (id: string) => {
    try {
      await deleteRoutineApi(id)
    } catch (err) {
      console.error("Failed to delete routine:", err)
    }
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  const toggleWeek = (week: number) => {
    setSelectedWeeks(prev =>
      prev.includes(week) ? prev.filter(w => w !== week) : [...prev, week]
    )
  }

  const toggleMonthDay = (day: number) => {
    setSelectedMonthDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading routines...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  // Show detail view if a routine is selected
  if (selectedRoutine) {
    // Find the latest version of this routine from the list
    const currentRoutine = routines.find(r => r.id === selectedRoutine.id) || selectedRoutine

    return (
      <>
        <RoutineDetailView
          routine={currentRoutine}
          onBack={() => setSelectedRoutine(null)}
          onEdit={() => openEdit(currentRoutine)}
          onDelete={() => {
            deleteRoutine(currentRoutine.id)
            setSelectedRoutine(null)
          }}
        />
        {/* Edit Dialog - also available in detail view */}
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Routine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g., Burnable Trash"
                />
              </div>

              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g., Kitchen waste, paper"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex gap-2 flex-wrap">
                    {icons.map(i => (
                      <button
                        key={i.name}
                        onClick={() => setIcon(i.name)}
                        className={cn(
                          "size-9 rounded-lg flex items-center justify-center border transition-colors",
                          icon === i.name ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <i.icon className="size-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          "size-8 rounded-full",
                          c.value,
                          color === c.value && "ring-2 ring-offset-2 ring-primary"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Specific weeks</SelectItem>
                    <SelectItem value="monthly">Monthly (by date)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(recurrenceType === "weekly" || recurrenceType === "biweekly") && (
                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex gap-2">
                    {weekDays.map((day, i) => (
                      <button
                        key={day}
                        onClick={() => toggleDay(i)}
                        className={cn(
                          "size-9 rounded-lg text-xs font-medium border transition-colors",
                          selectedDays.includes(i)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recurrenceType === "biweekly" && (
                <div className="space-y-2">
                  <Label>Which weeks of the month?</Label>
                  <div className="flex gap-2">
                    {weeksInMonth.map((week, i) => (
                      <button
                        key={week}
                        onClick={() => toggleWeek(i + 1)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                          selectedWeeks.includes(i + 1)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {week}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {recurrenceType === "monthly" && (
                <div className="space-y-2">
                  <Label>Days of Month</Label>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                      <button
                        key={day}
                        onClick={() => toggleMonthDay(day)}
                        className={cn(
                          "size-8 rounded text-xs font-medium border transition-colors",
                          selectedMonthDays.includes(day)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Routines</h1>
            <p className="text-sm text-muted-foreground">Recurring schedules & reminders</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true) }}>
          <Plus className="size-4 mr-2" />
          Add Routine
        </Button>
      </div>

      {/* Today's Routines */}
      {todayRoutines.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h2 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
            <Calendar className="size-4" />
            Today's Routines
          </h2>
          <div className="flex flex-wrap gap-3">
            {todayRoutines.map(routine => (
              <div
                key={routine.id}
                onClick={() => setSelectedRoutine(routine)}
                className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border cursor-pointer hover:border-primary/50 transition-colors"
              >
                <div className={cn("size-8 rounded-lg flex items-center justify-center text-white", routine.color)}>
                  <IconComponent name={routine.icon} />
                </div>
                <div>
                  <div className="font-medium text-sm">{routine.title}</div>
                  <div className="text-xs text-muted-foreground">{routine.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Routines by Category */}
      {categories.map(cat => {
        const catRoutines = groupedRoutines[cat]
        if (!catRoutines?.length) return null

        return (
          <div key={cat}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {catRoutines.map(routine => (
                <div
                  key={routine.id}
                  onClick={() => setSelectedRoutine(routine)}
                  className={cn(
                    "group bg-card border rounded-xl p-4 transition-colors cursor-pointer hover:border-primary/50",
                    isToday(routine) && "border-primary/50 bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn("size-10 rounded-xl flex items-center justify-center text-white", routine.color)}>
                      <IconComponent name={routine.icon} />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(routine) }}>
                          <Pencil className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id) }}
                          className="text-destructive"
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <h3 className="font-medium">{routine.title}</h3>
                  {routine.description && (
                    <p className="text-sm text-muted-foreground mt-1">{routine.description}</p>
                  )}
                  {/* Mini week view for weekly/biweekly */}
                  {(routine.recurrenceType === "weekly" || routine.recurrenceType === "biweekly") && (
                    <MiniWeekView routine={routine} />
                  )}

                  {/* Monthly: show the occurrence text */}
                  {routine.recurrenceType === "monthly" && (
                    <div className="flex items-center gap-2 mt-3 text-xs">
                      <RefreshCw className="size-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{getOccurrenceText(routine)}</span>
                    </div>
                  )}

                  <div className="text-xs text-primary mt-2">
                    Next: {getNextOccurrence(routine)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {routines.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <OrangeLogo className="size-12 mx-auto mb-4 opacity-50" />
          <p>No routines yet</p>
          <p className="text-sm">Add recurring schedules like trash days</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRoutine ? "Edit Routine" : "Add Routine"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g., Burnable Trash"
              />
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g., Kitchen waste, paper"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex gap-2 flex-wrap">
                  {icons.map(i => (
                    <button
                      key={i.name}
                      onClick={() => setIcon(i.name)}
                      className={cn(
                        "size-9 rounded-lg flex items-center justify-center border transition-colors",
                        icon === i.name ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <i.icon className="size-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={cn(
                        "size-8 rounded-full",
                        c.value,
                        color === c.value && "ring-2 ring-offset-2 ring-primary"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Recurrence</Label>
              <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Specific weeks</SelectItem>
                  <SelectItem value="monthly">Monthly (by date)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(recurrenceType === "weekly" || recurrenceType === "biweekly") && (
              <div className="space-y-2">
                <Label>Days of Week</Label>
                <div className="flex gap-2">
                  {weekDays.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(i)}
                      className={cn(
                        "size-9 rounded-lg text-xs font-medium border transition-colors",
                        selectedDays.includes(i)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recurrenceType === "biweekly" && (
              <div className="space-y-2">
                <Label>Which weeks of the month?</Label>
                <div className="flex gap-2">
                  {weeksInMonth.map((week, i) => (
                    <button
                      key={week}
                      onClick={() => toggleWeek(i + 1)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
                        selectedWeeks.includes(i + 1)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {week}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {recurrenceType === "monthly" && (
              <div className="space-y-2">
                <Label>Days of Month</Label>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      onClick={() => toggleMonthDay(day)}
                      className={cn(
                        "size-8 rounded text-xs font-medium border transition-colors",
                        selectedMonthDays.includes(day)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleSave} className="w-full">
              {editingRoutine ? "Save Changes" : "Add Routine"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
