import { useState } from "react"
import { Plus, Pill, Clock, Bell, MoreVertical, Pencil, Trash2, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  times: string[]
  supply: number
  refillAt: number
  notes: string
  takenToday: string[]
}

const frequencies = ["Once daily", "Twice daily", "Three times daily", "As needed", "Weekly"]

const initialMeds: Medication[] = [
  { id: "1", name: "Vitamin D", dosage: "2000 IU", frequency: "Once daily", times: ["08:00"], supply: 60, refillAt: 10, notes: "Take with food", takenToday: ["08:00"] },
  { id: "2", name: "Omega-3", dosage: "1000mg", frequency: "Twice daily", times: ["08:00", "20:00"], supply: 45, refillAt: 10, notes: "", takenToday: ["08:00"] },
  { id: "3", name: "Magnesium", dosage: "400mg", frequency: "Once daily", times: ["21:00"], supply: 8, refillAt: 10, notes: "Before bed", takenToday: [] },
]

export function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>(initialMeds)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMed, setEditingMed] = useState<Medication | null>(null)

  const [name, setName] = useState("")
  const [dosage, setDosage] = useState("")
  const [frequency, setFrequency] = useState("Once daily")
  const [times, setTimes] = useState("08:00")
  const [supply, setSupply] = useState("")
  const [refillAt, setRefillAt] = useState("10")
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    if (!name.trim()) return
    const timeArray = times.split(",").map(t => t.trim())
    if (editingMed) {
      setMeds(prev => prev.map(m => m.id === editingMed.id ? { ...m, name, dosage, frequency, times: timeArray, supply: parseInt(supply) || 0, refillAt: parseInt(refillAt) || 10, notes } : m))
    } else {
      setMeds(prev => [...prev, { id: Date.now().toString(), name, dosage, frequency, times: timeArray, supply: parseInt(supply) || 0, refillAt: parseInt(refillAt) || 10, notes, takenToday: [] }])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setName(""); setDosage(""); setFrequency("Once daily"); setTimes("08:00")
    setSupply(""); setRefillAt("10"); setNotes(""); setEditingMed(null)
  }

  const openEdit = (med: Medication) => {
    setEditingMed(med); setName(med.name); setDosage(med.dosage); setFrequency(med.frequency)
    setTimes(med.times.join(", ")); setSupply(med.supply.toString()); setRefillAt(med.refillAt.toString()); setNotes(med.notes)
    setDialogOpen(true)
  }

  const toggleTaken = (medId: string, time: string) => {
    setMeds(prev => prev.map(m => {
      if (m.id !== medId) return m
      const taken = m.takenToday.includes(time)
      return { ...m, takenToday: taken ? m.takenToday.filter(t => t !== time) : [...m.takenToday, time], supply: taken ? m.supply + 1 : m.supply - 1 }
    }))
  }

  const deleteMed = (id: string) => setMeds(prev => prev.filter(m => m.id !== id))
  const lowSupply = meds.filter(m => m.supply <= m.refillAt)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground">Track medications and supplements</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Medication</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingMed ? "Edit" : "Add"} Medication</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Medication name" /></div>
                <div className="space-y-2"><Label>Dosage</Label><Input value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 500mg" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{frequencies.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
                </div>
                <div className="space-y-2"><Label>Times (comma-separated)</Label><Input value={times} onChange={e => setTimes(e.target.value)} placeholder="08:00, 20:00" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Current Supply</Label><Input type="number" value={supply} onChange={e => setSupply(e.target.value)} /></div>
                <div className="space-y-2"><Label>Refill Reminder At</Label><Input type="number" value={refillAt} onChange={e => setRefillAt(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Special instructions" /></div>
              <Button onClick={handleSave} className="w-full">{editingMed ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lowSupply.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="size-5 text-orange-500" />
          <div><p className="font-medium text-orange-600">Low Supply Alert</p><p className="text-sm text-orange-600/80">{lowSupply.map(m => m.name).join(", ")} need refill</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Pill className="size-4" /><span className="text-sm">Total Medications</span></div><span className="text-2xl font-semibold">{meds.length}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Check className="size-4" /><span className="text-sm">Taken Today</span></div><span className="text-2xl font-semibold">{meds.reduce((sum, m) => sum + m.takenToday.length, 0)} / {meds.reduce((sum, m) => sum + m.times.length, 0)}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Bell className="size-4" /><span className="text-sm">Need Refill</span></div><span className="text-2xl font-semibold">{lowSupply.length}</span></div>
      </div>

      <div className="space-y-3">
        {meds.map(med => (
          <div key={med.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn("size-10 rounded-lg flex items-center justify-center", med.supply <= med.refillAt ? "bg-orange-500/10" : "bg-primary/10")}>
                  <Pill className={cn("size-5", med.supply <= med.refillAt ? "text-orange-500" : "text-primary")} />
                </div>
                <div><h3 className="font-medium">{med.name}</h3><p className="text-sm text-muted-foreground">{med.dosage} • {med.frequency}</p></div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(med)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteMed(med.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-2 mb-3">
              {med.times.map(time => {
                const taken = med.takenToday.includes(time)
                return (
                  <button key={time} onClick={() => toggleTaken(med.id, time)} className={cn("px-3 py-1 rounded-full text-sm flex items-center gap-1 transition-colors", taken ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                    <Clock className="size-3" />{time}{taken && <Check className="size-3" />}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={cn(med.supply <= med.refillAt ? "text-orange-500" : "text-muted-foreground")}>{med.supply} remaining</span>
              {med.notes && <span className="text-muted-foreground">{med.notes}</span>}
            </div>
          </div>
        ))}
      </div>

      {meds.length === 0 && <div className="text-center py-12 text-muted-foreground"><Pill className="size-12 mx-auto mb-4 opacity-50" /><p>No medications tracked</p></div>}
    </div>
  )
}
