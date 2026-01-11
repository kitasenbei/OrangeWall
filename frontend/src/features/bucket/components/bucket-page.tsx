import { useState } from "react"
import { Plus, Trash2, CheckCircle, Circle, Sparkles, MapPin, Heart, Briefcase, GraduationCap, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { LucideIcon } from "lucide-react"

interface BucketItem { id: string; text: string; category: string; completed: boolean }

const categories: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Travel", icon: MapPin, color: "text-blue-500" },
  { name: "Experience", icon: Sparkles, color: "text-yellow-500" },
  { name: "Personal", icon: Heart, color: "text-red-500" },
  { name: "Career", icon: Briefcase, color: "text-green-500" },
  { name: "Learning", icon: GraduationCap, color: "text-purple-500" },
  { name: "Creative", icon: Palette, color: "text-pink-500" },
]

const initialItems: BucketItem[] = [
  { id: "1", text: "Visit Japan", category: "Travel", completed: false },
  { id: "2", text: "Learn to play guitar", category: "Learning", completed: false },
  { id: "3", text: "Run a marathon", category: "Personal", completed: true },
  { id: "4", text: "Start a business", category: "Career", completed: false },
  { id: "5", text: "See the Northern Lights", category: "Travel", completed: false },
]

export function BucketPage() {
  const [items, setItems] = useState<BucketItem[]>(initialItems)
  const [newItem, setNewItem] = useState("")
  const [newCategory, setNewCategory] = useState("Travel")
  const [filter, setFilter] = useState("all")

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now().toString(), text: newItem, category: newCategory, completed: false }])
      setNewItem("")
    }
  }

  const toggleItem = (id: string) => setItems(items.map(i => i.id === id ? { ...i, completed: !i.completed } : i))
  const deleteItem = (id: string) => setItems(items.filter(i => i.id !== id))

  const filteredItems = filter === "all" ? items : filter === "completed" ? items.filter(i => i.completed) : filter === "pending" ? items.filter(i => !i.completed) : items.filter(i => i.category === filter)
  const completedCount = items.filter(i => i.completed).length
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Bucket List</h1><p className="text-sm text-muted-foreground">Dreams to chase, experiences to have</p></div>
        <div className="text-right">
          <p className="text-2xl font-bold">{completedCount}/{items.length}</p>
          <p className="text-sm text-muted-foreground">completed</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "completed", ...categories.map(c => c.name)].map(f => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"} onClick={() => setFilter(f)} className="capitalize">{f}</Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add a dream..." onKeyDown={e => e.key === "Enter" && addItem()} className="flex-1" />
        <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="h-10 rounded-md border bg-background px-3">
          {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <Button onClick={addItem}><Plus className="size-4" /></Button>
      </div>

      <div className="space-y-2">
        {filteredItems.map(item => {
          const cat = categories.find(c => c.name === item.category)
          const Icon = cat?.icon || Sparkles
          return (
            <div key={item.id} className={`flex items-center gap-3 bg-card border rounded-lg p-3 transition-opacity ${item.completed ? "opacity-60" : ""}`}>
              <button onClick={() => toggleItem(item.id)}>
                {item.completed ? <CheckCircle className="size-5 text-green-500" /> : <Circle className="size-5 text-muted-foreground" />}
              </button>
              <Icon className={`size-4 ${cat?.color}`} />
              <span className={`flex-1 ${item.completed ? "line-through text-muted-foreground" : ""}`}>{item.text}</span>
              <span className="text-xs text-muted-foreground">{item.category}</span>
              <Button size="icon" variant="ghost" onClick={() => deleteItem(item.id)}><Trash2 className="size-4" /></Button>
            </div>
          )
        })}
      </div>

      {filteredItems.length === 0 && <p className="text-center py-8 text-muted-foreground">No items yet. Start dreaming!</p>}
    </div>
  )
}
