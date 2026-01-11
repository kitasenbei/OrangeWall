import { useState } from "react"
import { Plus, Trash2, ThumbsUp, ThumbsDown, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Item { id: string; text: string; weight: number }

export function ProsconsPage() {
  const [topic, setTopic] = useState("Should I take this job?")
  const [pros, setPros] = useState<Item[]>([{ id: "1", text: "Higher salary", weight: 3 }, { id: "2", text: "Better benefits", weight: 2 }])
  const [cons, setCons] = useState<Item[]>([{ id: "1", text: "Longer commute", weight: 2 }, { id: "2", text: "Less flexibility", weight: 1 }])
  const [newPro, setNewPro] = useState("")
  const [newCon, setNewCon] = useState("")

  const addPro = () => { if (newPro.trim()) { setPros([...pros, { id: Date.now().toString(), text: newPro, weight: 1 }]); setNewPro("") } }
  const addCon = () => { if (newCon.trim()) { setCons([...cons, { id: Date.now().toString(), text: newCon, weight: 1 }]); setNewCon("") } }

  const updateWeight = (type: "pro" | "con", id: string, weight: number) => {
    if (type === "pro") setPros(pros.map(p => p.id === id ? { ...p, weight } : p))
    else setCons(cons.map(c => c.id === id ? { ...c, weight } : c))
  }

  const remove = (type: "pro" | "con", id: string) => {
    if (type === "pro") setPros(pros.filter(p => p.id !== id))
    else setCons(cons.filter(c => c.id !== id))
  }

  const prosScore = pros.reduce((s, p) => s + p.weight, 0)
  const consScore = cons.reduce((s, c) => s + c.weight, 0)
  const verdict = prosScore > consScore ? "Go for it!" : prosScore < consScore ? "Maybe reconsider" : "It's a tie"

  const ItemList = ({ items, type, newItem, setNewItem, addItem }: { items: Item[]; type: "pro" | "con"; newItem: string; setNewItem: (s: string) => void; addItem: () => void }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {type === "pro" ? <ThumbsUp className="size-5 text-green-500" /> : <ThumbsDown className="size-5 text-red-500" />}
        <Label>{type === "pro" ? "Pros" : "Cons"}</Label>
        <span className="ml-auto text-sm font-medium">{type === "pro" ? prosScore : consScore} pts</span>
      </div>
      {items.map(item => (
        <div key={item.id} className="flex items-center gap-2 bg-card border rounded-lg p-2">
          <span className="flex-1 text-sm">{item.text}</span>
          <select value={item.weight} onChange={e => updateWeight(type, item.id, Number(e.target.value))} className="w-16 h-8 text-sm rounded border bg-background px-1">
            {[1, 2, 3, 4, 5].map(w => <option key={w} value={w}>{w}</option>)}
          </select>
          <Button size="icon" variant="ghost" onClick={() => remove(type, item.id)}><Trash2 className="size-4" /></Button>
        </div>
      ))}
      <div className="flex gap-2">
        <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder={`Add ${type}...`} onKeyDown={e => e.key === "Enter" && addItem()} />
        <Button size="icon" onClick={addItem}><Plus className="size-4" /></Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Pros & Cons</h1><p className="text-sm text-muted-foreground">Weigh your decisions</p></div>

      <div className="space-y-2">
        <Label>Decision Topic</Label>
        <Input value={topic} onChange={e => setTopic(e.target.value)} className="text-lg font-medium" />
      </div>

      <div className="bg-card border rounded-lg p-4 flex items-center justify-center gap-6">
        <div className="text-center"><p className="text-3xl font-bold text-green-500">{prosScore}</p><p className="text-sm text-muted-foreground">Pros</p></div>
        <Scale className="size-8 text-muted-foreground" />
        <div className="text-center"><p className="text-3xl font-bold text-red-500">{consScore}</p><p className="text-sm text-muted-foreground">Cons</p></div>
      </div>

      <div className="text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <p className="text-xl font-bold">{verdict}</p>
        <p className="text-sm text-muted-foreground">Based on weighted scores</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
          <ItemList items={pros} type="pro" newItem={newPro} setNewItem={setNewPro} addItem={addPro} />
        </div>
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <ItemList items={cons} type="con" newItem={newCon} setNewItem={setNewCon} addItem={addCon} />
        </div>
      </div>
    </div>
  )
}
