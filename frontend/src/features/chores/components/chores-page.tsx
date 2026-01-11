import { useState } from "react"
import { Plus, Trash2, CheckCircle, Circle, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Chore { id: string; name: string; frequency: string; lastDone: string | null; assignee: string }

const frequencies = ["Daily", "Weekly", "Bi-weekly", "Monthly"]

const initialChores: Chore[] = [
  { id: "1", name: "Vacuum living room", frequency: "Weekly", lastDone: "2025-01-08", assignee: "Me" },
  { id: "2", name: "Do dishes", frequency: "Daily", lastDone: "2025-01-10", assignee: "Me" },
  { id: "3", name: "Clean bathroom", frequency: "Weekly", lastDone: "2025-01-05", assignee: "Partner" },
  { id: "4", name: "Take out trash", frequency: "Bi-weekly", lastDone: null, assignee: "Me" },
]

export function ChoresPage() {
  const [chores, setChores] = useState<Chore[]>(initialChores)
  const [newChore, setNewChore] = useState("")
  const [newFrequency, setNewFrequency] = useState("Weekly")
  const [newAssignee, setNewAssignee] = useState("Me")

  const addChore = () => {
    if (newChore.trim()) {
      setChores([...chores, { id: Date.now().toString(), name: newChore, frequency: newFrequency, lastDone: null, assignee: newAssignee }])
      setNewChore("")
    }
  }

  const markDone = (id: string) => {
    setChores(chores.map(c => c.id === id ? { ...c, lastDone: new Date().toISOString().split("T")[0] } : c))
  }

  const deleteChore = (id: string) => setChores(chores.filter(c => c.id !== id))

  const isDue = (chore: Chore) => {
    if (!chore.lastDone) return true
    const last = new Date(chore.lastDone)
    const now = new Date()
    const days = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    switch (chore.frequency) {
      case "Daily": return days >= 1
      case "Weekly": return days >= 7
      case "Bi-weekly": return days >= 14
      case "Monthly": return days >= 30
      default: return false
    }
  }

  const dueChores = chores.filter(isDue)
  const completedToday = chores.filter(c => c.lastDone === new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Chores</h1><p className="text-sm text-muted-foreground">Keep your home tidy</p></div>
        <div className="text-right">
          <p className="text-2xl font-bold">{completedToday.length}</p>
          <p className="text-sm text-muted-foreground">done today</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Input value={newChore} onChange={e => setNewChore(e.target.value)} placeholder="Add chore..." className="flex-1" onKeyDown={e => e.key === "Enter" && addChore()} />
        <select value={newFrequency} onChange={e => setNewFrequency(e.target.value)} className="h-10 rounded-md border bg-background px-3">
          {frequencies.map(f => <option key={f}>{f}</option>)}
        </select>
        <Input value={newAssignee} onChange={e => setNewAssignee(e.target.value)} placeholder="Assignee" className="w-28" />
        <Button onClick={addChore}><Plus className="size-4" /></Button>
      </div>

      {dueChores.length > 0 && (
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Sparkles className="size-4 text-yellow-500" />Due Now ({dueChores.length})</Label>
          {dueChores.map(chore => (
            <div key={chore.id} className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <button onClick={() => markDone(chore.id)}><Circle className="size-5 text-yellow-500" /></button>
              <Home className="size-4 text-muted-foreground" />
              <div className="flex-1"><p className="font-medium">{chore.name}</p><p className="text-xs text-muted-foreground">{chore.frequency} • {chore.assignee}</p></div>
              <Button size="sm" variant="outline" onClick={() => markDone(chore.id)}><CheckCircle className="size-4 mr-1" />Done</Button>
              <Button size="icon" variant="ghost" onClick={() => deleteChore(chore.id)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>All Chores</Label>
        {chores.map(chore => {
          const due = isDue(chore)
          return (
            <div key={chore.id} className={`flex items-center gap-3 bg-card border rounded-lg p-3 ${!due ? "opacity-60" : ""}`}>
              <button onClick={() => markDone(chore.id)}>{!due ? <CheckCircle className="size-5 text-green-500" /> : <Circle className="size-5 text-muted-foreground" />}</button>
              <div className="flex-1"><p className="font-medium">{chore.name}</p><p className="text-xs text-muted-foreground">{chore.frequency} • {chore.assignee} • {chore.lastDone ? `Last: ${chore.lastDone}` : "Never done"}</p></div>
              <Button size="icon" variant="ghost" onClick={() => deleteChore(chore.id)}><Trash2 className="size-4" /></Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
