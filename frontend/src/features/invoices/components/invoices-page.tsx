import { useState } from "react"
import { Plus, FileText, DollarSign, Clock, CheckCircle, MoreVertical, Pencil, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface InvoiceItem { description: string; quantity: number; rate: number }
interface Invoice { id: string; number: string; client: string; email: string; items: InvoiceItem[]; status: "draft" | "sent" | "paid"; date: string; dueDate: string }

const initialInvoices: Invoice[] = [
  { id: "1", number: "INV-001", client: "Acme Corp", email: "billing@acme.com", items: [{ description: "Web Development", quantity: 40, rate: 100 }], status: "paid", date: "2025-01-01", dueDate: "2025-01-15" },
  { id: "2", number: "INV-002", client: "TechStart Inc", email: "finance@techstart.io", items: [{ description: "UI Design", quantity: 20, rate: 80 }, { description: "Consulting", quantity: 5, rate: 150 }], status: "sent", date: "2025-01-05", dueDate: "2025-01-20" },
  { id: "3", number: "INV-003", client: "Local Business", email: "owner@localbiz.com", items: [{ description: "Logo Design", quantity: 1, rate: 500 }], status: "draft", date: "2025-01-08", dueDate: "2025-01-22" },
]

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [client, setClient] = useState(""); const [email, setEmail] = useState("")
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, rate: 0 }])
  const [dueDate, setDueDate] = useState("")

  const handleSave = () => {
    if (!client.trim() || items.every(i => !i.description)) return
    const validItems = items.filter(i => i.description.trim())
    const data = { client, email, items: validItems, dueDate, date: new Date().toISOString().split("T")[0], status: "draft" as const }
    if (editingInvoice) { setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? { ...inv, ...data } : inv)) }
    else { setInvoices(prev => [...prev, { id: Date.now().toString(), number: `INV-${String(prev.length + 1).padStart(3, "0")}`, ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const resetForm = () => { setClient(""); setEmail(""); setItems([{ description: "", quantity: 1, rate: 0 }]); setDueDate(""); setEditingInvoice(null) }
  const openEdit = (inv: Invoice) => { setEditingInvoice(inv); setClient(inv.client); setEmail(inv.email); setItems(inv.items); setDueDate(inv.dueDate); setDialogOpen(true) }
  const deleteInvoice = (id: string) => setInvoices(prev => prev.filter(inv => inv.id !== id))
  const updateStatus = (id: string, status: Invoice["status"]) => setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))

  const addItem = () => setItems(prev => [...prev, { description: "", quantity: 1, rate: 0 }])
  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }
  const removeItem = (index: number) => setItems(prev => prev.filter((_, i) => i !== index))

  const getTotal = (inv: Invoice) => inv.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, inv) => sum + getTotal(inv), 0)
  const totalPending = invoices.filter(i => i.status === "sent").reduce((sum, inv) => sum + getTotal(inv), 0)

  const statusColors = { draft: "bg-gray-500/10 text-gray-500", sent: "bg-yellow-500/10 text-yellow-500", paid: "bg-green-500/10 text-green-500" }
  const statusIcons = { draft: FileText, sent: Clock, paid: CheckCircle }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Invoices</h1><p className="text-sm text-muted-foreground">Create and manage invoices</p></div>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />New Invoice</Button></DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>{editingInvoice ? "Edit" : "New"} Invoice</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Client Name</Label><Input value={client} onChange={e => setClient(e.target.value)} /></div>
                <div className="space-y-2"><Label>Client Email</Label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between"><Label>Line Items</Label><Button size="sm" variant="outline" onClick={addItem}><Plus className="size-3 mr-1" />Add Item</Button></div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="Description" className="flex-1" />
                      <Input type="number" value={item.quantity} onChange={e => updateItem(i, "quantity", parseInt(e.target.value) || 0)} className="w-20" placeholder="Qty" />
                      <Input type="number" value={item.rate} onChange={e => updateItem(i, "rate", parseFloat(e.target.value) || 0)} className="w-24" placeholder="Rate" />
                      <span className="w-24 flex items-center justify-end text-sm font-medium">${(item.quantity * item.rate).toFixed(2)}</span>
                      {items.length > 1 && <Button size="icon" variant="ghost" onClick={() => removeItem(i)}><Trash2 className="size-4" /></Button>}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end pt-2 border-t"><span className="font-medium">Total: ${items.reduce((s, i) => s + i.quantity * i.rate, 0).toFixed(2)}</span></div>
              </div>
              <Button onClick={handleSave} className="w-full">{editingInvoice ? "Save" : "Create"} Invoice</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="size-4" /><span className="text-sm">Revenue</span></div><span className="text-2xl font-semibold text-green-500">${totalRevenue.toLocaleString()}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Clock className="size-4" /><span className="text-sm">Pending</span></div><span className="text-2xl font-semibold text-yellow-500">${totalPending.toLocaleString()}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="size-4" /><span className="text-sm">Invoices</span></div><span className="text-2xl font-semibold">{invoices.length}</span></div>
      </div>

      <div className="space-y-3">
        {invoices.map(invoice => {
          const total = getTotal(invoice)
          const StatusIcon = statusIcons[invoice.status]
          return (
            <div key={invoice.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div><h3 className="font-medium">{invoice.number}</h3><p className="text-sm text-muted-foreground">{invoice.client}</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn("px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1", statusColors[invoice.status])}>
                    <StatusIcon className="size-3" />{invoice.status}
                  </span>
                  <span className="font-semibold">${total.toLocaleString()}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewingInvoice(invoice)}><Eye className="size-4 mr-2" />View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEdit(invoice)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                      {invoice.status === "draft" && <DropdownMenuItem onClick={() => updateStatus(invoice.id, "sent")}><Clock className="size-4 mr-2" />Mark Sent</DropdownMenuItem>}
                      {invoice.status === "sent" && <DropdownMenuItem onClick={() => updateStatus(invoice.id, "paid")}><CheckCircle className="size-4 mr-2" />Mark Paid</DropdownMenuItem>}
                      <DropdownMenuItem onClick={() => deleteInvoice(invoice.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Date: {invoice.date}</span>
                <span>Due: {invoice.dueDate}</span>
                <span>{invoice.items.length} item(s)</span>
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Invoice {viewingInvoice?.number}</DialogTitle></DialogHeader>
          {viewingInvoice && (
            <div className="space-y-4 pt-4">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Client:</span><span>{viewingInvoice.client}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Email:</span><span>{viewingInvoice.email}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Date:</span><span>{viewingInvoice.date}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Due:</span><span>{viewingInvoice.dueDate}</span></div>
              <div className="border-t pt-4 space-y-2">
                {viewingInvoice.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{item.description} × {item.quantity}</span>
                    <span>${(item.quantity * item.rate).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total</span>
                  <span>${getTotal(viewingInvoice).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {invoices.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="size-12 mx-auto mb-4 opacity-50" /><p>No invoices yet</p></div>}
    </div>
  )
}
