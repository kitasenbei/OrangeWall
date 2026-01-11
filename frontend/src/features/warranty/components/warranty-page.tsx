import { useState } from "react"
import { Plus, Shield, Calendar, MoreVertical, Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Warranty {
  id: string
  product: string
  brand: string
  purchaseDate: string
  expiryDate: string
  retailer: string
  notes: string
}

const initialWarranties: Warranty[] = [
  { id: "1", product: "MacBook Pro", brand: "Apple", purchaseDate: "2024-01-15", expiryDate: "2027-01-15", retailer: "Apple Store", notes: "AppleCare+ included" },
  { id: "2", product: "Refrigerator", brand: "Samsung", purchaseDate: "2023-06-20", expiryDate: "2025-06-20", retailer: "Best Buy", notes: "Extended warranty purchased" },
  { id: "3", product: "TV 55\"", brand: "LG", purchaseDate: "2024-11-25", expiryDate: "2025-11-25", retailer: "Amazon", notes: "" },
]

export function WarrantyPage() {
  const [warranties, setWarranties] = useState<Warranty[]>(initialWarranties)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Warranty | null>(null)
  const [product, setProduct] = useState(""); const [brand, setBrand] = useState("")
  const [purchaseDate, setPurchaseDate] = useState(""); const [expiryDate, setExpiryDate] = useState("")
  const [retailer, setRetailer] = useState(""); const [notes, setNotes] = useState("")

  const resetForm = () => { setProduct(""); setBrand(""); setPurchaseDate(""); setExpiryDate(""); setRetailer(""); setNotes(""); setEditing(null) }

  const handleSave = () => {
    if (!product || !expiryDate) return
    const data = { product, brand, purchaseDate, expiryDate, retailer, notes }
    if (editing) { setWarranties(warranties.map(w => w.id === editing.id ? { ...w, ...data } : w)) }
    else { setWarranties([...warranties, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const openEdit = (w: Warranty) => { setEditing(w); setProduct(w.product); setBrand(w.brand); setPurchaseDate(w.purchaseDate); setExpiryDate(w.expiryDate); setRetailer(w.retailer); setNotes(w.notes); setDialogOpen(true) }
  const deleteWarranty = (id: string) => setWarranties(warranties.filter(w => w.id !== id))

  const getDaysUntilExpiry = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const sorted = [...warranties].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
  const active = sorted.filter(w => getDaysUntilExpiry(w.expiryDate) > 0)
  const expired = sorted.filter(w => getDaysUntilExpiry(w.expiryDate) <= 0)

  const getStatus = (days: number) => {
    if (days <= 0) return { color: "text-muted-foreground", bg: "bg-muted", label: "Expired" }
    if (days <= 30) return { color: "text-red-500", bg: "bg-red-500/10", label: `${days} days left` }
    if (days <= 90) return { color: "text-yellow-500", bg: "bg-yellow-500/10", label: `${days} days left` }
    return { color: "text-green-500", bg: "bg-green-500/10", label: `${days} days left` }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Warranty Tracker</h1><p className="text-sm text-muted-foreground">Never miss a warranty expiration</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Warranty</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Warranty</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Product</Label><Input value={product} onChange={e => setProduct(e.target.value)} placeholder="MacBook Pro" /></div>
                <div className="space-y-2"><Label>Brand</Label><Input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Apple" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Retailer</Label><Input value={retailer} onChange={e => setRetailer(e.target.value)} placeholder="Best Buy" /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Receipt location, warranty details..." /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2"><CheckCircle className="size-4 text-green-500" />Active Warranties ({active.length})</Label>
          {active.map(w => {
            const days = getDaysUntilExpiry(w.expiryDate)
            const status = getStatus(days)
            return (
              <div key={w.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${status.bg}`}><Shield className={`size-5 ${status.color}`} /></div>
                    <div>
                      <h3 className="font-medium">{w.product}</h3>
                      <p className="text-sm text-muted-foreground">{w.brand}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {w.retailer && <span>{w.retailer}</span>}
                        <span className="flex items-center gap-1"><Calendar className="size-3" />Expires {new Date(w.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(w)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteWarranty(w.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {w.notes && <p className="mt-2 text-sm text-muted-foreground">{w.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {expired.length > 0 && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-muted-foreground"><AlertTriangle className="size-4" />Expired ({expired.length})</Label>
          {expired.map(w => (
            <div key={w.id} className="bg-card border rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div><h3 className="font-medium">{w.product}</h3><p className="text-sm text-muted-foreground">{w.brand} • Expired {new Date(w.expiryDate).toLocaleDateString()}</p></div>
                <Button variant="ghost" size="icon" onClick={() => deleteWarranty(w.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {warranties.length === 0 && <p className="text-center py-8 text-muted-foreground">No warranties tracked</p>}
    </div>
  )
}
