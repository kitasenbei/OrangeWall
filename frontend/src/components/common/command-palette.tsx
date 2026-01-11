import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Search,
  Sun,
  Cloud,
  CheckSquare,
  Calendar,
  Clock,
  Utensils,
  Timer,
  TrendingUp,
  Droplets,
  Target,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { navGroups } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"

// Flatten all nav items for searching
const allItems = navGroups.flatMap(group =>
  group.items.map(item => ({
    ...item,
    group: group.title,
    groupIcon: group.icon,
  }))
)

// Quick answers - these would come from actual app state in production
const quickAnswers: Record<string, { icon: React.ElementType; label: string; value: string; color?: string }> = {
  weather: { icon: Sun, label: "Weather", value: "72°F Sunny", color: "text-yellow-500" },
  temperature: { icon: Sun, label: "Weather", value: "72°F Sunny", color: "text-yellow-500" },
  sunny: { icon: Sun, label: "Weather", value: "72°F Sunny", color: "text-yellow-500" },
  cloudy: { icon: Cloud, label: "Weather", value: "72°F Sunny", color: "text-yellow-500" },
  tasks: { icon: CheckSquare, label: "Tasks Today", value: "5 remaining", color: "text-blue-500" },
  todo: { icon: CheckSquare, label: "Tasks Today", value: "5 remaining", color: "text-blue-500" },
  todos: { icon: CheckSquare, label: "Tasks Today", value: "5 remaining", color: "text-blue-500" },
  calendar: { icon: Calendar, label: "Next Event", value: "Team sync at 3:00 PM", color: "text-purple-500" },
  meeting: { icon: Calendar, label: "Next Meeting", value: "Team sync at 3:00 PM", color: "text-purple-500" },
  meetings: { icon: Calendar, label: "Next Meeting", value: "Team sync at 3:00 PM", color: "text-purple-500" },
  time: { icon: Clock, label: "Current Time", value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), color: "text-gray-500" },
  lunch: { icon: Utensils, label: "Lunch Today", value: "Chicken Salad", color: "text-green-500" },
  dinner: { icon: Utensils, label: "Dinner Today", value: "Pasta Primavera", color: "text-green-500" },
  meal: { icon: Utensils, label: "Next Meal", value: "Chicken Salad", color: "text-green-500" },
  meals: { icon: Utensils, label: "Today's Meals", value: "3 planned", color: "text-green-500" },
  food: { icon: Utensils, label: "Next Meal", value: "Chicken Salad", color: "text-green-500" },
  pomodoro: { icon: Timer, label: "Pomodoro", value: "Ready to start", color: "text-red-500" },
  focus: { icon: Timer, label: "Focus Mode", value: "Ready to start", color: "text-red-500" },
  timer: { icon: Timer, label: "Timer", value: "Ready to start", color: "text-red-500" },
  habits: { icon: Target, label: "Habits Today", value: "3/7 complete", color: "text-orange-500" },
  habit: { icon: Target, label: "Habits Today", value: "3/7 complete", color: "text-orange-500" },
  water: { icon: Droplets, label: "Water Today", value: "5/8 glasses", color: "text-cyan-500" },
  hydration: { icon: Droplets, label: "Water Today", value: "5/8 glasses", color: "text-cyan-500" },
  goals: { icon: TrendingUp, label: "Goals Progress", value: "67% on track", color: "text-emerald-500" },
  goal: { icon: TrendingUp, label: "Goals Progress", value: "67% on track", color: "text-emerald-500" },
}

function QuickAnswerCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-4 bg-primary/5 border border-primary/20 rounded-xl mb-3">
      <div className={cn("size-12 rounded-xl flex items-center justify-center bg-background border", color)}>
        <Icon className="size-6" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
      <OrangeLogo className="size-6 opacity-30" />
    </div>
  )
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const navigate = useNavigate()

  // Find matching quick answer
  const matchedAnswer = search.length >= 2
    ? Object.entries(quickAnswers).find(([key]) =>
        key.includes(search.toLowerCase()) || search.toLowerCase().includes(key)
      )?.[1]
    : null

  const filteredItems = search
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.group.toLowerCase().includes(search.toLowerCase())
      )
    : allItems

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0)
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault()
      handleSelect(filteredItems[selectedIndex].href)
    }
  }, [filteredItems, selectedIndex])

  const handleSelect = (href: string) => {
    navigate(href)
    setOpen(false)
    setSearch("")
  }

  // Group filtered items by category
  const groupedItems = navGroups
    .map(group => ({
      ...group,
      items: filteredItems.filter(item => item.group === group.title),
    }))
    .filter(group => group.items.length > 0)

  // Calculate flat index for keyboard navigation
  let flatIndex = -1

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden [&>button]:hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 border-b">
            <OrangeLogo className="size-7 shrink-0" />
            <Search className="size-5 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... weather, tasks, meals, time..."
              className="border-0 focus-visible:ring-0 px-0 py-4 text-base"
              autoFocus
            />
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-muted-foreground bg-muted border rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {/* Quick Answer Card */}
            {matchedAnswer && (
              <QuickAnswerCard {...matchedAnswer} />
            )}

            {filteredItems.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <OrangeLogo className="size-10 mx-auto mb-3 opacity-50" />
                <p>No results found for "{search}"</p>
              </div>
            ) : (
              groupedItems.map(group => (
                <div key={group.title} className="mb-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <group.icon className="size-3.5" />
                    {group.title}
                  </div>
                  {group.items.map(item => {
                    flatIndex++
                    const isSelected = flatIndex === selectedIndex
                    const currentIndex = flatIndex

                    return (
                      <button
                        key={item.href}
                        onClick={() => handleSelect(item.href)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        )}
                      >
                        <div className={cn(
                          "size-8 rounded-lg flex items-center justify-center shrink-0",
                          isSelected
                            ? "bg-primary-foreground/20"
                            : "bg-muted"
                        )}>
                          <item.icon className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className={cn(
                            "text-xs truncate",
                            isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {item.href}
                          </div>
                        </div>
                        {isSelected && (
                          <kbd className="px-1.5 py-0.5 text-xs font-mono bg-primary-foreground/20 rounded">
                            Enter
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-background border rounded">↑</kbd>
                <kbd className="px-1 py-0.5 bg-background border rounded">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-background border rounded">Enter</kbd>
                Open
              </span>
            </div>
            <span>{filteredItems.length} results</span>
          </div>
        </DialogContent>
      </Dialog>
  )
}
