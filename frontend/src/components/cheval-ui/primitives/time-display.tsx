import { cn } from "@/lib/utils"

interface TimeDisplayProps {
  seconds: number
  format?: "mm:ss" | "hh:mm:ss" | "minimal"
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeStyles = {
  sm: "text-lg font-medium",
  md: "text-2xl font-semibold",
  lg: "text-4xl font-bold",
  xl: "text-6xl font-bold tracking-tight",
}

function formatTime(totalSeconds: number, format: TimeDisplayProps["format"]) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n: number) => n.toString().padStart(2, "0")

  switch (format) {
    case "hh:mm:ss":
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    case "minimal":
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m ${seconds}s`
      return `${seconds}s`
    case "mm:ss":
    default:
      return `${pad(minutes)}:${pad(seconds)}`
  }
}

export function TimeDisplay({
  seconds,
  format = "mm:ss",
  size = "lg",
  className,
}: TimeDisplayProps) {
  return (
    <span className={cn("tabular-nums", sizeStyles[size], className)}>
      {formatTime(seconds, format)}
    </span>
  )
}
