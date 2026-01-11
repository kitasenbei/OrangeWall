import { useState, useMemo } from "react"
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trash2,
  Edit3,
  MoreVertical,
  Repeat,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { OrangeLogo } from "@/components/common/orange-logo"
import { useCalendar, type CalendarEvent } from "@/hooks"

const eventColors = [
  { id: "orange", hex: "#f97316", name: "Orange" },
  { id: "blue", hex: "#3b82f6", name: "Blue" },
  { id: "green", hex: "#22c55e", name: "Green" },
  { id: "red", hex: "#ef4444", name: "Red" },
  { id: "purple", hex: "#8b5cf6", name: "Purple" },
  { id: "pink", hex: "#ec4899", name: "Pink" },
  { id: "cyan", hex: "#06b6d4", name: "Cyan" },
  { id: "yellow", hex: "#eab308", name: "Yellow" },
]

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

type ViewMode = "month" | "week" | "day"

export function CalendarPage() {
  const {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent: deleteEventApi,
  } = useCalendar()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: getDateStr(new Date()),
    startTime: "09:00",
    endTime: "10:00",
    color: eventColors[0].hex,
    location: "",
    isAllDay: false,
    isRecurring: false,
    recurringType: "weekly" as CalendarEvent["recurringType"],
    reminder: 15,
  })

  const today = new Date()
  const todayStr = getDateStr(today)

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = firstDay.getDay()
    const days: (Date | null)[] = []

    // Previous month padding
    for (let i = 0; i < startPad; i++) {
      const prevDate = new Date(year, month, -startPad + i + 1)
      days.push(prevDate)
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d))
    }
    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }, [currentDate])

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStr = getDateStr(date)
    return events.filter((event) => event.date === dateStr)
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const handleOpenAdd = (date?: Date) => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      date: getDateStr(date || new Date()),
      startTime: "09:00",
      endTime: "10:00",
      color: eventColors[0].hex,
      location: "",
      isAllDay: false,
      isRecurring: false,
      recurringType: "weekly",
      reminder: 15,
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      color: event.color,
      location: event.location,
      isAllDay: event.isAllDay,
      isRecurring: event.isRecurring,
      recurringType: event.recurringType || "weekly",
      reminder: event.reminder,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) return

    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        color: formData.color,
        location: formData.location,
        isAllDay: formData.isAllDay,
        isRecurring: formData.isRecurring,
        recurringType: formData.isRecurring ? formData.recurringType : undefined,
        reminder: formData.reminder,
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
      } else {
        await createEvent(eventData)
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to save event:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteEventApi(id)
    } catch (err) {
      console.error("Failed to delete event:", err)
    }
  }

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : []

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading calendar...</p>
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

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
            <p className="text-sm text-muted-foreground">Manage your events and schedule</p>
          </div>
        </div>
        <Button onClick={() => handleOpenAdd()}>
          <Plus className="size-4 mr-2" />
          New Event
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] flex-1 min-h-0">
        {/* Calendar Grid */}
        <div className="rounded-lg border bg-card flex flex-col min-h-0 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="hover:bg-primary/10 hover:text-primary">
                <ChevronLeft className="size-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-[200px] justify-center">
                <OrangeLogo className="size-5" />
                <h2 className="text-lg font-semibold text-primary">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h2>
              </div>
              <Button variant="ghost" size="icon" onClick={handleNextMonth} className="hover:bg-primary/10 hover:text-primary">
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleToday} className="border-primary/30 text-primary hover:bg-primary/10">
                Today
              </Button>
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Week Day Headers */}
          <div className="grid grid-cols-7 border-b bg-primary/5">
            {weekDays.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-primary">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-auto">
            {calendarDays.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} className="aspect-square" />

              const dateStr = getDateStr(date)
              const isToday = dateStr === todayStr
              const isCurrentMonth = date.getMonth() === currentDate.getMonth()
              const isSelected = selectedDate && getDateStr(selectedDate) === dateStr
              const dayEvents = getEventsForDate(date)

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(date)}
                  onDoubleClick={() => handleOpenAdd(date)}
                  className={cn(
                    "min-h-[80px] p-1.5 border-b border-r text-left transition-colors hover:bg-primary/5",
                    !isCurrentMonth && "text-muted-foreground/50 bg-muted/20",
                    isSelected && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                    isToday && "bg-primary/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "size-7 flex items-center justify-center rounded-full text-sm",
                        isToday && "bg-primary text-primary-foreground font-bold"
                      )}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs px-1 py-0.5 rounded truncate text-white"
                        style={{ backgroundColor: event.color }}
                        title={event.title}
                      >
                        {!event.isAllDay && <span className="mr-1">{event.startTime}</span>}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Sidebar - Selected Day Events */}
        <div className="rounded-lg border bg-card flex flex-col min-h-0 overflow-hidden">
          <div className="p-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <OrangeLogo className="size-5" />
              <h3 className="font-semibold text-primary">
                {selectedDate
                  ? selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })
                  : "Select a date"}
              </h3>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-auto">
            {!selectedDate ? (
              <div className="text-center py-8">
                <OrangeLogo className="size-12 mx-auto mb-3 opacity-60" />
                <p className="text-sm text-muted-foreground">Click on a date to view events</p>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <OrangeLogo className="size-12 mx-auto mb-4 opacity-40" />
                <p className="text-sm text-muted-foreground mb-4">No events for this day</p>
                <Button variant="outline" size="sm" onClick={() => handleOpenAdd(selectedDate)} className="border-primary/30 text-primary hover:bg-primary/10">
                  <Plus className="size-4 mr-2" />
                  Add Event
                </Button>
                <OrangeLogo className="size-6 mx-auto mt-4 opacity-30" />
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group rounded-lg border p-3 hover:bg-primary/5 transition-colors"
                    style={{ borderLeftWidth: "4px", borderLeftColor: event.color }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{event.title}</h4>
                        {!event.isAllDay && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="size-3" />
                            {event.startTime} - {event.endTime}
                          </p>
                        )}
                        {event.isAllDay && (
                          <Badge variant="secondary" className="mt-1">All Day</Badge>
                        )}
                        {event.location && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="size-3" />
                            {event.location}
                          </p>
                        )}
                        {event.isRecurring && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Repeat className="size-3" />
                            {event.recurringType}
                          </p>
                        )}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(event)}>
                            <Edit3 className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(event.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => handleOpenAdd(selectedDate)}
                >
                  <Plus className="size-4 mr-2" />
                  Add Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "New Event"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>All Day</Label>
              <Switch
                checked={formData.isAllDay}
                onCheckedChange={(v) => setFormData({ ...formData, isAllDay: v })}
              />
            </div>

            {!formData.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Add location"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add description"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {eventColors.map((color) => (
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

            <div className="flex items-center justify-between">
              <Label>Recurring</Label>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(v) => setFormData({ ...formData, isRecurring: v })}
              />
            </div>

            {formData.isRecurring && (
              <Select
                value={formData.recurringType ?? undefined}
                onValueChange={(v) =>
                  setFormData({ ...formData, recurringType: v as CalendarEvent["recurringType"] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex flex-col gap-2">
              <Label>Reminder</Label>
              <Select
                value={formData.reminder.toString()}
                onValueChange={(v) => setFormData({ ...formData, reminder: parseInt(v) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No reminder</SelectItem>
                  <SelectItem value="5">5 minutes before</SelectItem>
                  <SelectItem value="15">15 minutes before</SelectItem>
                  <SelectItem value="30">30 minutes before</SelectItem>
                  <SelectItem value="60">1 hour before</SelectItem>
                  <SelectItem value="1440">1 day before</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title.trim()}>
                {editingEvent ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
