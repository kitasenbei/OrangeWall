import { useState } from "react"
import {
  Plus, MoreHorizontal, Trash2, Edit2, Calendar, Flag, Search, X, Check,
  ChevronDown, ChevronRight, Clock, AlertCircle, CheckCircle2, Circle,
  Pause, ListTodo, Filter, SortAsc, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTasks, type Task, type Subtask } from "@/hooks"

// Config
const statusConfig = {
  pending: { label: "To Do", icon: Circle, color: "text-gray-500", bg: "bg-gray-100" },
  in_progress: { label: "In Progress", icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  on_hold: { label: "On Hold", icon: Pause, color: "text-orange-600", bg: "bg-orange-100" },
}

const priorityConfig = {
  low: { label: "Low", color: "text-gray-500", bg: "bg-gray-100", ring: "ring-gray-300" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100", ring: "ring-yellow-300" },
  high: { label: "High", color: "text-orange-600", bg: "bg-orange-100", ring: "ring-orange-300" },
  urgent: { label: "Urgent", color: "text-red-600", bg: "bg-red-100", ring: "ring-red-300" },
}

const tagColors: Record<string, string> = {
  work: "bg-blue-500",
  personal: "bg-green-500",
  health: "bg-pink-500",
  learning: "bg-purple-500",
  finance: "bg-yellow-500",
  home: "bg-orange-500",
  project: "bg-cyan-500",
}

const availableTags = ["work", "personal", "health", "learning", "finance", "home", "project"]

// Helper functions
function getDueDateStatus(dueDate?: string | null): "overdue" | "today" | "soon" | "ok" | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate())
  const diffDays = Math.ceil((dueDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "overdue"
  if (diffDays === 0) return "today"
  if (diffDays <= 3) return "soon"
  return "ok"
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function TasksPage() {
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">("dueDate")
  const [showCompleted, setShowCompleted] = useState(true)
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  // Task dialog
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "pending" as Task["status"],
    priority: "medium" as Task["priority"],
    dueDate: "",
    tags: [] as string[],
    subtasks: [] as Subtask[],
  })
  const [newSubtask, setNewSubtask] = useState("")

  // Open dialog for new/edit task
  const openTaskDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task)
      setTaskFormData({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || "",
        tags: task.tags,
        subtasks: task.subtasks,
      })
    } else {
      setEditingTask(null)
      setTaskFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        dueDate: "",
        tags: [],
        subtasks: [],
      })
    }
    setIsTaskDialogOpen(true)
  }

  // Save task
  const handleSaveTask = async () => {
    if (!taskFormData.title.trim()) return

    try {
      if (editingTask) {
        await updateTask(editingTask.id, {
          title: taskFormData.title,
          description: taskFormData.description,
          status: taskFormData.status,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate || null,
          tags: taskFormData.tags,
          subtasks: taskFormData.subtasks,
        })
      } else {
        await createTask({
          title: taskFormData.title,
          description: taskFormData.description,
          status: taskFormData.status,
          priority: taskFormData.priority,
          dueDate: taskFormData.dueDate || null,
          tags: taskFormData.tags,
          subtasks: taskFormData.subtasks,
        })
      }
      setIsTaskDialogOpen(false)
      setEditingTask(null)
    } catch (err) {
      console.error("Failed to save task:", err)
    }
  }

  // Delete task
  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id)
    } catch (err) {
      console.error("Failed to delete task:", err)
    }
  }

  // Toggle task status quickly
  const handleQuickComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      await updateTask(id, {
        status: task.status === "completed" ? "pending" : "completed"
      })
    } catch (err) {
      console.error("Failed to toggle task:", err)
    }
  }

  // Toggle subtask
  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    try {
      const updatedSubtasks = task.subtasks.map((s) =>
        s.id === subtaskId ? { ...s, completed: !s.completed } : s
      )
      await updateTask(taskId, { subtasks: updatedSubtasks })
    } catch (err) {
      console.error("Failed to toggle subtask:", err)
    }
  }

  // Add subtask in dialog
  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return
    setTaskFormData((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: crypto.randomUUID(), title: newSubtask, completed: false }],
    }))
    setNewSubtask("")
  }

  // Delete subtask in dialog
  const handleDeleteSubtask = (id: string) => {
    setTaskFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((s) => s.id !== id),
    }))
  }

  // Toggle subtask in dialog
  const handleToggleDialogSubtask = (id: string) => {
    setTaskFormData((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((s) =>
        s.id === id ? { ...s, completed: !s.completed } : s
      ),
    }))
  }

  // Toggle expanded task
  const toggleExpanded = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter((task) => {
      if (!showCompleted && task.status === "completed") return false
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterStatus && task.status !== filterStatus) return false
      if (filterPriority && task.priority !== filterPriority) return false
      if (filterTag && !task.tags.includes(filterTag)) return false
      return true
    })
    .sort((a, b) => {
      // Completed tasks always at bottom
      if (a.status === "completed" && b.status !== "completed") return 1
      if (a.status !== "completed" && b.status === "completed") return -1

      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      }
      if (sortBy === "priority") {
        const order = { urgent: 0, high: 1, medium: 2, low: 3 }
        return order[a.priority] - order[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  // Stats
  const stats = {
    total: tasks.filter((t) => t.status !== "completed").length,
    overdue: tasks.filter((t) => t.status !== "completed" && getDueDateStatus(t.dueDate) === "overdue").length,
    dueToday: tasks.filter((t) => t.status !== "completed" && getDueDateStatus(t.dueDate) === "today").length,
    completed: tasks.filter((t) => t.status === "completed").length,
  }

  const hasActiveFilters = filterStatus || filterPriority || filterTag

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading tasks...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
            <p className="text-sm text-muted-foreground">Manage your tasks and to-dos</p>
          </div>
        </div>
        <Button onClick={() => openTaskDialog()}>
          <Plus className="size-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ListTodo className="size-4" />
            <span className="text-sm">Open Tasks</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle className="size-4" />
            <span className="text-sm">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Clock className="size-4" />
            <span className="text-sm">Due Today</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.dueToday}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CheckCircle2 className="size-4" />
            <span className="text-sm">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filterStatus || "all"} onValueChange={(v) => setFilterStatus(v === "all" ? null : v)}>
          <SelectTrigger className="w-40">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority || "all"} onValueChange={(v) => setFilterPriority(v === "all" ? null : v)}>
          <SelectTrigger className="w-40">
            <Flag className="size-4 mr-2" />
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterTag || "all"} onValueChange={(v) => setFilterTag(v === "all" ? null : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {availableTags.map((tag) => (
              <SelectItem key={tag} value={tag} className="capitalize">{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-40">
            <SortAsc className="size-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due Date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="createdAt">Created</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant={showCompleted ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          <CheckCircle2 className="size-4 mr-1" />
          {showCompleted ? "Hide Done" : "Show Done"}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterStatus(null)
              setFilterPriority(null)
              setFilterTag(null)
            }}
          >
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <OrangeLogo className="size-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
            <Button variant="link" onClick={() => openTaskDialog()}>Create your first task</Button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const dueDateStatus = getDueDateStatus(task.dueDate)
            const StatusIcon = statusConfig[task.status].icon
            const completedSubtasks = task.subtasks.filter((s) => s.completed).length
            const isExpanded = expandedTasks.has(task.id)

            return (
              <div
                key={task.id}
                className={cn(
                  "group rounded-lg border bg-card p-4 transition-all hover:shadow-md",
                  task.status === "completed" && "opacity-60",
                  task.priority === "urgent" && task.status !== "completed" && "border-l-4 border-l-red-500"
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleQuickComplete(task.id)}
                    className={cn(
                      "mt-0.5 size-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      task.status === "completed"
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-muted-foreground hover:border-green-500"
                    )}
                  >
                    {task.status === "completed" && <Check className="size-3" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {task.subtasks.length > 0 && (
                            <button
                              onClick={() => toggleExpanded(task.id)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {isExpanded ? (
                                <ChevronDown className="size-4" />
                              ) : (
                                <ChevronRight className="size-4" />
                              )}
                            </button>
                          )}
                          <h3 className={cn(
                            "font-medium",
                            task.status === "completed" && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openTaskDialog(task)}>
                            <Edit2 className="size-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="size-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Status */}
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                        statusConfig[task.status].bg,
                        statusConfig[task.status].color
                      )}>
                        <StatusIcon className="size-3" />
                        {statusConfig[task.status].label}
                      </span>

                      {/* Priority */}
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                        priorityConfig[task.priority].bg,
                        priorityConfig[task.priority].color
                      )}>
                        <Flag className="size-3" />
                        {priorityConfig[task.priority].label}
                      </span>

                      {/* Due date */}
                      {task.dueDate && task.status !== "completed" && (
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                          dueDateStatus === "overdue" && "bg-red-100 text-red-600",
                          dueDateStatus === "today" && "bg-orange-100 text-orange-600",
                          dueDateStatus === "soon" && "bg-yellow-100 text-yellow-600",
                          dueDateStatus === "ok" && "bg-muted text-muted-foreground"
                        )}>
                          <Calendar className="size-3" />
                          {dueDateStatus === "overdue" && "Overdue: "}
                          {dueDateStatus === "today" && "Today"}
                          {dueDateStatus !== "today" && formatDate(task.dueDate)}
                        </span>
                      )}

                      {/* Subtasks progress */}
                      {task.subtasks.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                          <Check className="size-3" />
                          {completedSubtasks}/{task.subtasks.length}
                        </span>
                      )}

                      {/* Tags */}
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full text-white capitalize",
                            tagColors[tag] || "bg-gray-500"
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Subtasks (expanded) */}
                    {isExpanded && task.subtasks.length > 0 && (
                      <div className="mt-3 pl-6 border-l-2 border-muted space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask.id} className="flex items-center gap-2">
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={() => handleToggleSubtask(task.id, subtask.id)}
                            />
                            <span className={cn(
                              "text-sm",
                              subtask.completed && "line-through text-muted-foreground"
                            )}>
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                placeholder="What needs to be done?"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Add more details..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={taskFormData.status}
                  onValueChange={(v) => setTaskFormData({ ...taskFormData, status: v as Task["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Priority</Label>
                <Select
                  value={taskFormData.priority}
                  onValueChange={(v) => setTaskFormData({ ...taskFormData, priority: v as Task["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={taskFormData.dueDate}
                onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = taskFormData.tags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() =>
                        setTaskFormData({
                          ...taskFormData,
                          tags: isSelected
                            ? taskFormData.tags.filter((t) => t !== tag)
                            : [...taskFormData.tags, tag],
                        })
                      }
                      className={cn(
                        "text-xs px-2 py-1 rounded-full capitalize transition-all",
                        isSelected
                          ? cn(tagColors[tag], "text-white")
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Subtasks */}
            <div className="flex flex-col gap-2">
              <Label>Subtasks</Label>
              <div className="flex flex-col gap-2">
                {taskFormData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleDialogSubtask(subtask.id)}
                    />
                    <span className={cn(
                      "flex-1 text-sm",
                      subtask.completed && "line-through text-muted-foreground"
                    )}>
                      {subtask.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddSubtask}>
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} disabled={!taskFormData.title.trim()}>
                {editingTask ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
