import { useState } from "react"
import {
  Plus,
  Gift,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  ShoppingCart,
  Check,
  Link as LinkIcon,
  DollarSign,
  Package,
  Sparkles,
  Filter
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
import { cn } from "@/lib/utils"

type Priority = "low" | "medium" | "high" | "must-have"

interface WishlistItem {
  id: string
  name: string
  description: string
  price: number | null
  url: string
  category: string
  priority: Priority
  purchased: boolean
  createdAt: Date
}

const categories = [
  "Electronics", "Books", "Clothing", "Home", "Gaming",
  "Sports", "Music", "Art", "Travel", "Other"
]

const priorityConfig: Record<Priority, { label: string; color: string; bgColor: string }> = {
  "low": { label: "Low", color: "text-slate-500", bgColor: "bg-slate-500/10" },
  "medium": { label: "Medium", color: "text-blue-500", bgColor: "bg-blue-500/10" },
  "high": { label: "High", color: "text-orange-500", bgColor: "bg-orange-500/10" },
  "must-have": { label: "Must Have", color: "text-red-500", bgColor: "bg-red-500/10" },
}

const initialItems: WishlistItem[] = [
  {
    id: "1",
    name: "Sony WH-1000XM5 Headphones",
    description: "Best noise-cancelling wireless headphones",
    price: 399,
    url: "https://amazon.com",
    category: "Electronics",
    priority: "high",
    purchased: false,
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Kindle Paperwhite",
    description: "E-reader with warm light, 16GB",
    price: 149,
    url: "https://amazon.com",
    category: "Electronics",
    priority: "medium",
    purchased: false,
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Atomic Habits by James Clear",
    description: "Book about building good habits",
    price: 15,
    url: "",
    category: "Books",
    priority: "low",
    purchased: true,
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: "4",
    name: "Standing Desk Converter",
    description: "Adjustable desk riser for better ergonomics",
    price: 299,
    url: "https://amazon.com",
    category: "Home",
    priority: "must-have",
    purchased: false,
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Nintendo Switch OLED",
    description: "Gaming console with improved display",
    price: 349,
    url: "",
    category: "Gaming",
    priority: "medium",
    purchased: false,
    createdAt: new Date(),
  },
]

export function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(initialItems)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [showPurchased, setShowPurchased] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("Electronics")
  const [priority, setPriority] = useState<Priority>("medium")

  const filteredItems = items.filter(item => {
    if (filterCategory !== "all" && item.category !== filterCategory) return false
    if (filterPriority !== "all" && item.priority !== filterPriority) return false
    if (!showPurchased && item.purchased) return false
    return true
  })

  const handleSave = () => {
    if (!name.trim()) return

    if (editingItem) {
      setItems(prev => prev.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name,
              description,
              price: price ? parseFloat(price) : null,
              url,
              category,
              priority,
            }
          : item
      ))
    } else {
      const newItem: WishlistItem = {
        id: Date.now().toString(),
        name,
        description,
        price: price ? parseFloat(price) : null,
        url,
        category,
        priority,
        purchased: false,
        createdAt: new Date(),
      }
      setItems(prev => [newItem, ...prev])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setUrl("")
    setCategory("Electronics")
    setPriority("medium")
    setEditingItem(null)
  }

  const openEdit = (item: WishlistItem) => {
    setEditingItem(item)
    setName(item.name)
    setDescription(item.description)
    setPrice(item.price?.toString() || "")
    setUrl(item.url)
    setCategory(item.category)
    setPriority(item.priority)
    setDialogOpen(true)
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const togglePurchased = (id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, purchased: !item.purchased } : item
    ))
  }

  // Stats
  const totalValue = items
    .filter(i => !i.purchased)
    .reduce((sum, i) => sum + (i.price || 0), 0)

  const purchasedValue = items
    .filter(i => i.purchased)
    .reduce((sum, i) => sum + (i.price || 0), 0)

  const mustHaveCount = items.filter(i => i.priority === "must-have" && !i.purchased).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground">Track items you want to buy</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="size-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add to Wishlist"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Sony WH-1000XM5"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why do you want this?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {(Object.keys(priorityConfig) as Priority[]).map((p) => {
                    const config = priorityConfig[p]
                    return (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1",
                          priority === p
                            ? `${config.bgColor} ${config.color}`
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {config.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingItem ? "Save Changes" : "Add to Wishlist"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Gift className="size-4" />
            <span className="text-sm">Total Items</span>
          </div>
          <span className="text-2xl font-semibold">{items.filter(i => !i.purchased).length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="size-4" />
            <span className="text-sm">Total Value</span>
          </div>
          <span className="text-2xl font-semibold">${totalValue.toLocaleString()}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sparkles className="size-4" />
            <span className="text-sm">Must Haves</span>
          </div>
          <span className="text-2xl font-semibold">{mustHaveCount}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <ShoppingCart className="size-4" />
            <span className="text-sm">Purchased</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold">{items.filter(i => i.purchased).length}</span>
            <span className="text-sm text-muted-foreground">(${purchasedValue})</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Filter:</span>
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(Object.keys(priorityConfig) as Priority[]).map((p) => (
              <SelectItem key={p} value={p}>{priorityConfig[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showPurchased ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowPurchased(!showPurchased)}
        >
          <Check className="size-4 mr-2" />
          Show Purchased
        </Button>
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => {
          const prioConfig = priorityConfig[item.priority]
          return (
            <div
              key={item.id}
              className={cn(
                "bg-card border rounded-lg p-4",
                item.purchased && "opacity-60"
              )}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <button
                  onClick={() => togglePurchased(item.id)}
                  className={cn(
                    "mt-1 size-5 rounded border-2 flex items-center justify-center transition-colors",
                    item.purchased
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 hover:border-primary"
                  )}
                >
                  {item.purchased && <Check className="size-3" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={cn(
                        "font-medium",
                        item.purchased && "line-through"
                      )}>
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {item.price && (
                        <span className="text-lg font-semibold">
                          ${item.price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-2 py-1 bg-muted rounded text-xs">
                      {item.category}
                    </span>
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      prioConfig.bgColor,
                      prioConfig.color
                    )}>
                      {prioConfig.label}
                    </span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(item)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => togglePurchased(item.id)}>
                      <ShoppingCart className="size-4 mr-2" />
                      {item.purchased ? "Mark Unpurchased" : "Mark Purchased"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="size-12 mx-auto mb-4 opacity-50" />
            <p>No items found</p>
            <p className="text-sm">
              {items.length === 0
                ? "Add items to your wishlist"
                : "Try adjusting your filters"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
