import { useState } from "react"
import { Plus, Calendar, MapPin, Clock, MoreVertical, Pencil, Trash2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Event { id: string; name: string; date: string; time: string; location: string; description: string; guests: number }

const initialEvents: Event[] = [
  { id: "1", name: "Birthday Party", date: "2025-02-15", time: "18:00", location: "123 Main St", description: "Celebrating John's 30th!", guests: 25 },
  { id: "2", name: "Team Meeting", date: "2025-01-20", time: "10:00", location: "Conference Room A", description: "Quarterly review", guests: 8 },
  { id: "3", name: "Wedding", date: "2025-06-10", time: "15:00", location: "Beach Resort", description: "Sarah & Mike's wedding", guests: 150 },
]

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [name, setName] = useState(""); const [date, setDate] = useState(""); const [time, setTime] = useState("")
  const [location, setLocation] = useState(""); const [description, setDescription] = useState(""); const [guests, setGuests] = useState("")

  const resetForm = () => { setName(""); setDate(""); setTime(""); setLocation(""); setDescription(""); setGuests(""); setEditing(null) }

  const handleSave = () => {
    if (!name || !date) return
    const data = { name, date, time, location, description, guests: parseInt(guests) || 0 }
    if (editing) { setEvents(events.map(e => e.id === editing.id ? { ...e, ...data } : e)) }
    else { setEvents([...events, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const openEdit = (e: Event) => { setEditing(e); setName(e.name); setDate(e.date); setTime(e.time); setLocation(e.location); setDescription(e.description); setGuests(e.guests.toString()); setDialogOpen(true) }
  const deleteEvent = (id: string) => setEvents(events.filter(e => e.id !== id))

  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const upcoming = sortedEvents.filter(e => new Date(e.date) >= new Date())
  const past = sortedEvents.filter(e => new Date(e.date) < new Date())

  const getDaysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Events</h1><p className="text-sm text-muted-foreground">Plan and organize your events</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />New Event</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Event Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Time</Label><Input type="time" value={time} onChange={e => setTime(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} /></div>
                <div className="space-y-2"><Label>Expected Guests</Label><Input type="number" value={guests} onChange={e => setGuests(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={e => setDescription(e.target.value)} /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Save" : "Create"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <Label>Upcoming Events</Label>
          {upcoming.map(event => {
            const days = getDaysUntil(event.date)
            return (
              <div key={event.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{event.name}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />{new Date(event.date).toLocaleDateString()}</span>
                      {event.time && <span className="flex items-center gap-1"><Clock className="size-3" />{event.time}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="size-3" />{event.location}</span>}
                      {event.guests > 0 && <span className="flex items-center gap-1"><Users className="size-3" />{event.guests}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${days <= 7 ? "text-yellow-500" : "text-muted-foreground"}`}>{days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days`}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(event)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteEvent(event.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {event.description && <p className="mt-2 text-sm text-muted-foreground">{event.description}</p>}
              </div>
            )
          })}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-3">
          <Label className="text-muted-foreground">Past Events</Label>
          {past.map(event => (
            <div key={event.id} className="bg-card border rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div><h3 className="font-medium">{event.name}</h3><p className="text-sm text-muted-foreground">{new Date(event.date).toLocaleDateString()}</p></div>
                <Button variant="ghost" size="icon" onClick={() => deleteEvent(event.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {events.length === 0 && <p className="text-center py-8 text-muted-foreground">No events planned</p>}
    </div>
  )
}
