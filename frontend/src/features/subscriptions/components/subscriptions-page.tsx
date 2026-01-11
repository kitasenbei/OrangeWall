import { useState, useMemo } from "react"
import {
  Plus,
  CreditCard,
  Trash2,
  Edit3,
  MoreVertical,
  Calendar,
  DollarSign,
  AlertTriangle,
  Pause,
  Play,
  TrendingUp,
  Tv,
  Music,
  Cloud,
  Gamepad2,
  Newspaper,
  GraduationCap,
  Dumbbell,
  Shield,
  Package,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/cheval-ui"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  billingCycle: "weekly" | "monthly" | "quarterly" | "yearly"
  category: string
  nextBillingDate: Date
  startDate: Date
  isPaused: boolean
  logo?: string
  url?: string
}

const categories: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "streaming", label: "Streaming", icon: Tv },
  { id: "music", label: "Music", icon: Music },
  { id: "cloud", label: "Cloud Storage", icon: Cloud },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "news", label: "News & Media", icon: Newspaper },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "fitness", label: "Fitness", icon: Dumbbell },
  { id: "security", label: "Security", icon: Shield },
  { id: "software", label: "Software", icon: Package },
  { id: "other", label: "Other", icon: CreditCard },
]

const billingCycles = [
  { value: "weekly", label: "Weekly", multiplier: 52 },
  { value: "monthly", label: "Monthly", multiplier: 12 },
  { value: "quarterly", label: "Quarterly", multiplier: 4 },
  { value: "yearly", label: "Yearly", multiplier: 1 },
]

function getNextBillingDate(startDate: Date, cycle: Subscription["billingCycle"]): Date {
  const now = new Date()
  let next = new Date(startDate)

  while (next <= now) {
    switch (cycle) {
      case "weekly":
        next.setDate(next.getDate() + 7)
        break
      case "monthly":
        next.setMonth(next.getMonth() + 1)
        break
      case "quarterly":
        next.setMonth(next.getMonth() + 3)
        break
      case "yearly":
        next.setFullYear(next.getFullYear() + 1)
        break
    }
  }
  return next
}

function getYearlyAmount(amount: number, cycle: Subscription["billingCycle"]): number {
  const multiplier = billingCycles.find((c) => c.value === cycle)?.multiplier || 12
  return amount * multiplier
}

