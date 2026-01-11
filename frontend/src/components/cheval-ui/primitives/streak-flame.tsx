import { cn } from "@/lib/utils"
import { Flame } from "lucide-react"

interface StreakFlameProps {
  count: number
  size?: "sm" | "md" | "lg"
  showCount?: boolean
  className?: string
}

const sizeConfig = {
  sm: { icon: "size-4", text: "text-xs", gap: "gap-0.5" },
  md: { icon: "size-5", text: "text-sm", gap: "gap-1" },
  lg: { icon: "size-6", text: "text-base", gap: "gap-1.5" },
}

function getFlameColor(count: number) {
  if (count === 0) return "text-muted-foreground"
  if (count < 7) return "text-orange-400"
  if (count < 30) return "text-orange-500"
  if (count < 100) return "text-red-500"
  return "text-red-600"
}

export function StreakFlame({ count, size = "md", showCount = true, className }: StreakFlameProps) {
  const config = sizeConfig[size]
  const isActive = count > 0

  return (
    <div className={cn("inline-flex items-center", config.gap, className)}>
      <Flame
        className={cn(
          config.icon,
          getFlameColor(count),
          isActive && "drop-shadow-[0_0_4px_rgba(251,146,60,0.5)]"
        )}
        fill={isActive ? "currentColor" : "none"}
      />
      {showCount && (
        <span className={cn("font-semibold tabular-nums", config.text, getFlameColor(count))}>
          {count}
        </span>
      )}
    </div>
  )
}
