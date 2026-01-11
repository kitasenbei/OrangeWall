import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  pulse?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-green-500 text-white",
  warning: "bg-yellow-500 text-white",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border border-current bg-transparent",
}

export function Badge({ variant = "default", pulse, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        "transition-colors",
        variantStyles[variant],
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
