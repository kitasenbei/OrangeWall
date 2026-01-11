import { useState, useMemo } from "react"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Trash2,
  Edit3,
  MoreVertical,
  Calendar,
  BarChart3,
  Target,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Wallet,
  ArrowRightLeft,
  Home,
  UtensilsCrossed,
  Car,
  Lightbulb,
  Laptop,
  Gamepad2,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Package,
  Briefcase,
  Monitor,
  LineChart,
  Building,
  Undo2,
  Gift,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { StatCard } from "@/components/cheval-ui"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
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

interface Transaction {
  id: string
  type: "income" | "expense" | "transfer"
  amount: number
  category: string
  description: string
  date: Date
  accountId: string
  toAccountId?: string // for transfers
  isRecurring: boolean
  recurringInterval?: "daily" | "weekly" | "monthly" | "yearly"
}

interface Account {
  id: string
  name: string
  type: "checking" | "savings" | "cash" | "credit"
  balance: number
  color: string
}

interface Budget {
  id: string
  category: string
  limit: number
  period: "monthly" | "weekly"
}

const accountColors = [
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#22c55e", name: "Green" },
  { hex: "#f97316", name: "Orange" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#06b6d4", name: "Cyan" },
]

const expenseCategories: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "housing", label: "Housing", icon: Home },
  { id: "food", label: "Food & Dining", icon: UtensilsCrossed },
  { id: "transport", label: "Transportation", icon: Car },
  { id: "utilities", label: "Utilities", icon: Lightbulb },
  { id: "software", label: "Software", icon: Laptop },
  { id: "entertainment", label: "Entertainment", icon: Gamepad2 },
  { id: "health", label: "Health", icon: HeartPulse },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "other", label: "Other", icon: Package },
]

const incomeCategories: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "salary", label: "Salary", icon: Briefcase },
  { id: "freelance", label: "Freelance", icon: Monitor },
  { id: "investment", label: "Investment", icon: LineChart },
  { id: "business", label: "Business", icon: Building },
  { id: "refund", label: "Refund", icon: Undo2 },
  { id: "gift", label: "Gift", icon: Gift },
  { id: "other", label: "Other", icon: Package },
]

function getDateStr(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const now = new Date()

  // Generate transactions for the past 3 months
  for (let month = 0; month < 3; month++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1)

    // Income
    transactions.push({
      id: crypto.randomUUID(),
      type: "income",
      amount: 4500 + Math.random() * 500,
      category: "salary",
      description: "Monthly salary",
      date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
      accountId: "checking",
      isRecurring: true,
      recurringInterval: "monthly",
    })

    // Random expenses
    for (let i = 0; i < 15 + Math.floor(Math.random() * 10); i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      const category = expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
      const amounts: Record<string, [number, number]> = {
        housing: [1200, 1500],
        food: [20, 100],
        transport: [30, 80],
        utilities: [50, 150],
        software: [10, 50],
        entertainment: [15, 60],
        health: [30, 200],
        shopping: [25, 150],
        education: [50, 200],
        other: [10, 50],
      }
      const [min, max] = amounts[category.id] || [20, 100]

      transactions.push({
        id: crypto.randomUUID(),
        type: "expense",
        amount: min + Math.random() * (max - min),
        category: category.id,
        description: `${category.label} expense`,
        date: new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
        accountId: Math.random() > 0.3 ? "checking" : "credit",
        isRecurring: false,
      })
    }
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime())
}

const defaultAccounts: Account[] = [
  { id: "checking", name: "Checking", type: "checking", balance: 5420, color: "#3b82f6" },
  { id: "savings", name: "Savings", type: "savings", balance: 12500, color: "#22c55e" },
  { id: "cash", name: "Cash", type: "cash", balance: 340, color: "#f97316" },
  { id: "credit", name: "Credit Card", type: "credit", balance: -850, color: "#ef4444" },
]

const defaultBudgets: Budget[] = [
  { id: "1", category: "food", limit: 500, period: "monthly" },
  { id: "2", category: "entertainment", limit: 200, period: "monthly" },
  { id: "3", category: "shopping", limit: 300, period: "monthly" },
  { id: "4", category: "transport", limit: 250, period: "monthly" },
]

type ViewMode = "transactions" | "budgets" | "reports"

