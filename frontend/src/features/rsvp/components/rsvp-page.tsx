import { useState } from "react"
import { Plus, Trash2, Check, X, HelpCircle, Mail, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Guest {
  id: string
  name: string
  email: string
  status: "pending" | "yes" | "no" | "maybe"
  plusOnes: number
  notes: string
}

interface Event {
  id: string
  name: string
  date: string
  guests: Guest[]
}

const initialEvents: Event[] = [
  {
    id: "1",
    name: "Birthday Party",
    date: "2025-02-15",
    guests: [
      { id: "1a", name: "Alice Smith", email: "alice@example.com", status: "yes", plusOnes: 1, notes: "Bringing wine" },
      { id: "1b", name: "Bob Johnson", email: "bob@example.com", status: "yes", plusOnes: 0, notes: "" },
      { id: "1c", name: "Charlie Brown", email: "charlie@example.com", status: "maybe", plusOnes: 0, notes: "Checking schedule" },
      { id: "1d", name: "Diana Prince", email: "diana@example.com", status: "pending", plusOnes: 0, notes: "" },
      { id: "1e", name: "Eve Wilson", email: "eve@example.com", status: "no", plusOnes: 0, notes: "Out of town" },
    ],
  },
]

export function RsvpPage() {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(initialEvents[0])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)
  const [name, setName] = useState(""); const [email, setEmail] = useState("")
  const [plusOnes, setPlusOnes] = useState("0"); const [notes, setNotes] = useState("")
  const [newEventName, setNewEventName] = useState(""); const [newEventDate, setNewEventDate] = useState("")

  const resetForm = () => { setName(""); setEmail(""); setPlusOnes("0"); setNotes("") }

  const addGuest = () => {
    if (!name || !selectedEvent) return
    const guest: Guest = { id: Date.now().toString(), name, email, status: "pending", plusOnes: parseInt(plusOnes) || 0, notes }
    setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, guests: [...e.guests, guest] } : e))
    setSelectedEvent(prev => prev ? { ...prev, guests: [...prev.guests, guest] } : null)
    resetForm(); setDialogOpen(false)
  }

  const createEvent = () => {
    if (!newEventName || !newEventDate) return
    const event: Event = { id: Date.now().toString(), name: newEventName, date: newEventDate, guests: [] }
    setEvents([...events, event])
    setSelectedEvent(event)
    setNewEventName(""); setNewEventDate(""); setEventDialogOpen(false)
  }

  const updateStatus = (guestId: string, status: Guest["status"]) => {
    if (!selectedEvent) return
    const updateGuests = (guests: Guest[]) => guests.map(g => g.id === guestId ? { ...g, status } : g)
    setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, guests: updateGuests(e.guests) } : e))
    setSelectedEvent(prev => prev ? { ...prev, guests: updateGuests(prev.guests) } : null)
  }

  const deleteGuest = (guestId: string) => {
    if (!selectedEvent) return
    const filterGuests = (guests: Guest[]) => guests.filter(g => g.id !== guestId)
    setEvents(events.map(e => e.id === selectedEvent.id ? { ...e, guests: filterGuests(e.guests) } : e))
    setSelectedEvent(prev => prev ? { ...prev, guests: filterGuests(prev.guests) } : null)
  }

  const copyEmails = (status?: Guest["status"]) => {
    if (!selectedEvent) return
    const emails = selectedEvent.guests.filter(g => !status || g.status === status).map(g => g.email).filter(Boolean).join(", ")
    navigator.clipboard.writeText(emails)
  }

  const getStats = () => {
    if (!selectedEvent) return { yes: 0, no: 0, maybe: 0, pending: 0, total: 0 }
    const guests = selectedEvent.guests
    const yes = guests.filter(g => g.status === "yes").reduce((sum, g) => sum + 1 + g.plusOnes, 0)
    return {
      yes,
      no: guests.filter(g => g.status === "no").length,
      maybe: guests.filter(g => g.status === "maybe").length,
      pending: guests.filter(g => g.status === "pending").length,
      total: yes,
    }
  }

  const stats = getStats()
  const statusIcons = { yes: Check, no: X, maybe: HelpCircle, pending: Mail }
  const statusColors = { yes: "text-green-500", no: "text-red-500", maybe: "text-yellow-500", pending: "text-muted-foreground" }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">RSVP Tracker</h1><p className="text-sm text-muted-foreground">Manage event guest lists</p></div>
        <div className="flex gap-2">
          <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Plus className="size-4 mr-2" />New Event</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Event</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2"><Label>Event Name</Label><Input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="Birthday Party" /></div>
                <div className="space-y-2"><Label>Date</Label><Input type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} /></div>
                <Button onClick={createEvent} className="w-full">Create Event</Button>
              </div>
            </DialogContent>
          </Dialog>
          {selectedEvent && (
            <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
              <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Guest</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Guest</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="john@example.com" /></div>
                  <div className="space-y-2"><Label>Plus Ones</Label><Input type="number" min="0" value={plusOnes} onChange={e => setPlusOnes(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Dietary restrictions, etc." /></div>
                  <Button onClick={addGuest} className="w-full">Add Guest</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {events.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {events.map(e => (
            <Button key={e.id} variant={selectedEvent?.id === e.id ? "default" : "outline"} size="sm" onClick={() => setSelectedEvent(e)}>{e.name}</Button>
          ))}
        </div>
      )}

      {selectedEvent && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{stats.yes}</div>
              <div className="text-sm text-muted-foreground">Attending</div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.maybe}</div>
              <div className="text-sm text-muted-foreground">Maybe</div>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{stats.no}</div>
              <div className="text-sm text-muted-foreground">Declined</div>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <div className="text-2xl font-bold">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => copyEmails()}><Copy className="size-4 mr-1" />All Emails</Button>
            <Button variant="outline" size="sm" onClick={() => copyEmails("pending")}><Mail className="size-4 mr-1" />Pending Emails</Button>
          </div>

          <div className="space-y-2">
            {selectedEvent.guests.map(guest => {
              return (
                <div key={guest.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{guest.name}</span>
                      {guest.plusOnes > 0 && <span className="text-xs bg-muted px-2 py-0.5 rounded">+{guest.plusOnes}</span>}
                    </div>
                    {guest.email && <p className="text-sm text-muted-foreground">{guest.email}</p>}
                    {guest.notes && <p className="text-sm text-muted-foreground mt-1">{guest.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {(["yes", "maybe", "no"] as const).map(s => {
                      const Icon = statusIcons[s]
                      return (
                        <button key={s} onClick={() => updateStatus(guest.id, s)} className={`p-2 rounded-lg border ${guest.status === s ? statusColors[s] + " bg-current/10" : "text-muted-foreground hover:bg-muted"}`}>
                          <Icon className="size-4" />
                        </button>
                      )
                    })}
                    <Button variant="ghost" size="icon" onClick={() => deleteGuest(guest.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </div>
              )
            })}
          </div>

          {selectedEvent.guests.length === 0 && <p className="text-center py-8 text-muted-foreground">No guests yet. Add your first guest above.</p>}
        </>
      )}

      {events.length === 0 && <p className="text-center py-8 text-muted-foreground">Create an event to start tracking RSVPs</p>}
    </div>
  )
}
