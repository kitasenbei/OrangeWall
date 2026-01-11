import { useState } from "react"
import {
  Plus,
  Search,
  Package,
  MapPin,
  DollarSign,
  MoreVertical,
  Pencil,
  Trash2,
  Tag,
  Box,
  Home,
  Laptop,
  Shirt,
  Wrench,
  UtensilsCrossed
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LucideIcon } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  category: string
  location: string
  quantity: number
  value: number
  purchaseDate: string
  notes: string
}

const categories: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "electronics", label: "Electronics", icon: Laptop },
  { id: "furniture", label: "Furniture", icon: Home },
  { id: "clothing", label: "Clothing", icon: Shirt },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "kitchen", label: "Kitchen", icon: UtensilsCrossed },
  { id: "other", label: "Other", icon: Box },
]

const locations = ["Living Room", "Bedroom", "Kitchen", "Garage", "Office", "Storage", "Other"]

const initialItems: InventoryItem[] = [
  { id: "1", name: "MacBook Pro 14\"", category: "electronics", location: "Office", quantity: 1, value: 1999, purchaseDate: "2023-06-15", notes: "Work laptop" },
  { id: "2", name: "Sony 65\" TV", category: "electronics", location: "Living Room", quantity: 1, value: 1200, purchaseDate: "2022-11-20", notes: "" },
  { id: "3", name: "Leather Sofa", category: "furniture", location: "Living Room", quantity: 1, value: 1500, purchaseDate: "2021-03-10", notes: "3-seater, brown" },
  { id: "4", name: "KitchenAid Mixer", category: "kitchen", location: "Kitchen", quantity: 1, value: 350, purchaseDate: "2023-01-05", notes: "Red color" },
  { id: "5", name: "Power Drill", category: "tools", location: "Garage", quantity: 1, value: 150, purchaseDate: "2022-08-12", notes: "DeWalt" },
]

function getCategoryIcon(categoryId: string): LucideIcon {
  return categories.find(c => c.id === categoryId)?.icon || Box
}

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(initialItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  const [name, setName] = useState("")
  const [category, setCategory] = useState("electronics")
  const [location, setLocation] = useState("Living Room")
  const [quantity, setQuantity] = useState("1")
  const [value, setValue] = useState("")
  const [purchaseDate, setPurchaseDate] = useState("")
  const [notes, setNotes] = useState("")

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterCategory !== "all" && item.category !== filterCategory) return false
    return true
  })

  const totalValue = items.reduce((sum, item) => sum + item.value * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const handleSave = () => {
    if (!name.trim()) return

    if (editingItem) {
      setItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? { ...item, name, category, location, quantity: parseInt(quantity) || 1, value: parseFloat(value) || 0, purchaseDate, notes }
          : item
      ))
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        name, category, location,
        quantity: parseInt(quantity) || 1,
        value: parseFloat(value) || 0,
        purchaseDate, notes,
      }
      setItems(prev => [newItem, ...prev])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setName(""); setCategory("electronics"); setLocation("Living Room")
    setQuantity("1"); setValue(""); setPurchaseDate(""); setNotes("")
    setEditingItem(null)
  }

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setName(item.name); setCategory(item.category); setLocation(item.location)
    setQuantity(item.quantity.toString()); setValue(item.value.toString())
    setPurchaseDate(item.purchaseDate); setNotes(item.notes)
    setDialogOpen(true)
  }

  const deleteItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track your belongings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Value ($)</Label>
                  <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
              <Button onClick={handleSave} className="w-full">{editingItem ? "Save" : "Add Item"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Package className="size-4" /><span className="text-sm">Total Items</span></div>
          <span className="text-2xl font-semibold">{totalItems}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="size-4" /><span className="text-sm">Total Value</span></div>
          <span className="text-2xl font-semibold">${totalValue.toLocaleString()}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Tag className="size-4" /><span className="text-sm">Categories</span></div>
          <span className="text-2xl font-semibold">{new Set(items.map(i => i.category)).size}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filteredItems.map(item => {
          const Icon = getCategoryIcon(item.category)
          return (
            <div key={item.id} className="bg-card border rounded-lg p-4 flex items-center gap-4">
              <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                <Icon className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-3" />{item.location}
                  {item.quantity > 1 && <span>• Qty: {item.quantity}</span>}
                </p>
              </div>
              <div className="text-right">
                <div className="font-medium">${item.value.toLocaleString()}</div>
                {item.purchaseDate && <div className="text-xs text-muted-foreground">{item.purchaseDate}</div>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(item)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="size-12 mx-auto mb-4 opacity-50" />
          <p>No items found</p>
        </div>
      )}
    </div>
  )
}