export function FinancesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(generateMockTransactions)
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts)
  const [budgets, setBudgets] = useState<Budget[]>(defaultBudgets)
  const [viewMode, setViewMode] = useState<ViewMode>("transactions")
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false)
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const [formData, setFormData] = useState({
    type: "expense" as Transaction["type"],
    amount: "",
    category: "",
    description: "",
    date: getDateStr(new Date()),
    accountId: "checking",
    toAccountId: "",
    isRecurring: false,
    recurringInterval: "monthly" as Transaction["recurringInterval"],
  })

  const [budgetFormData, setBudgetFormData] = useState({
    category: "",
    limit: "",
    period: "monthly" as Budget["period"],
  })

  const [accountFormData, setAccountFormData] = useState({
    name: "",
    type: "checking" as Account["type"],
    balance: "",
    color: accountColors[0].hex,
  })

  const monthStart = getMonthStart(selectedMonth)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = t.date
      const inMonth = date >= monthStart && date <= monthEnd
      const inAccount = !selectedAccount || t.accountId === selectedAccount
      return inMonth && inAccount
    })
  }, [transactions, monthStart, monthEnd, selectedAccount])

  const totalBalance = accounts.reduce((acc, a) => acc + a.balance, 0)
  const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
  const monthExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
  const monthNet = monthIncome - monthExpenses

  const expensesByCategory = useMemo(() => {
    const result: Record<string, number> = {}
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        result[t.category] = (result[t.category] || 0) + t.amount
      })
    return Object.entries(result)
      .map(([category, amount]) => ({
        category,
        amount,
        info: expenseCategories.find((c) => c.id === category) || { id: category, label: category, icon: Package },
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [monthTransactions])

  const budgetProgress = useMemo(() => {
    return budgets.map((budget) => {
      const spent = monthTransactions
        .filter((t) => t.type === "expense" && t.category === budget.category)
        .reduce((acc, t) => acc + t.amount, 0)
      const percentage = Math.min(100, (spent / budget.limit) * 100)
      const categoryInfo = expenseCategories.find((c) => c.id === budget.category)
      return { ...budget, spent, percentage, categoryInfo }
    })
  }, [budgets, monthTransactions])

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}
    monthTransactions.forEach((t) => {
      const dateStr = getDateStr(t.date)
      if (!groups[dateStr]) groups[dateStr] = []
      groups[dateStr].push(t)
    })
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
  }, [monthTransactions])

  const handleOpenAdd = () => {
    setEditingTransaction(null)
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: getDateStr(new Date()),
      accountId: "checking",
      toAccountId: "",
      isRecurring: false,
      recurringInterval: "monthly",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: getDateStr(transaction.date),
      accountId: transaction.accountId,
      toAccountId: transaction.toAccountId || "",
      isRecurring: transaction.isRecurring,
      recurringInterval: transaction.recurringInterval || "monthly",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) return

    if (editingTransaction) {
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === editingTransaction.id
            ? {
                ...t,
                type: formData.type,
                amount,
                category: formData.category,
                description: formData.description,
                date: new Date(formData.date),
                accountId: formData.accountId,
                toAccountId: formData.type === "transfer" ? formData.toAccountId : undefined,
                isRecurring: formData.isRecurring,
                recurringInterval: formData.isRecurring ? formData.recurringInterval : undefined,
              }
            : t
        )
      )
    } else {
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        type: formData.type,
        amount,
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        accountId: formData.accountId,
        toAccountId: formData.type === "transfer" ? formData.toAccountId : undefined,
        isRecurring: formData.isRecurring,
        recurringInterval: formData.isRecurring ? formData.recurringInterval : undefined,
      }
      setTransactions((prev) => [newTransaction, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()))

      // Update account balances
      if (formData.type === "income") {
        setAccounts((prev) =>
          prev.map((a) => (a.id === formData.accountId ? { ...a, balance: a.balance + amount } : a))
        )
      } else if (formData.type === "expense") {
        setAccounts((prev) =>
          prev.map((a) => (a.id === formData.accountId ? { ...a, balance: a.balance - amount } : a))
        )
      } else if (formData.type === "transfer" && formData.toAccountId) {
        setAccounts((prev) =>
          prev.map((a) => {
            if (a.id === formData.accountId) return { ...a, balance: a.balance - amount }
            if (a.id === formData.toAccountId) return { ...a, balance: a.balance + amount }
            return a
          })
        )
      }
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  const handleAddBudget = () => {
    const limit = parseFloat(budgetFormData.limit)
    if (isNaN(limit) || limit <= 0 || !budgetFormData.category) return

    const newBudget: Budget = {
      id: crypto.randomUUID(),
      category: budgetFormData.category,
      limit,
      period: budgetFormData.period,
    }
    setBudgets((prev) => [...prev, newBudget])
    setBudgetFormData({ category: "", limit: "", period: "monthly" })
    setIsBudgetDialogOpen(false)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id))
  }

  const handleAddAccount = () => {
    const balance = parseFloat(accountFormData.balance)
    if (isNaN(balance) || !accountFormData.name.trim()) return

    const newAccount: Account = {
      id: crypto.randomUUID(),
      name: accountFormData.name,
      type: accountFormData.type,
      balance,
      color: accountFormData.color,
    }
    setAccounts((prev) => [...prev, newAccount])
    setAccountFormData({ name: "", type: "checking", balance: "", color: accountColors[0].hex })
    setIsAccountDialogOpen(false)
  }

  const getCategoryInfo = (categoryId: string, type: Transaction["type"]) => {
    const categories = type === "income" ? incomeCategories : expenseCategories
    return categories.find((c) => c.id === categoryId) || { id: categoryId, label: categoryId, icon: Package }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finances</h1>
          <p className="text-muted-foreground">Track income, expenses, and budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsAccountDialogOpen(true)}>
            <Wallet className="size-4 mr-2" />
            Account
          </Button>
          <Button onClick={handleOpenAdd}>
            <Plus className="size-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Accounts */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedAccount(null)}
          className={cn(
            "flex flex-col gap-1 rounded-lg border bg-card p-4 min-w-[160px] text-left transition-all",
            !selectedAccount && "ring-2 ring-primary"
          )}
        >
          <span className="text-sm text-muted-foreground">Total Balance</span>
          <span className="text-xl font-bold">${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          <span className="text-xs text-muted-foreground">{accounts.length} accounts</span>
        </button>
        {accounts.map((account) => (
          <button
            key={account.id}
            onClick={() => setSelectedAccount(account.id === selectedAccount ? null : account.id)}
            className={cn(
              "flex flex-col gap-1 rounded-lg border bg-card p-4 min-w-[160px] text-left transition-all",
              selectedAccount === account.id && "ring-2 ring-primary"
            )}
            style={{ borderTopColor: account.color, borderTopWidth: "3px" }}
          >
            <span className="text-sm text-muted-foreground">{account.name}</span>
            <span className={cn("text-xl font-bold", account.balance < 0 && "text-red-500")}>
              ${Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              {account.balance < 0 && " owed"}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{account.type}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Net This Month"
          value={`${monthNet >= 0 ? "+" : ""}$${Math.abs(monthNet).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          className={monthNet >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatCard
          title="Income"
          value={`$${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
        />
        <StatCard
          title="Expenses"
          value={`$${monthExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
          icon={TrendingDown}
        />
        <StatCard
          title="Savings Rate"
          value={monthIncome > 0 ? `${Math.round((monthNet / monthIncome) * 100)}%` : "0%"}
          icon={PiggyBank}
        />
      </div>

      {/* Tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="transactions" className="gap-2">
              <Calendar className="size-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="budgets" className="gap-2">
              <Target className="size-4" />
              Budgets
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <BarChart3 className="size-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Month selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-[120px] text-center font-medium">
              {selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Transactions View */}
        <TabsContent value="transactions" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border bg-card">
              {groupedTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <DollarSign className="size-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions this month</p>
                </div>
              ) : (
                groupedTransactions.map(([dateStr, dayTransactions]) => {
                  const date = new Date(dateStr)
                  const dayTotal = dayTransactions.reduce(
                    (acc, t) => acc + (t.type === "income" ? t.amount : t.type === "expense" ? -t.amount : 0),
                    0
                  )

                  return (
                    <div key={dateStr}>
                      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </span>
                        <span className={cn("text-sm font-medium", dayTotal >= 0 ? "text-green-600" : "text-red-600")}>
                          {dayTotal >= 0 ? "+" : ""}${dayTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="divide-y">
                        {dayTransactions.map((t) => {
                          const categoryInfo = getCategoryInfo(t.category, t.type)
                          const account = accounts.find((a) => a.id === t.accountId)
                          const CategoryIcon = categoryInfo.icon

                          return (
                            <div key={t.id} className="group flex items-center gap-3 p-3 hover:bg-muted/50">
                              <div
                                className={cn(
                                  "size-10 rounded-full flex items-center justify-center",
                                  t.type === "income" && "bg-green-100 dark:bg-green-900/30 text-green-600",
                                  t.type === "expense" && "bg-red-100 dark:bg-red-900/30 text-red-600",
                                  t.type === "transfer" && "bg-blue-100 dark:bg-blue-900/30 text-blue-600"
                                )}
                              >
                                {t.type === "transfer" ? <ArrowRightLeft className="size-5" /> : <CategoryIcon className="size-5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{t.description}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{categoryInfo.label}</span>
                                  <span>•</span>
                                  <span>{account?.name}</span>
                                  {t.isRecurring && (
                                    <>
                                      <span>•</span>
                                      <RefreshCw className="size-3" />
                                    </>
                                  )}
                                </div>
                              </div>
                              <span
                                className={cn(
                                  "font-semibold",
                                  t.type === "income" && "text-green-600",
                                  t.type === "expense" && "text-red-600",
                                  t.type === "transfer" && "text-blue-600"
                                )}
                              >
                                {t.type === "income" ? "+" : t.type === "expense" ? "-" : ""}$
                                {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 opacity-0 group-hover:opacity-100"
                                  >
                                    <MoreVertical className="size-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpenEdit(t)}>
                                    <Edit3 className="size-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDelete(t.id)}
                                  >
                                    <Trash2 className="size-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Category breakdown */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Expenses by Category</h2>
              </div>
              <div className="p-4 space-y-3">
                {expensesByCategory.map(({ category, amount, info }) => {
                  const percentage = monthExpenses > 0 ? (amount / monthExpenses) * 100 : 0
                  const InfoIcon = info.icon
                  return (
                    <div key={category}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-2">
                          <InfoIcon className="size-4 text-muted-foreground" />
                          {info.label}
                        </span>
                        <span className="font-medium">${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
                {expensesByCategory.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Budgets View */}
        <TabsContent value="budgets" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setIsBudgetDialogOpen(true)}>
              <Plus className="size-4 mr-2" />
              Add Budget
            </Button>
          </div>

          {budgetProgress.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <Target className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No budgets set</h3>
              <p className="text-sm text-muted-foreground">Create budgets to track your spending by category</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgetProgress.map((budget) => {
                const isOverBudget = budget.percentage >= 100
                const isWarning = budget.percentage >= 80 && budget.percentage < 100
                const BudgetIcon = budget.categoryInfo?.icon || Package

                return (
                  <div key={budget.id} className="rounded-lg border bg-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BudgetIcon className="size-6 text-muted-foreground" />
                        <div>
                          <p className="font-semibold">{budget.categoryInfo?.label}</p>
                          <p className="text-xs text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className={cn(isOverBudget && "text-red-600", isWarning && "text-yellow-600")}>
                          ${budget.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                        <span className="text-muted-foreground">
                          ${budget.limit.toLocaleString()} limit
                        </span>
                      </div>
                      <Progress
                        value={budget.percentage}
                        className={cn(
                          "h-3",
                          isOverBudget && "[&>div]:bg-red-500",
                          isWarning && "[&>div]:bg-yellow-500"
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${Math.max(0, budget.limit - budget.spent).toLocaleString()} remaining
                      </span>
                      {isOverBudget && <Badge variant="destructive">Over budget</Badge>}
                      {isWarning && <Badge className="bg-yellow-500">Almost there</Badge>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Reports View */}
        <TabsContent value="reports" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly trend */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Monthly Trend</h3>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => {
                  const month = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - (5 - i), 1)
                  const monthName = month.toLocaleDateString("en-US", { month: "short" })
                  const monthTx = transactions.filter((t) => {
                    const txMonth = t.date.getMonth()
                    const txYear = t.date.getFullYear()
                    return txMonth === month.getMonth() && txYear === month.getFullYear()
                  })
                  const income = monthTx.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
                  const expenses = monthTx.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
                  const maxAmount = Math.max(income, expenses, 1)
                  const isCurrent = month.getMonth() === selectedMonth.getMonth() && month.getFullYear() === selectedMonth.getFullYear()

                  return (
                    <div key={i} className={cn("flex items-center gap-4", isCurrent && "font-medium")}>
                      <span className="w-12 text-sm text-muted-foreground">{monthName}</span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 flex justify-end">
                          <div
                            className="h-6 bg-green-500 rounded-l"
                            style={{ width: `${(income / maxAmount) * 50}%` }}
                          />
                        </div>
                        <div className="flex-1">
                          <div
                            className="h-6 bg-red-500 rounded-r"
                            style={{ width: `${(expenses / maxAmount) * 50}%` }}
                          />
                        </div>
                      </div>
                      <span className={cn("w-24 text-right text-sm", (income - expenses) >= 0 ? "text-green-600" : "text-red-600")}>
                        {(income - expenses) >= 0 ? "+" : ""}${(income - expenses).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="size-3 rounded bg-green-500" />
                  Income
                </span>
                <span className="flex items-center gap-2">
                  <div className="size-3 rounded bg-red-500" />
                  Expenses
                </span>
              </div>
            </div>

            {/* Top expenses */}
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-semibold mb-4">Top Expenses This Month</h3>
              <div className="space-y-3">
                {monthTransactions
                  .filter((t) => t.type === "expense")
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((t, i) => {
                    const categoryInfo = getCategoryInfo(t.category, t.type)
                    const TopExpenseIcon = categoryInfo.icon
                    return (
                      <div key={t.id} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                        <TopExpenseIcon className="size-5 text-red-500" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{t.description}</p>
                          <p className="text-xs text-muted-foreground">{categoryInfo.label}</p>
                        </div>
                        <span className="font-semibold text-red-600">
                          ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    )
                  })}
                {monthTransactions.filter((t) => t.type === "expense").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No expenses this month</p>
                )}
              </div>
            </div>

            {/* Summary cards */}
            <div className="rounded-lg border bg-card p-4 lg:col-span-2">
              <h3 className="font-semibold mb-4">Monthly Summary</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${monthIncome.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthTransactions.filter((t) => t.type === "income").length} transactions
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                  <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${monthExpenses.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthTransactions.filter((t) => t.type === "expense").length} transactions
                  </p>
                </div>
                <div className={cn("text-center p-4 rounded-lg", monthNet >= 0 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-orange-50 dark:bg-orange-900/20")}>
                  <p className="text-sm text-muted-foreground mb-1">Net Savings</p>
                  <p className={cn("text-3xl font-bold", monthNet >= 0 ? "text-blue-600" : "text-orange-600")}>
                    {monthNet >= 0 ? "+" : ""}${monthNet.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {monthIncome > 0 ? `${Math.round((monthNet / monthIncome) * 100)}% savings rate` : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                {(["expense", "income", "transfer"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type, category: "" })}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all capitalize",
                      formData.type === type ? "border-primary bg-primary/10" : "hover:bg-muted"
                    )}
                  >
                    {type === "expense" && <TrendingDown className="size-4 text-red-500" />}
                    {type === "income" && <TrendingUp className="size-4 text-green-500" />}
                    {type === "transfer" && <ArrowRightLeft className="size-4 text-blue-500" />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
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
              <Label>Account</Label>
              <Select
                value={formData.accountId}
                onValueChange={(v) => setFormData({ ...formData, accountId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full" style={{ backgroundColor: a.color }} />
                        {a.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "transfer" && (
              <div className="flex flex-col gap-2">
                <Label>To Account</Label>
                <Select
                  value={formData.toAccountId}
                  onValueChange={(v) => setFormData({ ...formData, toAccountId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter((a) => a.id !== formData.accountId).map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ backgroundColor: a.color }} />
                          {a.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.type !== "transfer" && (
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === "income" ? incomeCategories : expenseCategories).map((cat) => {
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
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this for?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Recurring</Label>
                <p className="text-xs text-muted-foreground">Repeat this transaction</p>
              </div>
              <Switch
                checked={formData.isRecurring}
                onCheckedChange={(v) => setFormData({ ...formData, isRecurring: v })}
              />
            </div>

            {formData.isRecurring && (
              <Select
                value={formData.recurringInterval}
                onValueChange={(v) => setFormData({ ...formData, recurringInterval: v as Transaction["recurringInterval"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.amount || (formData.type !== "transfer" && !formData.category)}>
                {editingTransaction ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Budget Dialog */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={budgetFormData.category}
                onValueChange={(v) => setBudgetFormData({ ...budgetFormData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.filter((c) => !budgets.some((b) => b.category === c.id)).map((cat) => {
                    const BudgetCatIcon = cat.icon
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <BudgetCatIcon className="size-4" />
                          {cat.label}
                        </span>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="limit">Monthly Limit ($)</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                value={budgetFormData.limit}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, limit: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBudgetDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddBudget} disabled={!budgetFormData.category || !budgetFormData.limit}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Account</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountName">Name</Label>
              <Input
                id="accountName"
                value={accountFormData.name}
                onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                placeholder="Account name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={accountFormData.type}
                onValueChange={(v) => setAccountFormData({ ...accountFormData, type: v as Account["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="balance">Starting Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={accountFormData.balance}
                onChange={(e) => setAccountFormData({ ...accountFormData, balance: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {accountColors.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setAccountFormData({ ...accountFormData, color: c.hex })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      accountFormData.color === c.hex ? "border-foreground" : "border-transparent"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddAccount} disabled={!accountFormData.name.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
