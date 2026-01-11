import { useState } from "react"
import { Plus, CreditCard, DollarSign, TrendingDown, Calendar, MoreVertical, Pencil, Trash2, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"

interface Debt { id: string; name: string; type: string; total: number; paid: number; interest: number; minPayment: number; dueDate: string }

const debtTypes = ["Credit Card", "Student Loan", "Car Loan", "Mortgage", "Personal Loan", "Medical", "Other"]

const initialDebts: Debt[] = [
  { id: "1", name: "Chase Sapphire", type: "Credit Card", total: 5000, paid: 2000, interest: 19.99, minPayment: 150, dueDate: "15" },
  { id: "2", name: "Student Loan", type: "Student Loan", total: 25000, paid: 8000, interest: 4.5, minPayment: 280, dueDate: "1" },
  { id: "3", name: "Car Payment", type: "Car Loan", total: 18000, paid: 6000, interest: 6.5, minPayment: 350, dueDate: "20" },
]

export function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null)
  const [name, setName] = useState(""); const [type, setType] = useState("Credit Card"); const [total, setTotal] = useState("")
  const [paid, setPaid] = useState("0"); const [interest, setInterest] = useState(""); const [minPayment, setMinPayment] = useState(""); const [dueDate, setDueDate] = useState("1")

  const handleSave = () => {
    if (!name.trim() || !total) return
    const data = { name, type, total: parseFloat(total), paid: parseFloat(paid) || 0, interest: parseFloat(interest) || 0, minPayment: parseFloat(minPayment) || 0, dueDate }
    if (editingDebt) { setDebts(prev => prev.map(d => d.id === editingDebt.id ? { ...d, ...data } : d)) }
    else { setDebts(prev => [...prev, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const resetForm = () => { setName(""); setType("Credit Card"); setTotal(""); setPaid("0"); setInterest(""); setMinPayment(""); setDueDate("1"); setEditingDebt(null) }
  const openEdit = (d: Debt) => { setEditingDebt(d); setName(d.name); setType(d.type); setTotal(d.total.toString()); setPaid(d.paid.toString()); setInterest(d.interest.toString()); setMinPayment(d.minPayment.toString()); setDueDate(d.dueDate); setDialogOpen(true) }
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id))

  const addPayment = (id: string, amount: number) => setDebts(prev => prev.map(d => d.id === id ? { ...d, paid: Math.min(d.paid + amount, d.total) } : d))

  const totalDebt = debts.reduce((s, d) => s + d.total, 0)
  const totalPaid = debts.reduce((s, d) => s + d.paid, 0)
  const totalRemaining = totalDebt - totalPaid
  const monthlyMin = debts.reduce((s, d) => s + d.minPayment, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Debt Tracker</h1><p className="text-sm text-muted-foreground">Track and pay down your debts</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Debt</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingDebt ? "Edit" : "Add"} Debt</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Type</Label><select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">{debtTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Total Amount</Label><Input type="number" value={total} onChange={e => setTotal(e.target.value)} /></div>
                <div className="space-y-2"><Label>Already Paid</Label><Input type="number" value={paid} onChange={e => setPaid(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Interest %</Label><Input type="number" value={interest} onChange={e => setInterest(e.target.value)} /></div>
                <div className="space-y-2"><Label>Min Payment</Label><Input type="number" value={minPayment} onChange={e => setMinPayment(e.target.value)} /></div>
                <div className="space-y-2"><Label>Due Day</Label><Input type="number" value={dueDate} onChange={e => setDueDate(e.target.value)} min="1" max="31" /></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editingDebt ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><CreditCard className="size-4" /><span className="text-sm">Total Debt</span></div><span className="text-2xl font-semibold">${totalDebt.toLocaleString()}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><TrendingDown className="size-4" /><span className="text-sm">Remaining</span></div><span className="text-2xl font-semibold text-red-500">${totalRemaining.toLocaleString()}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="size-4" /><span className="text-sm">Paid Off</span></div><span className="text-2xl font-semibold text-green-500">${totalPaid.toLocaleString()}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="size-4" /><span className="text-sm">Monthly Min</span></div><span className="text-2xl font-semibold">${monthlyMin.toLocaleString()}</span></div>
      </div>

      <div className="space-y-3">
        {debts.map(debt => {
          const remaining = debt.total - debt.paid
          const progress = (debt.paid / debt.total) * 100
          return (
            <div key={debt.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-medium">{debt.name}</h3><p className="text-sm text-muted-foreground">{debt.type} • Due on {debt.dueDate}th</p></div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(debt)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteDebt(debt.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4 mb-3">
                <Progress value={progress} className="flex-1 h-2" />
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1"><Percent className="size-3" />{debt.interest}% APR</span>
                  <span>Min: ${debt.minPayment}/mo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-medium">${remaining.toLocaleString()} left</span>
                  <Button size="sm" variant="outline" onClick={() => addPayment(debt.id, debt.minPayment)}>+ Payment</Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {debts.length === 0 && <div className="text-center py-12 text-muted-foreground"><CreditCard className="size-12 mx-auto mb-4 opacity-50" /><p>No debts tracked</p></div>}
    </div>
  )
}
