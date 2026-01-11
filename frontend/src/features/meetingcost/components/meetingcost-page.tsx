import { useState, useEffect } from "react"
import { Play, Pause, RotateCcw, Users, Clock, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function MeetingCostPage() {
  const [attendees, setAttendees] = useState("5")
  const [avgSalary, setAvgSalary] = useState("75000")
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [plannedMinutes, setPlannedMinutes] = useState("60")

  const attendeeCount = parseInt(attendees) || 0
  const annualSalary = parseInt(avgSalary) || 0
  const hourlyRate = annualSalary / 2080 // 52 weeks * 40 hours
  const costPerSecond = (hourlyRate * attendeeCount) / 3600

  const currentCost = costPerSecond * elapsedSeconds
  const plannedCost = (hourlyRate * attendeeCount * parseInt(plannedMinutes || "0")) / 60
  const overBudget = currentCost > plannedCost

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(s => s + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  const reset = () => {
    setIsRunning(false)
    setElapsedSeconds(0)
  }

  const presetAttendees = [3, 5, 8, 10, 15, 20]
  const presetDurations = [15, 30, 45, 60, 90, 120]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Meeting Cost Calculator</h1><p className="text-sm text-muted-foreground">See the real cost of your meetings</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label>Number of Attendees</Label>
              <Input type="number" value={attendees} onChange={e => setAttendees(e.target.value)} min="1" />
              <div className="flex gap-2 flex-wrap">
                {presetAttendees.map(n => (
                  <Button key={n} variant={attendees === n.toString() ? "default" : "outline"} size="sm" onClick={() => setAttendees(n.toString())}>{n}</Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Average Annual Salary ($)</Label>
              <Input type="number" value={avgSalary} onChange={e => setAvgSalary(e.target.value)} />
              <p className="text-xs text-muted-foreground">Hourly rate: {formatCurrency(hourlyRate)}/hour per person</p>
            </div>

            <div className="space-y-2">
              <Label>Planned Duration (minutes)</Label>
              <Input type="number" value={plannedMinutes} onChange={e => setPlannedMinutes(e.target.value)} />
              <div className="flex gap-2 flex-wrap">
                {presetDurations.map(n => (
                  <Button key={n} variant={plannedMinutes === n.toString() ? "default" : "outline"} size="sm" onClick={() => setPlannedMinutes(n.toString())}>{n}m</Button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Meeting Stats</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Users className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Attendees</p>
                  <p className="font-medium">{attendeeCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <DollarSign className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Cost/Min</p>
                  <p className="font-medium">{formatCurrency(costPerSecond * 60)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Clock className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Planned</p>
                  <p className="font-medium">{plannedMinutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <TrendingUp className="size-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-medium">{formatCurrency(plannedCost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`bg-card border-2 rounded-lg p-6 text-center ${overBudget ? "border-red-500" : "border-primary"}`}>
            <p className="text-sm text-muted-foreground mb-2">Current Meeting Cost</p>
            <div className={`text-5xl font-bold mb-4 ${overBudget ? "text-red-500" : "text-primary"}`}>
              {formatCurrency(currentCost)}
            </div>
            <div className="text-2xl font-mono mb-6">{formatTime(elapsedSeconds)}</div>

            <div className="flex justify-center gap-3">
              <Button size="lg" onClick={() => setIsRunning(!isRunning)} className="w-32">
                {isRunning ? <><Pause className="size-4 mr-2" />Pause</> : <><Play className="size-4 mr-2" />Start</>}
              </Button>
              <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="size-4 mr-2" />Reset</Button>
            </div>

            {overBudget && (
              <div className="mt-4 p-3 bg-red-500/20 text-red-500 rounded-lg text-sm">
                Meeting has exceeded the planned budget by {formatCurrency(currentCost - plannedCost)}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Cost Breakdown</Label>
            <div className="relative h-4 bg-muted rounded-full overflow-hidden">
              <div className={`absolute h-full transition-all ${overBudget ? "bg-red-500" : "bg-primary"}`} style={{ width: `${Math.min(100, (currentCost / plannedCost) * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span>{formatCurrency(currentCost)}</span>
              <span className="text-muted-foreground">{plannedCost > 0 ? Math.round((currentCost / plannedCost) * 100) : 0}% of budget</span>
              <span>{formatCurrency(plannedCost)}</span>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground mb-2">Did you know?</h4>
            <ul className="space-y-1">
              <li>• A 1-hour meeting with 10 people at $75k salary costs ~${Math.round(hourlyRate * 10)}</li>
              <li>• Unnecessary meetings cost US companies ~$37 billion annually</li>
              <li>• 71% of meetings are considered unproductive</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
