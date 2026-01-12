import { useState, useEffect } from "react"
import {
  Plus,
  Trash2,
  Check,
  Copy,
  MoreHorizontal,
  Search,
  SortAsc,
  X,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  Apple,
  Milk,
  Beef,
  Carrot,
  Croissant,
  Wine,
  Snowflake,
  Pill,
  Sparkles,
  Package,
  Edit2,
  Loader2,
} from "lucide-react"
import { useGrocery, type GroceryItem } from "@/hooks/use-grocery"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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

const categories: { name: string; icon: LucideIcon }[] = [
  { name: "Produce", icon: Apple },
  { name: "Dairy", icon: Milk },
  { name: "Meat & Seafood", icon: Beef },
  { name: "Vegetables", icon: Carrot },
  { name: "Bakery", icon: Croissant },
  { name: "Beverages", icon: Wine },
  { name: "Frozen", icon: Snowflake },
  { name: "Health", icon: Pill },
  { name: "Household", icon: Sparkles },
  { name: "Other", icon: Package },
]

const units = ["", "lb", "oz", "kg", "g", "gal", "L", "ct", "pkg", "bunch", "dozen"]

const frequentItems = [
  { name: "Milk", category: "Dairy", unit: "gal" },
  { name: "Eggs", category: "Dairy", unit: "dozen" },
  { name: "Bread", category: "Bakery", unit: "" },
  { name: "Bananas", category: "Produce", unit: "bunch" },
  { name: "Chicken breast", category: "Meat & Seafood", unit: "lb" },
  { name: "Apples", category: "Produce", unit: "lb" },
  { name: "Butter", category: "Dairy", unit: "" },
  { name: "Cheese", category: "Dairy", unit: "" },
  { name: "Onions", category: "Vegetables", unit: "lb" },
  { name: "Tomatoes", category: "Vegetables", unit: "lb" },
  { name: "Rice", category: "Other", unit: "lb" },
  { name: "Pasta", category: "Other", unit: "pkg" },
]

type SortOption = "category" | "name" | "checked"

