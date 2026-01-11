import { cn } from "@/lib/utils"

type IntensityLevel = 0 | 1 | 2 | 3 | 4

interface CalendarCellProps {
  date: Date
  intensity?: IntensityLevel
  isToday?: boolean
  isSelected?: boolean
  onClick?: () => void
  className?: string
}

const intensityColors: Record<IntensityLevel, string> = {
  0: "bg-muted",
  1: "bg-green-200 dark:bg-green-900",
  2: "bg-green-400 dark:bg-green-700",
  3: "bg-green-500 dark:bg-green-600",
  4: "bg-green-600 dark:bg-green-500",
}

export function CalendarCell({
  date,
  intensity = 0,
  isToday,
  isSelected,
  onClick,
  className,
}: CalendarCellProps) {
  const day = date.getDate()

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "size-8 rounded-md text-xs font-medium transition-all",
        "hover:ring-2 hover:ring-ring hover:ring-offset-1",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        intensityColors[intensity],
        isToday && "ring-2 ring-primary ring-offset-1",
        isSelected && "ring-2 ring-ring ring-offset-2",
        intensity > 0 ? "text-white" : "text-muted-foreground",
        className
      )}
      title={date.toLocaleDateString()}
    >
      {day}
    </button>
  )
}
