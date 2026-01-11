import { useState } from "react"
import { Plus, Heart, Calendar, Sparkles, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface GratitudeEntry { id: string; date: string; items: string[]; mood: number }

const initialEntries: GratitudeEntry[] = [
  { id: "1", date: new Date().toISOString().split('T')[0], items: ["Morning coffee with a friend", "Sunny weather", "Got a compliment at work"], mood: 5 },
  { id: "2", date: new Date(Date.now() - 86400000).toISOString().split('T')[0], items: ["Family dinner", "Finished a good book"], mood: 4 },
  { id: "3", date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], items: ["Productive work day", "Evening walk", "Healthy meal"], mood: 4 },
]

export function GratitudePage() {
  const [entries, setEntries] = useState<GratitudeEntry[]>(initialEntries)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [text, setText] = useState("")
  const [mood, setMood] = useState(4)

  const today = new Date().toISOString().split('T')[0]
  const todayEntry = entries.find(e => e.date === today)

  const handleSave = () => {
    const items = text.split("\n").filter(s => s.trim())
    if (items.length === 0) return
    if (todayEntry) {
      setEntries(prev => prev.map(e => e.date === today ? { ...e, items: [...e.items, ...items], mood } : e))
    } else {
      setEntries(prev => [{ id: Date.now().toString(), date: today, items, mood }, ...prev])
    }
    setText(""); setDialogOpen(false)
  }

  const streak = (() => {
    let count = 0
    for (let i = 0; i < 365; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (entries.find(e => e.date === date)) count++
      else if (i > 0) break
    }
    return count
  })()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Gratitude</h1><p className="text-sm text-muted-foreground">What are you grateful for today?</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Entry</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Today I'm grateful for...</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <Textarea value={text} onChange={e => setText(e.target.value)} placeholder="Write one thing per line..." rows={5} />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">How do you feel?</p>
                <div className="flex gap-2">{[1, 2, 3, 4, 5].map(m => (
                  <button key={m} onClick={() => setMood(m)} className={cn("size-10 rounded-full text-lg transition-all", mood === m ? "bg-primary text-primary-foreground scale-110" : "bg-muted hover:bg-muted/80")}>
                    {m <= 2 ? "😔" : m === 3 ? "😐" : m === 4 ? "🙂" : "😊"}
                  </button>
                ))}</div>
              </div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center"><Heart className="size-5 mx-auto mb-2 text-pink-500" /><div className="text-2xl font-semibold">{entries.reduce((s, e) => s + e.items.length, 0)}</div><div className="text-xs text-muted-foreground">Total Items</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Calendar className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{entries.length}</div><div className="text-xs text-muted-foreground">Days Logged</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Sparkles className="size-5 mx-auto mb-2 text-yellow-500" /><div className="text-2xl font-semibold">{streak}</div><div className="text-xs text-muted-foreground">Day Streak</div></div>
      </div>

      {!todayEntry && (
        <div className="bg-gradient-to-br from-pink-500/10 to-orange-500/10 border border-pink-500/20 rounded-lg p-6 text-center">
          <Smile className="size-10 mx-auto mb-3 text-pink-500" />
          <p className="font-medium mb-2">Start your day with gratitude</p>
          <p className="text-sm text-muted-foreground mb-4">What are 3 things you're grateful for today?</p>
          <Button onClick={() => setDialogOpen(true)}>Add Today's Entry</Button>
        </div>
      )}

      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</span>
              <span className="text-lg">{entry.mood <= 2 ? "😔" : entry.mood === 3 ? "😐" : entry.mood === 4 ? "🙂" : "😊"}</span>
            </div>
            <ul className="space-y-2">
              {entry.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Heart className="size-4 text-pink-500 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {entries.length === 0 && <div className="text-center py-12 text-muted-foreground"><Heart className="size-12 mx-auto mb-4 opacity-50" /><p>Start your gratitude journey</p></div>}
    </div>
  )
}
