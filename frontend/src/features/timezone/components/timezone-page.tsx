import { useState, useEffect } from "react"
import { Globe } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const timezones = [
  { name: "UTC", offset: 0 },
  { name: "New York (EST)", offset: -5 },
  { name: "Los Angeles (PST)", offset: -8 },
  { name: "London (GMT)", offset: 0 },
  { name: "Paris (CET)", offset: 1 },
  { name: "Dubai (GST)", offset: 4 },
  { name: "Mumbai (IST)", offset: 5.5 },
  { name: "Singapore (SGT)", offset: 8 },
  { name: "Tokyo (JST)", offset: 9 },
  { name: "Sydney (AEST)", offset: 10 },
]

export function TimezonePage() {
  const [baseTime, setBaseTime] = useState("")
  const [baseZone, setBaseZone] = useState(0)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getTimeInZone = (offset: number) => {
    if (baseTime) {
      const [hours, minutes] = baseTime.split(":").map(Number)
      const baseDate = new Date()
      baseDate.setHours(hours, minutes, 0, 0)
      const utcTime = baseDate.getTime() - baseZone * 60 * 60 * 1000
      const targetTime = new Date(utcTime + offset * 60 * 60 * 1000)
      return targetTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    }
    const utc = now.getTime() + now.getTimezoneOffset() * 60000
    const targetTime = new Date(utc + offset * 3600000)
    return targetTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">World Clock</h1><p className="text-sm text-muted-foreground">Compare times across timezones</p></div>

      <div className="bg-card border rounded-lg p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <Label>Convert Time</Label>
          <Input type="time" value={baseTime} onChange={e => setBaseTime(e.target.value)} className="w-32" />
        </div>
        <div className="space-y-1">
          <Label>From Timezone</Label>
          <select value={baseZone} onChange={e => setBaseZone(Number(e.target.value))} className="h-10 rounded-md border bg-background px-3">
            {timezones.map(tz => <option key={tz.name} value={tz.offset}>{tz.name}</option>)}
          </select>
        </div>
        {baseTime && <button onClick={() => setBaseTime("")} className="text-sm text-muted-foreground hover:text-foreground">Clear</button>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {timezones.map(tz => (
          <div key={tz.name} className="bg-card border rounded-lg p-4 text-center">
            <Globe className="size-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-1">{tz.name}</p>
            <p className="text-xl font-mono font-bold">{getTimeInZone(tz.offset)}</p>
            <p className="text-xs text-muted-foreground">UTC{tz.offset >= 0 ? "+" : ""}{tz.offset}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
