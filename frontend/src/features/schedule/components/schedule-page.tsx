import { useState, useMemo } from "react"
import { Plus, Clock, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSchedule } from "@/hooks"

const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"]
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 AM to 10 PM

export function SchedulePage() {
  const {
    blocks,
    loading,
    error,
    createBlock,
    deleteBlock: deleteBlockApi,
    getBlocksForDay,
  } = useSchedule()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("Monday")
  const [title, setTitle] = useState(""); const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00"); const [color, setColor] = useState(colors[0])

  // Transform flat array to schedule object
  const schedule = useMemo(() => {
    return days.reduce((acc, day) => {
      acc[day] = getBlocksForDay(day)
      return acc
    }, {} as Record<string, typeof blocks>)
  }, [blocks, getBlocksForDay])

  const resetForm = () => { setTitle(""); setStartTime("09:00"); setEndTime("10:00"); setColor(colors[0]) }

  const addBlock = async () => {
    if (!title || !startTime || !endTime) return
    try {
      await createBlock({
        title,
        day: selectedDay,
        startTime,
        endTime,
        color,
      })
      resetForm(); setDialogOpen(false)
    } catch (err) {
      console.error("Failed to add block:", err)
    }
  }

  const deleteBlock = async (_day: string, id: string) => {
    try {
      await deleteBlockApi(id)
    } catch (err) {
      console.error("Failed to delete block:", err)
    }
  }

  const copyDay = async (from: string, to: string) => {
    const blocksToCreate = schedule[from] || []
    try {
      for (const block of blocksToCreate) {
        await createBlock({
          title: block.title,
          day: to,
          startTime: block.startTime,
          endTime: block.endTime,
          color: block.color,
        })
      }
    } catch (err) {
      console.error("Failed to copy day:", err)
    }
  }

  const getBlockPosition = (start: string, end: string) => {
    const [sh, sm] = start.split(":").map(Number)
    const [eh, em] = end.split(":").map(Number)
    const startMinutes = (sh - 6) * 60 + sm
    const endMinutes = (eh - 6) * 60 + em
    return { top: `${(startMinutes / (17 * 60)) * 100}%`, height: `${((endMinutes - startMinutes) / (17 * 60)) * 100}%` }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading schedule...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Schedule</h1><p className="text-sm text-muted-foreground">Plan your weekly routine</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />Add Block</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Time Block</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Day</Label>
                <select value={selectedDay} onChange={e => setSelectedDay(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">
                  {days.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2"><Label>Activity</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Work, Gym, Meeting..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Start Time</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
                <div className="space-y-2"><Label>End Time</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`size-8 rounded-full ${c} ${color === c ? "ring-2 ring-offset-2 ring-primary" : ""}`} />
                  ))}
                </div>
              </div>
              <Button onClick={addBlock} className="w-full">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-8 gap-1">
            <div className="text-xs text-muted-foreground pt-6">
              {hours.map(h => (
                <div key={h} className="h-12 flex items-start justify-end pr-2">{h.toString().padStart(2, "0")}:00</div>
              ))}
            </div>
            {days.map(day => (
              <div key={day} className="relative">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-sm font-medium">{day.slice(0, 3)}</span>
                  <Button variant="ghost" size="icon" className="size-6" onClick={() => { setSelectedDay(day); setDialogOpen(true) }}><Plus className="size-3" /></Button>
                </div>
                <div className="relative bg-muted/30 rounded-lg" style={{ height: `${17 * 48}px` }}>
                  {hours.map(h => (
                    <div key={h} className="absolute w-full border-t border-border/30" style={{ top: `${((h - 6) / 17) * 100}%` }} />
                  ))}
                  {schedule[day]?.map(block => {
                    const pos = getBlockPosition(block.startTime, block.endTime)
                    return (
                      <div key={block.id} className={`absolute left-1 right-1 ${block.color} rounded-md p-1.5 text-white text-xs overflow-hidden group`} style={{ top: pos.top, height: pos.height, minHeight: "24px" }}>
                        <div className="font-medium truncate">{block.title}</div>
                        <div className="flex items-center gap-1 opacity-80"><Clock className="size-3" />{block.startTime}-{block.endTime}</div>
                        <button onClick={() => deleteBlock(day, block.id)} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"><Trash2 className="size-3" /></button>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Copy day:</span>
        {days.map(from => (
          <select key={from} onChange={e => { if (e.target.value) copyDay(from, e.target.value); e.target.value = "" }} className="h-8 text-xs rounded-md border bg-background px-2">
            <option value="">{from.slice(0, 3)} →</option>
            {days.filter(d => d !== from).map(to => <option key={to} value={to}>{to.slice(0, 3)}</option>)}
          </select>
        ))}
      </div>
    </div>
  )
}