export function GroceryPage() {
  const { lists, loading, error, createList: apiCreateList, updateList: apiUpdateList, deleteList: apiDeleteList } = useGrocery()
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("category")
  const [collapsedCategories, setCollapsedCategories] = useState<string[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showNewListDialog, setShowNewListDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<GroceryItem | null>(null)
  const [copied, setCopied] = useState(false)

  // New item form state
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("Produce")
  const [newQuantity, setNewQuantity] = useState(1)
  const [newUnit, setNewUnit] = useState("")
  const [newPrice, setNewPrice] = useState("")
  const [newNote, setNewNote] = useState("")
  const [newListName, setNewListName] = useState("")

  // Set active list when lists load
  useEffect(() => {
    if (lists.length > 0 && !activeListId) {
      setActiveListId(lists[0].id)
    }
  }, [lists, activeListId])

  const activeList = lists.find(l => l.id === activeListId)
  const items = activeList?.items || []

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "category") return a.category.localeCompare(b.category)
    if (sortBy === "name") return a.name.localeCompare(b.name)
    if (sortBy === "checked") return Number(a.checked) - Number(b.checked)
    return 0
  })

  const groupedItems = categories
    .map(cat => ({
      ...cat,
      items: sortedItems.filter(i => i.category === cat.name),
    }))
    .filter(g => g.items.length > 0)

  const toggleCategory = (name: string) => {
    setCollapsedCategories(prev =>
      prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]
    )
  }

  const updateListItems = async (newItems: GroceryItem[]) => {
    if (!activeListId) return
    await apiUpdateList(activeListId, { items: newItems })
  }

  const addItem = async () => {
    if (!newName.trim() || !activeList) return

    const item: GroceryItem = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      checked: false,
      quantity: newQuantity,
      unit: newUnit,
      price: newPrice ? parseFloat(newPrice) : undefined,
      note: newNote || undefined,
    }

    await updateListItems([...activeList.items, item])
    resetForm()
    setShowAddDialog(false)
  }

  const updateItem = async () => {
    if (!editingItem || !activeList) return

    const newItems = activeList.items.map(i =>
      i.id === editingItem.id
        ? {
            ...editingItem,
            name: newName,
            category: newCategory,
            quantity: newQuantity,
            unit: newUnit,
            price: newPrice ? parseFloat(newPrice) : undefined,
            note: newNote || undefined,
          }
        : i
    )

    await updateListItems(newItems)
    resetForm()
    setEditingItem(null)
  }

  const resetForm = () => {
    setNewName("")
    setNewCategory("Produce")
    setNewQuantity(1)
    setNewUnit("")
    setNewPrice("")
    setNewNote("")
  }

  const toggleItem = async (id: string) => {
    if (!activeList) return
    const newItems = activeList.items.map(i => (i.id === id ? { ...i, checked: !i.checked } : i))
    await updateListItems(newItems)
  }

  const deleteItem = async (id: string) => {
    if (!activeList) return
    const newItems = activeList.items.filter(i => i.id !== id)
    await updateListItems(newItems)
  }

  const clearChecked = async () => {
    if (!activeList) return
    const newItems = activeList.items.filter(i => !i.checked)
    await updateListItems(newItems)
  }

  const uncheckAll = async () => {
    if (!activeList) return
    const newItems = activeList.items.map(i => ({ ...i, checked: false }))
    await updateListItems(newItems)
  }

  const createList = async () => {
    if (!newListName.trim()) return

    const newList = await apiCreateList({ name: newListName.trim(), items: [] })
    setActiveListId(newList.id)
    setNewListName("")
    setShowNewListDialog(false)
  }

  const deleteList = async (id: string) => {
    if (lists.length === 1) return
    await apiDeleteList(id)
    if (activeListId === id) {
      setActiveListId(lists.find(l => l.id !== id)?.id || null)
    }
  }

  const copyList = () => {
    if (!activeList) return

    const lines: string[] = []
    lines.push(activeList.name)
    lines.push("=".repeat(30))

    const grouped = categories
      .map(cat => ({
        name: cat.name,
        items: activeList.items.filter(i => i.category === cat.name && !i.checked),
      }))
      .filter(g => g.items.length > 0)

    grouped.forEach(group => {
      lines.push("")
      lines.push(group.name)
      lines.push("-".repeat(20))
      group.items.forEach(item => {
        const qty = item.quantity > 1 || item.unit ? `${item.quantity}${item.unit ? " " + item.unit : ""}` : ""
        lines.push(`[ ] ${item.name}${qty ? " - " + qty : ""}`)
      })
    })

    navigator.clipboard.writeText(lines.join("\n"))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const quickAddItem = async (item: typeof frequentItems[0]) => {
    if (!activeList) return

    const newItem: GroceryItem = {
      id: Date.now().toString(),
      name: item.name,
      category: item.category,
      checked: false,
      quantity: 1,
      unit: item.unit,
    }

    await updateListItems([...activeList.items, newItem])
  }

  const openEditDialog = (item: GroceryItem) => {
    setEditingItem(item)
    setNewName(item.name)
    setNewCategory(item.category)
    setNewQuantity(item.quantity)
    setNewUnit(item.unit)
    setNewPrice(item.price?.toString() || "")
    setNewNote(item.note || "")
  }

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const remainingCount = totalCount - checkedCount
  const estimatedTotal = items
    .filter(i => !i.checked && i.price)
    .reduce((sum, i) => sum + (i.price || 0) * i.quantity, 0)

  const getCategoryIcon = (categoryName: string) => {
    const cat = categories.find(c => c.name === categoryName)
    return cat?.icon || Package
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Grocery List</h1>
          <p className="text-sm text-muted-foreground">Organize your shopping</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={copyList} disabled={!activeList}>
            {copied ? <Check className="size-4 mr-2" /> : <Copy className="size-4 mr-2" />}
            {copied ? "Copied" : "Copy List"}
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)} disabled={!activeList}>
            <Plus className="size-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* List Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {lists.map(list => (
          <button
            key={list.id}
            onClick={() => setActiveListId(list.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium whitespace-nowrap transition-colors ${
              activeListId === list.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card hover:bg-muted"
            }`}
          >
            <ShoppingCart className="size-4" />
            {list.name}
            <span className={`text-xs ${activeListId === list.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              ({list.items.filter(i => !i.checked).length})
            </span>
          </button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => setShowNewListDialog(true)}>
          <Plus className="size-4 mr-1" />
          New List
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-2xl font-semibold">{totalCount}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Remaining</p>
          <p className="text-2xl font-semibold">{remainingCount}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <p className="text-2xl font-semibold">{checkedCount}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Est. Total</p>
          <p className="text-2xl font-semibold">${estimatedTotal.toFixed(2)}</p>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <SortAsc className="size-4 mr-2" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortBy("category")}>
              {sortBy === "category" && <Check className="size-4 mr-2" />}
              By Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("name")}>
              {sortBy === "name" && <Check className="size-4 mr-2" />}
              By Name
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("checked")}>
              {sortBy === "checked" && <Check className="size-4 mr-2" />}
              By Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={uncheckAll}>Uncheck All</DropdownMenuItem>
            <DropdownMenuItem onClick={clearChecked} disabled={checkedCount === 0}>
              Clear Checked ({checkedCount})
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => activeListId && deleteList(activeListId)}
              disabled={lists.length <= 1 || !activeListId}
              className="text-destructive"
            >
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Items List */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {groupedItems.map(group => {
            const Icon = group.icon
            const isCollapsed = collapsedCategories.includes(group.name)
            const groupChecked = group.items.filter(i => i.checked).length
            const groupTotal = group.items.length

            return (
              <div key={group.name} className="bg-card border rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(group.name)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                  <Icon className="size-4" />
                  <span className="font-medium flex-1 text-left">{group.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {groupChecked}/{groupTotal}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="border-t divide-y">
                    {group.items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-4 ${item.checked ? "bg-muted/30" : ""}`}
                      >
                        <button
                          onClick={() => toggleItem(item.id)}
                          className={`size-5 rounded border-2 flex items-center justify-center transition-colors ${
                            item.checked
                              ? "bg-primary border-primary text-primary-foreground"
                              : "border-muted-foreground/30 hover:border-primary"
                          }`}
                        >
                          {item.checked && <Check className="size-3" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                            {item.name}
                          </p>
                          {item.note && (
                            <p className="text-xs text-muted-foreground truncate">{item.note}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="tabular-nums">
                            {item.quantity}{item.unit ? ` ${item.unit}` : ""}
                          </span>
                          {item.price && (
                            <span className="tabular-nums w-16 text-right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit2 className="size-4 mr-2" />
                              Edit
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
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-card border rounded-lg">
          <ShoppingCart className="size-12 mx-auto mb-4 text-muted-foreground/50" />
          {lists.length === 0 ? (
            <>
              <p className="text-muted-foreground mb-4">No grocery lists yet</p>
              <Button onClick={() => setShowNewListDialog(true)}>
                <Plus className="size-4 mr-2" />
                Create First List
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-4">Your grocery list is empty</p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="size-4 mr-2" />
                Add First Item
              </Button>
            </>
          )}
        </div>
      )}

      {/* Quick Add */}
      {activeList && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Quick Add</h3>
            <p className="text-xs text-muted-foreground">Click to add common items</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {frequentItems
              .filter(fi => !items.some(i => i.name.toLowerCase() === fi.name.toLowerCase()))
              .slice(0, 10)
              .map(item => {
                const Icon = getCategoryIcon(item.category)
                return (
                  <button
                    key={item.name}
                    onClick={() => quickAddItem(item)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
                  >
                    <Icon className="size-3 text-muted-foreground" />
                    {item.name}
                  </button>
                )
              })}
          </div>
        </div>
      )}

      {/* Add/Edit Item Dialog */}
      <Dialog open={showAddDialog || !!editingItem} onOpenChange={open => {
        if (!open) {
          setShowAddDialog(false)
          setEditingItem(null)
          resetForm()
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name</Label>
              <Input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g., Milk, Apples, Bread"
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="size-4" />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newQuantity}
                    onChange={e => setNewQuantity(parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-20"
                  />
                  <Select value={newUnit} onValueChange={setNewUnit}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map(unit => (
                        <SelectItem key={unit} value={unit}>
                          {unit || "No unit"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Price (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="pl-7"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="e.g., Brand preference, specific type"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false)
              setEditingItem(null)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={editingItem ? updateItem : addItem} disabled={!newName.trim()}>
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New List Dialog */}
      <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>List Name</Label>
              <Input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="e.g., Weekly Shopping, Costco Run"
                autoFocus
                onKeyDown={e => e.key === "Enter" && createList()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createList} disabled={!newListName.trim()}>
              Create List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
