import { useState } from "react"
import { Droplets, Plus, Minus, Target, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface WaterLog { date: string; amount: number }

const initialLogs: WaterLog[] = [
  { date: new Date().toISOString().split('T')[0], amount: 4 },
  { date: new Date(Date.now() - 86400000).toISOString().split('T')[0], amount: 8 },
  { date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], amount: 6 },
  { date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], amount: 7 },
  { date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], amount: 5 },
  { date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], amount: 8 },
  { date: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0], amount: 6 },
]

const quickAmounts = [1, 2, 4]

export function WaterPage() {
  const [logs, setLogs] = useState<WaterLog[]>(initialLogs)
  const [goal] = useState(8)

  const today = new Date().toISOString().split('T')[0]
  const todayLog = logs.find(l => l.date === today)
  const todayAmount = todayLog?.amount || 0
  const progress = Math.min((todayAmount / goal) * 100, 100)

  const addWater = (cups: number) => {
    setLogs(prev => {
      const existing = prev.find(l => l.date === today)
      if (existing) {
        return prev.map(l => l.date === today ? { ...l, amount: Math.max(0, l.amount + cups) } : l)
      }
      return [...prev, { date: today, amount: Math.max(0, cups) }]
    })
  }

  const last7Days = logs.filter(l => new Date(l.date) >= new Date(Date.now() - 7 * 86400000))
  const avgIntake = last7Days.length ? Math.round(last7Days.reduce((s, l) => s + l.amount, 0) / last7Days.length * 10) / 10 : 0
  const streak = (() => {
    let count = 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      const log = logs.find(l => l.date === date)
      if (log && log.amount >= goal) count++
      else if (i > 0) break
    }
    return count
  })()

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Water Intake</h1><p className="text-sm text-muted-foreground">Stay hydrated, track your daily water</p></div>

      {/* Main Card */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div><p className="text-blue-100">Today's Progress</p><p className="text-4xl font-bold">{todayAmount} / {goal} cups</p></div>
          <div className="size-24 relative">
            <svg className="size-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${progress * 2.83} 283`} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center"><Droplets className="size-8" /></div>
          </div>
        </div>

        <div className="flex gap-2">
          {quickAmounts.map(amt => (
            <Button key={amt} variant="secondary" className="flex-1 bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => addWater(amt)}>
              <Plus className="size-4 mr-1" />+{amt} cup{amt > 1 ? "s" : ""}
            </Button>
          ))}
          <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0" onClick={() => addWater(-1)}>
            <Minus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 text-center">
          <Target className="size-5 mx-auto mb-2 text-muted-foreground" />
          <div className="text-2xl font-semibold">{goal}</div>
          <div className="text-xs text-muted-foreground">Daily Goal</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <TrendingUp className="size-5 mx-auto mb-2 text-muted-foreground" />
          <div className="text-2xl font-semibold">{avgIntake}</div>
          <div className="text-xs text-muted-foreground">7-day Avg</div>
        </div>
        <div className="bg-card border rounded-lg p-4 text-center">
          <Calendar className="size-5 mx-auto mb-2 text-muted-foreground" />
          <div className="text-2xl font-semibold">{streak}</div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
      </div>

      {/* Week View */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-4">This Week</h3>
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const date = new Date(Date.now() - (6 - i) * 86400000)
            const dateStr = date.toISOString().split('T')[0]
            const log = logs.find(l => l.date === dateStr)
            const amt = log?.amount || 0
            const pct = Math.min((amt / goal) * 100, 100)
            const isToday = dateStr === today
            return (
              <div key={i} className="flex-1 text-center">
                <div className="h-24 bg-muted rounded-lg relative overflow-hidden mb-2">
                  <div className="absolute bottom-0 left-0 right-0 bg-blue-500 transition-all" style={{ height: `${pct}%` }} />
                </div>
                <div className={cn("text-xs", isToday ? "font-medium" : "text-muted-foreground")}>
                  {date.toLocaleDateString("en", { weekday: "short" })}
                </div>
                <div className="text-sm font-medium">{amt}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
