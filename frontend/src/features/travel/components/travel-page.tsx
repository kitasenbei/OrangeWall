import { useState } from "react"
import { Plus, Plane, MapPin, Calendar, MoreVertical, Pencil, Trash2, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface TripItem { id: string; text: string; done: boolean; category: "packing" | "todo" | "booking" }
interface Trip { id: string; destination: string; startDate: string; endDate: string; notes: string; items: TripItem[] }

const initialTrips: Trip[] = [
  {
    id: "1", destination: "Tokyo, Japan", startDate: "2025-04-01", endDate: "2025-04-10", notes: "Spring trip to see cherry blossoms",
    items: [
      { id: "1", text: "Book flights", done: true, category: "booking" },
      { id: "2", text: "Reserve hotel", done: true, category: "booking" },
      { id: "3", text: "Get travel insurance", done: false, category: "todo" },
      { id: "4", text: "Passport", done: true, category: "packing" },
      { id: "5", text: "Camera", done: false, category: "packing" },
    ]
  },
  {
    id: "2", destination: "Paris, France", startDate: "2025-07-15", endDate: "2025-07-22", notes: "Summer vacation",
    items: [
      { id: "1", text: "Book Eurostar tickets", done: false, category: "booking" },
      { id: "2", text: "Museum passes", done: false, category: "todo" },
    ]
  },
]

export function TravelPage() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [destination, setDestination] = useState(""); const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState(""); const [notes, setNotes] = useState("")
  const [newItem, setNewItem] = useState(""); const [newItemCategory, setNewItemCategory] = useState<TripItem["category"]>("todo")

  const handleSave = () => {
    if (!destination.trim() || !startDate) return
    const data = { destination, startDate, endDate, notes, items: editingTrip?.items || [] }
    if (editingTrip) { setTrips(prev => prev.map(t => t.id === editingTrip.id ? { ...t, ...data } : t)) }
    else { setTrips(prev => [...prev, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const resetForm = () => { setDestination(""); setStartDate(""); setEndDate(""); setNotes(""); setEditingTrip(null) }
  const openEdit = (t: Trip) => { setEditingTrip(t); setDestination(t.destination); setStartDate(t.startDate); setEndDate(t.endDate); setNotes(t.notes); setDialogOpen(true) }
  const deleteTrip = (id: string) => { setTrips(prev => prev.filter(t => t.id !== id)); if (selectedTrip?.id === id) setSelectedTrip(null) }

  const addItem = (tripId: string) => {
    if (!newItem.trim()) return
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, items: [...t.items, { id: Date.now().toString(), text: newItem, done: false, category: newItemCategory }] } : t))
    setNewItem("")
  }

  const toggleItem = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, items: t.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) } : t))
  }

  const deleteItem = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(t => t.id === tripId ? { ...t, items: t.items.filter(i => i.id !== itemId) } : t))
  }

  const getDaysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const getTripDuration = (start: string, end: string) => Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1

  const categoryLabels = { packing: "Packing", todo: "To Do", booking: "Bookings" }
  const categoryColors = { packing: "text-blue-500", todo: "text-yellow-500", booking: "text-green-500" }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Travel Planner</h1><p className="text-sm text-muted-foreground">Plan your trips</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />New Trip</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingTrip ? "Edit" : "New"} Trip</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Destination</Label><Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g., Tokyo, Japan" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>End Date</Label><Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Trip notes..." /></div>
              <Button onClick={handleSave} className="w-full">{editingTrip ? "Save" : "Create"} Trip</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Upcoming Trips</h2>
          {trips.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(trip => {
            const daysUntil = getDaysUntil(trip.startDate)
            const duration = getTripDuration(trip.startDate, trip.endDate)
            const completedItems = trip.items.filter(i => i.done).length
            return (
              <div key={trip.id} onClick={() => setSelectedTrip(trip)} className={cn("bg-card border rounded-lg p-4 cursor-pointer transition-colors hover:border-primary", selectedTrip?.id === trip.id && "border-primary ring-1 ring-primary")}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center"><Plane className="size-5 text-primary" /></div>
                    <div>
                      <h3 className="font-medium">{trip.destination}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-3" />
                        <span>{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEdit(trip) }}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteTrip(trip.id) }} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className={cn("font-medium", daysUntil < 0 ? "text-muted-foreground" : daysUntil < 7 ? "text-yellow-500" : "text-green-500")}>
                    {daysUntil < 0 ? "Past trip" : daysUntil === 0 ? "Today!" : `${daysUntil} days away`}
                  </span>
                  <span className="text-muted-foreground">{duration} days</span>
                  <span className="text-muted-foreground">{completedItems}/{trip.items.length} items</span>
                </div>
              </div>
            )
          })}
          {trips.length === 0 && <div className="text-center py-12 text-muted-foreground"><Plane className="size-12 mx-auto mb-4 opacity-50" /><p>No trips planned</p></div>}
        </div>

        {selectedTrip && (
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">{selectedTrip.destination}</h2>
            </div>
            {selectedTrip.notes && <p className="text-sm text-muted-foreground">{selectedTrip.notes}</p>}

            <div className="space-y-4">
              {(["booking", "todo", "packing"] as const).map(category => {
                const categoryItems = selectedTrip.items.filter(i => i.category === category)
                if (categoryItems.length === 0 && category !== "todo") return null
                return (
                  <div key={category}>
                    <h3 className={cn("text-sm font-medium mb-2", categoryColors[category])}>{categoryLabels[category]}</h3>
                    <div className="space-y-1">
                      {categoryItems.map(item => (
                        <div key={item.id} className="flex items-center gap-2 group">
                          <button onClick={() => toggleItem(selectedTrip.id, item.id)} className="flex items-center gap-2 flex-1 text-left py-1">
                            {item.done ? <CheckCircle className="size-4 text-green-500" /> : <Circle className="size-4 text-muted-foreground" />}
                            <span className={cn("text-sm", item.done && "line-through text-muted-foreground")}>{item.text}</span>
                          </button>
                          <button onClick={() => deleteItem(selectedTrip.id, item.id)} className="opacity-0 group-hover:opacity-100 text-destructive"><Trash2 className="size-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-2 pt-2 border-t">
              <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add item..." className="flex-1" onKeyDown={e => e.key === "Enter" && addItem(selectedTrip.id)} />
              <select value={newItemCategory} onChange={e => setNewItemCategory(e.target.value as TripItem["category"])} className="h-10 rounded-md border bg-background px-2 text-sm">
                <option value="todo">To Do</option>
                <option value="packing">Packing</option>
                <option value="booking">Booking</option>
              </select>
              <Button onClick={() => addItem(selectedTrip.id)}><Plus className="size-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
