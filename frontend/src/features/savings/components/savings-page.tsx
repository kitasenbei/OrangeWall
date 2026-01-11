import { useState } from "react"
import { Plus, PiggyBank, Target, TrendingUp, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface SavingsGoal { id: string; name: string; target: number; saved: number; deadline: string; color: string }

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"]

const initialGoals: SavingsGoal[] = [
  { id: "1", name: "Emergency Fund", target: 10000, saved: 6500, deadline: "2025-06-01", color: "#3b82f6" },
  { id: "2", name: "Vacation", target: 3000, saved: 1200, deadline: "2025-08-15", color: "#10b981" },
  { id: "3", name: "New Laptop", target: 2000, saved: 800, deadline: "2025-04-01", color: "#8b5cf6" },
]

export function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [name, setName] = useState(""); const [target, setTarget] = useState(""); const [saved, setSaved] = useState("0")
  const [deadline, setDeadline] = useState(""); const [color, setColor] = useState(colors[0])

  const handleSave = () => {
    if (!name.trim() || !target) return
    const data = { name, target: parseFloat(target), saved: parseFloat(saved) || 0, deadline, color }
    if (editingGoal) { setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...g, ...data } : g)) }
    else { setGoals(prev => [...prev, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const resetForm = () => { setName(""); setTarget(""); setSaved("0"); setDeadline(""); setColor(colors[0]); setEditingGoal(null) }
  const openEdit = (g: SavingsGoal) => { setEditingGoal(g); setName(g.name); setTarget(g.target.toString()); setSaved(g.saved.toString()); setDeadline(g.deadline); setColor(g.color); setDialogOpen(true) }
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id))
  const addToGoal = (id: string, amount: number) => setGoals(prev => prev.map(g => g.id === id ? { ...g, saved: Math.min(g.saved + amount, g.target) } : g))

  const totalTarget = goals.reduce((s, g) => s + g.target, 0)
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Savings Goals</h1><p className="text-sm text-muted-foreground">Track your financial goals</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingGoal ? "Edit" : "Add"} Goal</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Goal Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Emergency Fund" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Target Amount</Label><Input type="number" value={target} onChange={e => setTarget(e.target.value)} /></div>
                <div className="space-y-2"><Label>Already Saved</Label><Input type="number" value={saved} onChange={e => setSaved(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colors.map(c => (
                      <button key={c} onClick={() => setColor(c)} className="size-8 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: c, borderColor: color === c ? "white" : "transparent" }} />
                    ))}
                  </div>
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">{editingGoal ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center"><PiggyBank className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">${totalSaved.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Saved</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Target className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">${totalTarget.toLocaleString()}</div><div className="text-xs text-muted-foreground">Total Goals</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><TrendingUp className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{Math.round(overallProgress)}%</div><div className="text-xs text-muted-foreground">Overall Progress</div></div>
      </div>

      <div className="space-y-4">
        {goals.map(goal => {
          const progress = (goal.saved / goal.target) * 100
          const remaining = goal.target - goal.saved
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
          return (
            <div key={goal.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full" style={{ backgroundColor: goal.color }} />
                  <div><h3 className="font-medium">{goal.name}</h3>{daysLeft !== null && <p className="text-sm text-muted-foreground">{daysLeft > 0 ? `${daysLeft} days left` : "Past deadline"}</p>}</div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(goal)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteGoal(goal.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Progress value={progress} className="flex-1 h-3" style={{ ["--progress-color" as string]: goal.color }} />
                <span className="text-sm font-medium w-12 text-right">{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">${goal.saved.toLocaleString()} of ${goal.target.toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">${remaining.toLocaleString()} to go</span>
                  <Button size="sm" variant="outline" onClick={() => addToGoal(goal.id, 100)}>+ $100</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && <div className="text-center py-12 text-muted-foreground"><PiggyBank className="size-12 mx-auto mb-4 opacity-50" /><p>No savings goals yet</p></div>}
    </div>
  )
}
