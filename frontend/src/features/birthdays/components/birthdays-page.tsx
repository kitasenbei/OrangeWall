import { useState } from "react"
import { Plus, Cake, Gift, Bell, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Birthday { id: string; name: string; date: string; notes: string }

const initialBirthdays: Birthday[] = [
  { id: "1", name: "Mom", date: "1965-03-15", notes: "Likes flowers and books" },
  { id: "2", name: "Dad", date: "1962-07-22", notes: "Golf equipment" },
  { id: "3", name: "Sarah", date: "1995-01-08", notes: "Best friend" },
  { id: "4", name: "Mike", date: "1990-12-25", notes: "Brother" },
  { id: "5", name: "Emma", date: "2018-06-10", notes: "Niece - loves unicorns" },
]

function getDaysUntil(dateStr: string): number {
  const today = new Date()
  const [, month, day] = dateStr.split("-").map(Number)
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((next.getTime() - today.getTime()) / 86400000)
}

function getAge(dateStr: string): number {
  const [year] = dateStr.split("-").map(Number)
  return new Date().getFullYear() - year
}

export function BirthdaysPage() {
  const [birthdays, setBirthdays] = useState<Birthday[]>(initialBirthdays)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBday, setEditingBday] = useState<Birthday | null>(null)
  const [name, setName] = useState(""); const [date, setDate] = useState(""); const [notes, setNotes] = useState("")

  const handleSave = () => {
    if (!name.trim() || !date) return
    if (editingBday) { setBirthdays(prev => prev.map(b => b.id === editingBday.id ? { ...b, name, date, notes } : b)) }
    else { setBirthdays(prev => [...prev, { id: Date.now().toString(), name, date, notes }]) }
    setName(""); setDate(""); setNotes(""); setEditingBday(null); setDialogOpen(false)
  }

  const openEdit = (b: Birthday) => { setEditingBday(b); setName(b.name); setDate(b.date); setNotes(b.notes); setDialogOpen(true) }
  const deleteBday = (id: string) => setBirthdays(prev => prev.filter(b => b.id !== id))

  const sorted = [...birthdays].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
  const upcoming = sorted.filter(b => getDaysUntil(b.date) <= 30)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Birthdays</h1><p className="text-sm text-muted-foreground">Never miss a birthday</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditingBday(null); setName(""); setDate(""); setNotes("") } }}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Birthday</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingBday ? "Edit" : "Add"} Birthday</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="space-y-2"><Label>Birthday</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="space-y-2"><Label>Gift Ideas / Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <Button onClick={handleSave} className="w-full">{editingBday ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center"><Cake className="size-5 mx-auto mb-2 text-pink-500" /><div className="text-2xl font-semibold">{birthdays.length}</div><div className="text-xs text-muted-foreground">Total</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Bell className="size-5 mx-auto mb-2 text-orange-500" /><div className="text-2xl font-semibold">{upcoming.length}</div><div className="text-xs text-muted-foreground">Next 30 Days</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Gift className="size-5 mx-auto mb-2 text-purple-500" /><div className="text-2xl font-semibold">{sorted[0] ? getDaysUntil(sorted[0].date) : "-"}</div><div className="text-xs text-muted-foreground">Days to Next</div></div>
      </div>

      {upcoming.length > 0 && (
        <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg p-4">
          <h2 className="font-medium mb-3 flex items-center gap-2"><Bell className="size-4 text-orange-500" />Coming Up</h2>
          <div className="flex flex-wrap gap-2">
            {upcoming.map(b => {
              const days = getDaysUntil(b.date)
              return <span key={b.id} className={cn("px-3 py-1 rounded-full text-sm", days === 0 ? "bg-pink-500 text-white" : days <= 7 ? "bg-orange-500/20 text-orange-600" : "bg-muted")}>{b.name} {days === 0 ? "🎂 Today!" : `in ${days}d`}</span>
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map(b => {
          const days = getDaysUntil(b.date)
          const age = getAge(b.date)
          return (
            <div key={b.id} className={cn("bg-card border rounded-lg p-4 flex items-center gap-4", days === 0 && "border-pink-500")}>
              <div className={cn("size-12 rounded-full flex items-center justify-center text-lg", days === 0 ? "bg-pink-500 text-white" : "bg-muted")}>
                {days === 0 ? "🎂" : <Cake className="size-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{b.name}</h3>
                <p className="text-sm text-muted-foreground">{new Date(b.date).toLocaleDateString("en", { month: "long", day: "numeric" })} • Turning {age + 1}</p>
                {b.notes && <p className="text-sm text-muted-foreground mt-1">{b.notes}</p>}
              </div>
              <div className="text-right mr-2">
                <span className={cn("text-lg font-medium", days === 0 ? "text-pink-500" : days <= 7 ? "text-orange-500" : "text-muted-foreground")}>
                  {days === 0 ? "Today!" : `${days} days`}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(b)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteBday(b.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>

      {birthdays.length === 0 && <div className="text-center py-12 text-muted-foreground"><Cake className="size-12 mx-auto mb-4 opacity-50" /><p>No birthdays added</p></div>}
    </div>
  )
}
