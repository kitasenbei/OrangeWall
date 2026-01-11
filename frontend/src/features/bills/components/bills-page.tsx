import { useState } from "react"
import { Plus, Trash2, Receipt, Calendar, CheckCircle, Circle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Bill { id: string; name: string; amount: number; dueDay: number; category: string; paid: boolean }

const categories = ["Utilities", "Rent/Mortgage", "Insurance", "Subscriptions", "Loans", "Other"]

const initialBills: Bill[] = [
  { id: "1", name: "Electric", amount: 120, dueDay: 15, category: "Utilities", paid: false },
  { id: "2", name: "Internet", amount: 80, dueDay: 20, category: "Utilities", paid: true },
  { id: "3", name: "Rent", amount: 1500, dueDay: 1, category: "Rent/Mortgage", paid: false },
  { id: "4", name: "Car Insurance", amount: 150, dueDay: 10, category: "Insurance", paid: false },
]

export function BillsPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [dueDay, setDueDay] = useState("1"); const [category, setCategory] = useState("Utilities")

  const handleSave = () => {
    if (!name || !amount) return
    setBills([...bills, { id: Date.now().toString(), name, amount: parseFloat(amount), dueDay: parseInt(dueDay), category, paid: false }])
    setName(""); setAmount(""); setDueDay("1"); setDialogOpen(false)
  }

  const togglePaid = (id: string) => setBills(bills.map(b => b.id === id ? { ...b, paid: !b.paid } : b))
  const deleteBill = (id: string) => setBills(bills.filter(b => b.id !== id))

  const today = new Date().getDate()
  const totalMonthly = bills.reduce((s, b) => s + b.amount, 0)
  const totalPaid = bills.filter(b => b.paid).reduce((s, b) => s + b.amount, 0)
  const totalDue = totalMonthly - totalPaid

  const sortedBills = [...bills].sort((a, b) => a.dueDay - b.dueDay)
  const overdueBills = sortedBills.filter(b => !b.paid && b.dueDay < today)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Bills</h1><p className="text-sm text-muted-foreground">Track monthly bills and payments</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Bill</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Bill</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Amount</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} /></div>
                <div className="space-y-2"><Label>Due Day</Label><Input type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} min={1} max={31} /></div>
              </div>
              <div className="space-y-2"><Label>Category</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">{categories.map(c => <option key={c}>{c}</option>)}</select>
              </div>
              <Button onClick={handleSave} className="w-full">Add Bill</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center"><Receipt className="size-5 mx-auto mb-2 text-muted-foreground" /><p className="text-sm text-muted-foreground">Monthly Total</p><p className="text-2xl font-bold">${totalMonthly.toLocaleString()}</p></div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center"><CheckCircle className="size-5 mx-auto mb-2 text-green-500" /><p className="text-sm text-muted-foreground">Paid</p><p className="text-2xl font-bold text-green-500">${totalPaid.toLocaleString()}</p></div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center"><AlertCircle className="size-5 mx-auto mb-2 text-red-500" /><p className="text-sm text-muted-foreground">Remaining</p><p className="text-2xl font-bold text-red-500">${totalDue.toLocaleString()}</p></div>
      </div>

      {overdueBills.length > 0 && (
        <div className="space-y-2">
          <Label className="text-red-500">Overdue</Label>
          {overdueBills.map(bill => (
            <div key={bill.id} className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <button onClick={() => togglePaid(bill.id)}><Circle className="size-5 text-red-500" /></button>
              <div className="flex-1"><p className="font-medium">{bill.name}</p><p className="text-xs text-muted-foreground">{bill.category} • Due {bill.dueDay}th</p></div>
              <span className="font-mono font-medium">${bill.amount}</span>
              <Button size="icon" variant="ghost" onClick={() => deleteBill(bill.id)}><Trash2 className="size-4" /></Button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <Label>All Bills</Label>
        {sortedBills.map(bill => (
          <div key={bill.id} className={`flex items-center gap-3 bg-card border rounded-lg p-3 ${bill.paid ? "opacity-60" : ""}`}>
            <button onClick={() => togglePaid(bill.id)}>{bill.paid ? <CheckCircle className="size-5 text-green-500" /> : <Circle className="size-5 text-muted-foreground" />}</button>
            <Calendar className="size-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground w-8">{bill.dueDay}th</span>
            <div className="flex-1"><p className={`font-medium ${bill.paid ? "line-through" : ""}`}>{bill.name}</p><p className="text-xs text-muted-foreground">{bill.category}</p></div>
            <span className="font-mono font-medium">${bill.amount}</span>
            <Button size="icon" variant="ghost" onClick={() => deleteBill(bill.id)}><Trash2 className="size-4" /></Button>
          </div>
        ))}
      </div>
    </div>
  )
}
