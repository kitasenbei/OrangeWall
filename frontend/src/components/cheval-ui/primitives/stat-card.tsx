import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

export interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  subtitle?: string
  trend?: "up" | "down"
  trendValue?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {trendValue && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              !trend && "text-muted-foreground"
            )}
          >
            {trendValue}
          </span>
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      )}
    </div>
  )
}
