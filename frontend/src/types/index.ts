import type { ComponentType } from "react"

// Global type definitions
export interface NavItem {
  title: string
  href: string
  icon: ComponentType<{ className?: string }>
  badge?: string | number
}

export interface NavGroup {
  title: string
  icon: ComponentType<{ className?: string }>
  items: NavItem[]
}
