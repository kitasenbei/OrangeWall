import { useState } from "react"
import { Moon, Sun, Clock, TrendingUp, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface SleepLog { id: string; date: string; bedtime: string; wakeTime: string; quality: 1 | 2 | 3 | 4 | 5; notes: string }

const initialLogs: SleepLog[] = [
  { id: "1", date: new Date(Date.now() - 86400000).toISOString().split('T')[0], bedtime: "23:00", wakeTime: "07:00", quality: 4, notes: "" },
  { id: "2", date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], bedtime: "23:30", wakeTime: "06:30", quality: 3, notes: "Woke up once" },
  { id: "3", date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], bedtime: "22:30", wakeTime: "06:00", quality: 5, notes: "" },
  { id: "4", date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], bedtime: "00:00", wakeTime: "07:30", quality: 3, notes: "" },
  { id: "5", date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], bedtime: "23:00", wakeTime: "07:00", quality: 4, notes: "" },
]

function calculateDuration(bedtime: string, wakeTime: string): number {
  const [bH, bM] = bedtime.split(":").map(Number)
  const [wH, wM] = wakeTime.split(":").map(Number)
  let hours = wH - bH + (wM - bM) / 60
  if (hours < 0) hours += 24
  return Math.round(hours * 10) / 10
}

const qualityLabels = ["", "Terrible", "Poor", "Fair", "Good", "Excellent"]
const qualityColors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-green-500", "text-emerald-500"]

export function SleepPage() {
  const [logs, setLogs] = useState<SleepLog[]>(initialLogs)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [bedtime, setBedtime] = useState("23:00")
  const [wakeTime, setWakeTime] = useState("07:00")
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4)
  const [notes, setNotes] = useState("")

  const handleSave = () => {
    setLogs(prev => [{ id: Date.now().toString(), date, bedtime, wakeTime, quality, notes }, ...prev])
    setDialogOpen(false)
    setDate(new Date().toISOString().split('T')[0]); setBedtime("23:00"); setWakeTime("07:00"); setQuality(4); setNotes("")
  }

  const avgDuration = logs.length ? Math.round(logs.reduce((s, l) => s + calculateDuration(l.bedtime, l.wakeTime), 0) / logs.length * 10) / 10 : 0
  const avgQuality = logs.length ? Math.round(logs.reduce((s, l) => s + l.quality, 0) / logs.length * 10) / 10 : 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Sleep Tracker</h1><p className="text-sm text-muted-foreground">Track your sleep patterns</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Log Sleep</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log Sleep</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Bedtime</Label><Input type="time" value={bedtime} onChange={e => setBedtime(e.target.value)} /></div>
                <div className="space-y-2"><Label>Wake Time</Label><Input type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Quality</Label>
                <div className="flex gap-2">{([1, 2, 3, 4, 5] as const).map(q => (
                  <button key={q} onClick={() => setQuality(q)} className={cn("flex-1 py-2 rounded-lg text-sm transition-colors", quality === q ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80")}>{qualityLabels[q]}</button>
                ))}</div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" /></div>
              <Button onClick={handleSave} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center"><Clock className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{avgDuration}h</div><div className="text-xs text-muted-foreground">Avg Duration</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><TrendingUp className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{avgQuality}</div><div className="text-xs text-muted-foreground">Avg Quality</div></div>
        <div className="bg-card border rounded-lg p-4 text-center"><Calendar className="size-5 mx-auto mb-2 text-muted-foreground" /><div className="text-2xl font-semibold">{logs.length}</div><div className="text-xs text-muted-foreground">Nights Logged</div></div>
      </div>

      <div className="space-y-3">
        {logs.slice(0, 10).map(log => {
          const duration = calculateDuration(log.bedtime, log.wakeTime)
          return (
            <div key={log.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{new Date(log.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span className={cn("text-sm font-medium", qualityColors[log.quality])}>{qualityLabels[log.quality]}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Moon className="size-3" />{log.bedtime}</span>
                <span className="flex items-center gap-1"><Sun className="size-3" />{log.wakeTime}</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{duration}h</span>
              </div>
              {log.notes && <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>}
            </div>
          )
        })}
      </div>

      {logs.length === 0 && <div className="text-center py-12 text-muted-foreground"><Moon className="size-12 mx-auto mb-4 opacity-50" /><p>No sleep logs yet</p></div>}
    </div>
  )
}
