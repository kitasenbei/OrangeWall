import { useState, useEffect } from "react"
import { Clock, Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EpochPage() {
  const [epoch, setEpoch] = useState(Math.floor(Date.now() / 1000))
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [liveEpoch, setLiveEpoch] = useState(Math.floor(Date.now() / 1000))
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setLiveEpoch(Math.floor(Date.now() / 1000)), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const d = new Date(epoch * 1000)
    setDate(d.toISOString().split("T")[0])
    setTime(d.toTimeString().slice(0, 5))
  }, [epoch])

  const updateFromDate = (newDate: string, newTime: string) => {
    const d = new Date(`${newDate}T${newTime}`)
    if (!isNaN(d.getTime())) setEpoch(Math.floor(d.getTime() / 1000))
  }

  const copy = () => {
    navigator.clipboard.writeText(epoch.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const setNow = () => setEpoch(Math.floor(Date.now() / 1000))

  const d = new Date(epoch * 1000)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Unix Timestamp</h1><p className="text-sm text-muted-foreground">Convert between epoch and human-readable dates</p></div>
        <div className="bg-card border rounded-lg px-4 py-2 font-mono">
          <span className="text-muted-foreground text-sm">Now: </span>
          <span className="font-bold">{liveEpoch}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Clock className="size-4" />Unix Timestamp (seconds)</Label>
            <div className="flex gap-2">
              <Input type="number" value={epoch} onChange={e => setEpoch(parseInt(e.target.value) || 0)} className="font-mono" />
              <Button variant="outline" onClick={setNow}><RefreshCw className="size-4" /></Button>
              <Button variant="outline" onClick={copy}>{copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}</Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => { setDate(e.target.value); updateFromDate(e.target.value, time) }} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input type="time" value={time} onChange={e => { setTime(e.target.value); updateFromDate(date, e.target.value) }} />
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-3">
          <h3 className="font-medium">Converted Date</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Local</span><span className="font-mono">{d.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">UTC</span><span className="font-mono">{d.toUTCString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ISO 8601</span><span className="font-mono">{d.toISOString()}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Milliseconds</span><span className="font-mono">{epoch * 1000}</span></div>
          </div>
          <div className="pt-3 border-t text-sm text-muted-foreground">
            <p>Relative: {Math.abs(Math.floor((Date.now() / 1000 - epoch) / 86400))} days {epoch < Date.now() / 1000 ? "ago" : "from now"}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