function generateMockSubscriptions(): Subscription[] {
  return [
    {
      id: "1",
      name: "Netflix",
      description: "Premium plan",
      amount: 22.99,
      currency: "USD",
      billingCycle: "monthly",
      category: "streaming",
      startDate: new Date(2023, 0, 15),
      nextBillingDate: getNextBillingDate(new Date(2023, 0, 15), "monthly"),
      isPaused: false,
      url: "https://netflix.com",
    },
    {
      id: "2",
      name: "Spotify",
      description: "Family plan",
      amount: 16.99,
      currency: "USD",
      billingCycle: "monthly",
      category: "music",
      startDate: new Date(2022, 5, 1),
      nextBillingDate: getNextBillingDate(new Date(2022, 5, 1), "monthly"),
      isPaused: false,
      url: "https://spotify.com",
    },
    {
      id: "3",
      name: "iCloud+",
      description: "200GB storage",
      amount: 2.99,
      currency: "USD",
      billingCycle: "monthly",
      category: "cloud",
      startDate: new Date(2021, 8, 10),
      nextBillingDate: getNextBillingDate(new Date(2021, 8, 10), "monthly"),
      isPaused: false,
    },
    {
      id: "4",
      name: "Xbox Game Pass",
      description: "Ultimate",
      amount: 16.99,
      currency: "USD",
      billingCycle: "monthly",
      category: "gaming",
      startDate: new Date(2023, 3, 20),
      nextBillingDate: getNextBillingDate(new Date(2023, 3, 20), "monthly"),
      isPaused: false,
    },
    {
      id: "5",
      name: "The New York Times",
      description: "Digital access",
      amount: 4.25,
      currency: "USD",
      billingCycle: "weekly",
      category: "news",
      startDate: new Date(2024, 0, 1),
      nextBillingDate: getNextBillingDate(new Date(2024, 0, 1), "weekly"),
      isPaused: true,
    },
    {
      id: "6",
      name: "Adobe Creative Cloud",
      description: "All Apps",
      amount: 599.88,
      currency: "USD",
      billingCycle: "yearly",
      category: "software",
      startDate: new Date(2023, 6, 15),
      nextBillingDate: getNextBillingDate(new Date(2023, 6, 15), "yearly"),
      isPaused: false,
    },
    {
      id: "7",
      name: "Gym Membership",
      description: "Premium access",
      amount: 49.99,
      currency: "USD",
      billingCycle: "monthly",
      category: "fitness",
      startDate: new Date(2024, 0, 1),
      nextBillingDate: getNextBillingDate(new Date(2024, 0, 1), "monthly"),
      isPaused: false,
    },
  ]
}

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(generateMockSubscriptions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    amount: "",
    currency: "USD",
    billingCycle: "monthly" as Subscription["billingCycle"],
    category: "other",
    startDate: new Date().toISOString().split("T")[0],
    url: "",
  })

  const activeSubscriptions = subscriptions.filter((s) => !s.isPaused)

  const filteredSubscriptions = filterCategory
    ? subscriptions.filter((s) => s.category === filterCategory)
    : subscriptions

  const stats = useMemo(() => {
    const monthlyTotal = activeSubscriptions.reduce((acc, s) => {
      const yearly = getYearlyAmount(s.amount, s.billingCycle)
      return acc + yearly / 12
    }, 0)

    const yearlyTotal = activeSubscriptions.reduce((acc, s) => {
      return acc + getYearlyAmount(s.amount, s.billingCycle)
    }, 0)

    const upcomingThisWeek = activeSubscriptions.filter((s) => {
      const daysUntil = Math.ceil(
        (s.nextBillingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      return daysUntil <= 7 && daysUntil >= 0
    })

    const byCategory = categories.map((cat) => {
      const catSubs = activeSubscriptions.filter((s) => s.category === cat.id)
      const total = catSubs.reduce((acc, s) => acc + getYearlyAmount(s.amount, s.billingCycle) / 12, 0)
      return { ...cat, total, count: catSubs.length }
    }).filter((c) => c.count > 0).sort((a, b) => b.total - a.total)

    return { monthlyTotal, yearlyTotal, upcomingThisWeek, byCategory }
  }, [activeSubscriptions])

  const handleOpenAdd = () => {
    setEditingSubscription(null)
    setFormData({
      name: "",
      description: "",
      amount: "",
      currency: "USD",
      billingCycle: "monthly",
      category: "other",
      startDate: new Date().toISOString().split("T")[0],
      url: "",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      description: subscription.description,
      amount: subscription.amount.toString(),
      currency: subscription.currency,
      billingCycle: subscription.billingCycle,
      category: subscription.category,
      startDate: subscription.startDate.toISOString().split("T")[0],
      url: subscription.url || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const amount = parseFloat(formData.amount)
    if (!formData.name.trim() || isNaN(amount) || amount <= 0) return

    const startDate = new Date(formData.startDate)

    if (editingSubscription) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editingSubscription.id
            ? {
                ...s,
                name: formData.name,
                description: formData.description,
                amount,
                currency: formData.currency,
                billingCycle: formData.billingCycle,
                category: formData.category,
                startDate,
                nextBillingDate: getNextBillingDate(startDate, formData.billingCycle),
                url: formData.url || undefined,
              }
            : s
        )
      )
    } else {
      const newSubscription: Subscription = {
        id: crypto.randomUUID(),
        name: formData.name,
        description: formData.description,
        amount,
        currency: formData.currency,
        billingCycle: formData.billingCycle,
        category: formData.category,
        startDate,
        nextBillingDate: getNextBillingDate(startDate, formData.billingCycle),
        isPaused: false,
        url: formData.url || undefined,
      }
      setSubscriptions((prev) => [...prev, newSubscription])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleTogglePause = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPaused: !s.isPaused } : s))
    )
  }

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || categories[categories.length - 1]
  }

  const getDaysUntilBilling = (date: Date): number => {
    return Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Track your recurring payments and services</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4 mr-2" />
          Add Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Cost"
          value={`$${stats.monthlyTotal.toFixed(2)}`}
          icon={DollarSign}
        />
        <StatCard
          title="Yearly Cost"
          value={`$${stats.yearlyTotal.toFixed(2)}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions.length.toString()}
          icon={CreditCard}
        />
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="size-4" />
            <span className="text-sm">Due This Week</span>
          </div>
          <span className="text-2xl font-bold">{stats.upcomingThisWeek.length}</span>
          {stats.upcomingThisWeek.length > 0 && (
            <span className="text-xs text-muted-foreground">
              ${stats.upcomingThisWeek.reduce((acc, s) => acc + s.amount, 0).toFixed(2)} total
            </span>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {stats.byCategory.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          <div className="space-y-3">
            {stats.byCategory.map((cat) => {
              const percentage = stats.monthlyTotal > 0 ? (cat.total / stats.monthlyTotal) * 100 : 0
              const CatIcon = cat.icon
              return (
                <div key={cat.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <CatIcon className="size-4 text-muted-foreground" />
                      {cat.label}
                      <Badge variant="secondary" className="text-xs">{cat.count}</Badge>
                    </span>
                    <span className="font-medium">${cat.total.toFixed(2)}/mo</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={filterCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterCategory(null)}
        >
          All ({subscriptions.length})
        </Button>
        {categories.filter((c) => subscriptions.some((s) => s.category === c.id)).map((cat) => {
          const CatIcon = cat.icon
          const count = subscriptions.filter((s) => s.category === cat.id).length
          return (
            <Button
              key={cat.id}
              variant={filterCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(cat.id)}
              className="gap-2"
            >
              <CatIcon className="size-4" />
              {cat.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <CreditCard className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">No subscriptions yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your recurring payments
          </p>
          <Button onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubscriptions.map((subscription) => {
            const categoryInfo = getCategoryInfo(subscription.category)
            const CategoryIcon = categoryInfo.icon
            const daysUntil = getDaysUntilBilling(subscription.nextBillingDate)
            const isUrgent = daysUntil <= 3 && !subscription.isPaused

            return (
              <div
                key={subscription.id}
                className={cn(
                  "group rounded-lg border bg-card p-4 transition-all",
                  subscription.isPaused && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <CategoryIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{subscription.name}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(subscription)}>
                        <Edit3 className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePause(subscription.id)}>
                        {subscription.isPaused ? (
                          <>
                            <Play className="size-4 mr-2" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="size-4 mr-2" />
                            Pause
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(subscription.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-2xl font-bold">
                      ${subscription.amount.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{subscription.billingCycle === "yearly" ? "year" : subscription.billingCycle === "quarterly" ? "quarter" : subscription.billingCycle === "weekly" ? "week" : "month"}
                    </span>
                  </div>
                  {subscription.isPaused ? (
                    <Badge variant="secondary">Paused</Badge>
                  ) : (
                    <div className={cn("text-right", isUrgent && "text-orange-500")}>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="size-3" />
                        {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {subscription.nextBillingDate.toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSubscription ? "Edit Subscription" : "Add Subscription"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Netflix, Spotify"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Premium plan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Billing Cycle</Label>
                <Select
                  value={formData.billingCycle}
                  onValueChange={(v) =>
                    setFormData({ ...formData, billingCycle: v as Subscription["billingCycle"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {billingCycles.map((cycle) => (
                      <SelectItem key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const CatIcon = cat.icon
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <CatIcon className="size-4" />
                          {cat.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="url">Website URL (optional)</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.name.trim() || !formData.amount}>
                {editingSubscription ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
