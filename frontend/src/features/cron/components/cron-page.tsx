import { useState, useMemo } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const presets = [
  { name: "Every minute", cron: "* * * * *" },
  { name: "Every hour", cron: "0 * * * *" },
  { name: "Every day at midnight", cron: "0 0 * * *" },
  { name: "Every day at noon", cron: "0 12 * * *" },
  { name: "Every Monday", cron: "0 0 * * 1" },
  { name: "Every weekday", cron: "0 9 * * 1-5" },
  { name: "First of month", cron: "0 0 1 * *" },
  { name: "Every 15 minutes", cron: "*/15 * * * *" },
]

export function CronPage() {
  const [minute, setMinute] = useState("*")
  const [hour, setHour] = useState("*")
  const [day, setDay] = useState("*")
  const [month, setMonth] = useState("*")
  const [weekday, setWeekday] = useState("*")
  const [copied, setCopied] = useState(false)

  const cron = `${minute} ${hour} ${day} ${month} ${weekday}`

  const description = useMemo(() => {
    const parts = []
    if (minute === "*") parts.push("every minute")
    else if (minute.startsWith("*/")) parts.push(`every ${minute.slice(2)} minutes`)
    else parts.push(`at minute ${minute}`)

    if (hour !== "*") {
      if (hour.startsWith("*/")) parts.push(`every ${hour.slice(2)} hours`)
      else parts.push(`at hour ${hour}`)
    }

    if (day !== "*") parts.push(`on day ${day}`)
    if (month !== "*") parts.push(`in month ${month}`)
    if (weekday !== "*") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      if (weekday.includes("-")) parts.push(`on ${weekday}`)
      else parts.push(`on ${days[parseInt(weekday)] || weekday}`)
    }

    return parts.join(", ")
  }, [minute, hour, day, month, weekday])

  const applyPreset = (preset: string) => {
    const [m, h, d, mo, w] = preset.split(" ")
    setMinute(m); setHour(h); setDay(d); setMonth(mo); setWeekday(w)
  }

  const copy = () => {
    navigator.clipboard.writeText(cron)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Cron Expression</h1><p className="text-sm text-muted-foreground">Build and understand cron schedules</p></div>
        <Button onClick={copy}>{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy</Button>
      </div>

      <div className="bg-card border rounded-lg p-6 text-center">
        <code className="text-3xl font-mono font-bold">{cron}</code>
        <p className="text-muted-foreground mt-2 capitalize">{description}</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Minute", value: minute, setValue: setMinute, hint: "0-59" },
          { label: "Hour", value: hour, setValue: setHour, hint: "0-23" },
          { label: "Day", value: day, setValue: setDay, hint: "1-31" },
          { label: "Month", value: month, setValue: setMonth, hint: "1-12" },
          { label: "Weekday", value: weekday, setValue: setWeekday, hint: "0-6 (Sun-Sat)" },
        ].map(field => (
          <div key={field.label} className="space-y-1">
            <Label>{field.label}</Label>
            <Input value={field.value} onChange={e => field.setValue(e.target.value)} className="font-mono text-center" />
            <p className="text-xs text-muted-foreground text-center">{field.hint}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Presets</Label>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <Button key={p.name} variant="outline" size="sm" onClick={() => applyPreset(p.cron)}>{p.name}</Button>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4 text-sm space-y-1">
        <p className="font-medium">Syntax Reference</p>
        <p className="text-muted-foreground">* = any value, */n = every n, n-m = range, n,m = list</p>
      </div>
    </div>
  )
}
