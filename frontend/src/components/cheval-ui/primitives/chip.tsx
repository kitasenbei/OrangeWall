import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ChipProps {
  label: string
  color?: string
  removable?: boolean
  onRemove?: () => void
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function Chip({
  label,
  color,
  removable,
  onRemove,
  onClick,
  selected,
  className,
}: ChipProps) {
  return (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm",
        "transition-all duration-200",
        onClick && "cursor-pointer hover:scale-105",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80",
        className
      )}
      style={color && !selected ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {color && (
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-1 rounded-full p-0.5 hover:bg-black/10"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}
