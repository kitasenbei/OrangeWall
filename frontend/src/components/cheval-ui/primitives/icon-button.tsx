import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type IconButtonVariant = "default" | "ghost" | "outline" | "destructive"
type IconButtonSize = "sm" | "md" | "lg"

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  variant?: IconButtonVariant
  size?: IconButtonSize
  label?: string
}

const variantStyles: Record<IconButtonVariant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
}

const sizeStyles: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: "size-8", icon: "size-4" },
  md: { button: "size-10", icon: "size-5" },
  lg: { button: "size-12", icon: "size-6" },
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, variant = "ghost", size = "md", label, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size].button,
          className
        )}
        aria-label={label}
        {...props}
      >
        <Icon className={sizeStyles[size].icon} />
      </button>
    )
  }
)

IconButton.displayName = "IconButton"
