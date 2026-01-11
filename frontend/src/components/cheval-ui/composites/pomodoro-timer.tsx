import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react"
import { ProgressRing } from "../primitives/progress-ring"
import { TimeDisplay } from "../primitives/time-display"
import { IconButton } from "../primitives/icon-button"
import { Badge } from "../primitives/badge"

type TimerMode = "focus" | "shortBreak" | "longBreak"

interface PomodoroTimerProps {
  focusDuration?: number // minutes
  shortBreakDuration?: number
  longBreakDuration?: number
  sessionsBeforeLongBreak?: number
  onSessionComplete?: (mode: TimerMode) => void
  className?: string
}

const modeConfig: Record<TimerMode, { label: string; color: string; icon: typeof Brain }> = {
  focus: { label: "Focus", color: "stroke-red-500", icon: Brain },
  shortBreak: { label: "Short Break", color: "stroke-green-500", icon: Coffee },
  longBreak: { label: "Long Break", color: "stroke-blue-500", icon: Coffee },
}

export function PomodoroTimer({
  focusDuration = 25,
  shortBreakDuration = 5,
  longBreakDuration = 15,
  sessionsBeforeLongBreak = 4,
  onSessionComplete,
  className,
}: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>("focus")
  const [isRunning, setIsRunning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(focusDuration * 60)
  const [completedSessions, setCompletedSessions] = useState(0)

  const getDuration = useCallback((m: TimerMode) => {
    switch (m) {
      case "focus": return focusDuration * 60
      case "shortBreak": return shortBreakDuration * 60
      case "longBreak": return longBreakDuration * 60
    }
  }, [focusDuration, shortBreakDuration, longBreakDuration])

  const totalSeconds = getDuration(mode)
  const config = modeConfig[mode]
  const ModeIcon = config.icon

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          onSessionComplete?.(mode)

          // Auto-switch modes
          if (mode === "focus") {
            const newSessions = completedSessions + 1
            setCompletedSessions(newSessions)

            if (newSessions % sessionsBeforeLongBreak === 0) {
              setMode("longBreak")
              return longBreakDuration * 60
            } else {
              setMode("shortBreak")
              return shortBreakDuration * 60
            }
          } else {
            setMode("focus")
            return focusDuration * 60
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, mode, completedSessions, focusDuration, shortBreakDuration, longBreakDuration, sessionsBeforeLongBreak, onSessionComplete])

  const handleReset = () => {
    setIsRunning(false)
    setSecondsLeft(getDuration(mode))
  }

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode)
    setSecondsLeft(getDuration(newMode))
    setIsRunning(false)
  }

  return (
    <div className={cn("flex flex-col items-center gap-6", className)}>
      <div className="flex gap-2">
        {(Object.keys(modeConfig) as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={cn(
              "px-3 py-1.5 text-sm rounded-full transition-colors",
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {modeConfig[m].label}
          </button>
        ))}
      </div>

      <ProgressRing
        value={totalSeconds - secondsLeft}
        max={totalSeconds}
        size={200}
        strokeWidth={8}
        progressClassName={config.color}
      >
        <div className="flex flex-col items-center gap-1">
          <ModeIcon className={cn("size-6", mode === "focus" ? "text-red-500" : "text-green-500")} />
          <TimeDisplay seconds={secondsLeft} size="xl" />
        </div>
      </ProgressRing>

      <div className="flex items-center gap-3">
        <IconButton
          icon={isRunning ? Pause : Play}
          variant="default"
          size="lg"
          onClick={() => setIsRunning(!isRunning)}
          label={isRunning ? "Pause" : "Start"}
        />
        <IconButton
          icon={RotateCcw}
          variant="outline"
          size="md"
          onClick={handleReset}
          label="Reset"
        />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {completedSessions} sessions
        </Badge>
        <span className="text-sm text-muted-foreground">
          Next long break in {sessionsBeforeLongBreak - (completedSessions % sessionsBeforeLongBreak)} sessions
        </span>
      </div>
    </div>
  )
}
