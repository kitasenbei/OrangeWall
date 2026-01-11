import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { StreakFlame } from "../primitives/streak-flame"
import { ProgressRing } from "../primitives/progress-ring"

export interface Habit {
  id: string
  name: string
  icon?: string
  color: string
  frequency: "daily" | "weekly"
  targetPerPeriod: number
  completedDates: string[] // ISO date strings
}

interface HabitTrackerProps {
  habit: Habit
  onToggleToday?: (habitId: string) => void
  className?: string
}

function getStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0

  const sorted = [...completedDates].sort().reverse()
  const today = new Date().toISOString().split("T")[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

  // Must have completed today or yesterday to have an active streak
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0

  let streak = 0
  let currentDate = new Date(sorted[0])

  for (const dateStr of sorted) {
    const date = new Date(dateStr)
    const diffDays = Math.floor((currentDate.getTime() - date.getTime()) / 86400000)

    if (diffDays <= 1) {
      streak++
      currentDate = date
    } else {
      break
    }
  }

  return streak
}

function getWeekProgress(habit: Habit): { completed: number; dates: boolean[] } {
  const today = new Date()
  const dates: boolean[] = []
  let completed = 0

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]
    const isCompleted = habit.completedDates.includes(dateStr)
    dates.push(isCompleted)
    if (isCompleted) completed++
  }

  return { completed, dates }
}

export function HabitTracker({ habit, onToggleToday, className }: HabitTrackerProps) {
  const today = new Date().toISOString().split("T")[0]
  const isCompletedToday = habit.completedDates.includes(today)
  const streak = getStreak(habit.completedDates)
  const { completed, dates } = getWeekProgress(habit)
  const weekDays = ["M", "T", "W", "T", "F", "S", "S"]

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border bg-card p-4",
        "transition-all hover:shadow-sm",
        className
      )}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggleToday?.(habit.id)}
        className={cn(
          "size-12 rounded-full border-2 flex items-center justify-center transition-all",
          "hover:scale-105 active:scale-95",
          isCompletedToday
            ? "border-transparent text-white"
            : "border-dashed border-muted-foreground/30 hover:border-muted-foreground/50"
        )}
        style={isCompletedToday ? { backgroundColor: habit.color } : undefined}
      >
        {isCompletedToday && <Check className="size-6" strokeWidth={3} />}
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{habit.name}</span>
          <StreakFlame count={streak} size="sm" />
        </div>

        {/* Week dots */}
        <div className="flex items-center gap-1 mt-2">
          {dates.map((completed, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <div
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  completed ? "bg-green-500" : "bg-muted"
                )}
                style={completed ? { backgroundColor: habit.color } : undefined}
              />
              <span className="text-[10px] text-muted-foreground">{weekDays[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress ring */}
      <ProgressRing
        value={completed}
        max={habit.targetPerPeriod}
        size={48}
        strokeWidth={4}
        progressClassName="stroke-current"
        className="shrink-0"
        style={{ color: habit.color } as React.CSSProperties}
      >
        <span className="text-xs font-medium">{completed}/{habit.targetPerPeriod}</span>
      </ProgressRing>
    </div>
  )
}
