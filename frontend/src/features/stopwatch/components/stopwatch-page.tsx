import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function StopwatchPage() {
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setTime(t => t + 10), 10)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const centiseconds = Math.floor((ms % 1000) / 10)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`
  }

  const reset = () => { setTime(0); setRunning(false); setLaps([]) }
  const lap = () => setLaps([time, ...laps])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Stopwatch</h1><p className="text-sm text-muted-foreground">Track time with precision</p></div>

      <div className="flex flex-col items-center py-12">
        <div className="text-7xl font-mono font-bold tracking-tight mb-8">{formatTime(time)}</div>

        <div className="flex gap-3">
          <Button size="lg" onClick={() => setRunning(!running)} className="w-32">
            {running ? <><Pause className="size-5 mr-2" />Pause</> : <><Play className="size-5 mr-2" />Start</>}
          </Button>
          <Button size="lg" variant="outline" onClick={lap} disabled={!running}><Flag className="size-5 mr-2" />Lap</Button>
          <Button size="lg" variant="outline" onClick={reset}><RotateCcw className="size-5 mr-2" />Reset</Button>
        </div>
      </div>

      {laps.length > 0 && (
        <div className="max-w-md mx-auto">
          <h3 className="font-medium mb-3">Laps</h3>
          <div className="space-y-2">
            {laps.map((lapTime, i) => (
              <div key={i} className="flex justify-between bg-card border rounded-lg px-4 py-2">
                <span className="text-muted-foreground">Lap {laps.length - i}</span>
                <span className="font-mono">{formatTime(lapTime)}</span>
                {i < laps.length - 1 && <span className="text-sm text-muted-foreground">+{formatTime(lapTime - laps[i + 1])}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
