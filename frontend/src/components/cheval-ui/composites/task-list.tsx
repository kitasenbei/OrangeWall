import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Check, Circle, CircleCheck, CircleDot, CirclePause, GripVertical, Pencil, Plus, Trash2 } from "lucide-react"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface StatusConfig {
  id: string
  label: string
  color: string
  icon?: typeof Circle
}

export interface Task {
  id: string
  title: string
  status: string
}

const defaultStatuses: StatusConfig[] = [
  { id: "pending", label: "Pending", color: "text-muted-foreground", icon: Circle },
  { id: "in_progress", label: "In Progress", color: "text-blue-500", icon: CircleDot },
  { id: "completed", label: "Completed", color: "text-green-500", icon: CircleCheck },
  { id: "on_hold", label: "On Hold", color: "text-yellow-500", icon: CirclePause },
]

const colorOptions = [
  { value: "text-muted-foreground", label: "Gray" },
  { value: "text-blue-500", label: "Blue" },
  { value: "text-green-500", label: "Green" },
  { value: "text-yellow-500", label: "Yellow" },
  { value: "text-red-500", label: "Red" },
  { value: "text-purple-500", label: "Purple" },
  { value: "text-pink-500", label: "Pink" },
  { value: "text-orange-500", label: "Orange" },
]

interface TaskListProps {
  tasks: Task[]
  statuses?: StatusConfig[]
  onStatusChange?: (id: string, status: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onAddTask?: (status: string) => void
  onAddStatus?: (status: StatusConfig) => void
  className?: string
}

interface TaskItemProps {
  task: Task
  statuses: StatusConfig[]
  onStatusChange?: (id: string, status: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  onAddStatus?: (status: StatusConfig) => void
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

function getStatusConfig(statuses: StatusConfig[], statusId: string): StatusConfig {
  return statuses.find((s) => s.id === statusId) || {
    id: statusId,
    label: statusId,
    color: "text-muted-foreground",
    icon: Circle,
  }
}

function InlineAddStatus({
  onAdd,
  onCancel,
}: {
  onAdd: (status: StatusConfig) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState("")
  const [color, setColor] = useState("text-muted-foreground")
  const [colorOpen, setColorOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    if (!label.trim()) return
    const id = label.toLowerCase().replace(/\s+/g, "_")
    onAdd({ id, label: label.trim(), color, icon: Circle })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit()
    } else if (e.key === "Escape") {
      onCancel()
    }
  }

  return (
    <div className="p-2 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-1">
        <Popover open={colorOpen} onOpenChange={setColorOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex items-center justify-center px-2 py-1 rounded border bg-background hover:bg-accent shrink-0"
            >
              <Circle className={cn("size-4 fill-current", color)} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[130px] p-1" align="start">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setColor(opt.value)
                  setColorOpen(false)
                }}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-accent",
                  color === opt.value && "bg-accent"
                )}
              >
                <Circle className={cn("size-4 fill-current", opt.value)} />
                <span>{opt.label}</span>
              </button>
            ))}
          </PopoverContent>
        </Popover>
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Status name..."
          className="flex-1 min-w-0 px-2 py-1 text-sm rounded border bg-background outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!label.trim()}
          className="flex items-center justify-center px-2 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50 shrink-0"
        >
          <Check className="size-4" />
        </button>
      </div>
    </div>
  )
}

function TaskItemContent({ task, statuses, onStatusChange, onEdit, onDelete, onAddStatus, isDragging, dragHandleProps }: TaskItemProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const config = getStatusConfig(statuses, task.status)
  const Icon = config.icon || Circle

  const handleStatusSelect = (status: string) => {
    onStatusChange?.(task.id, status)
  }

  const handleAddStatus = (status: StatusConfig) => {
    onAddStatus?.(status)
    onStatusChange?.(task.id, status.id)
    setShowAddForm(false)
    setStatusDropdownOpen(false)
  }

  return (
    <div
      className={cn(
        "flex w-full items-center gap-2 rounded-md border px-3 py-2 transition-colors bg-background",
        "hover:bg-accent",
        isDragging && "opacity-50"
      )}
    >
      <DropdownMenu open={statusDropdownOpen} onOpenChange={(open) => {
        setStatusDropdownOpen(open)
        if (!open) setShowAddForm(false)
      }}>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "shrink-0 transition-colors hover:scale-110",
              config.color
            )}
          >
            <Icon className="size-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="min-w-[180px]"
          onCloseAutoFocus={(e) => showAddForm && e.preventDefault()}
          onPointerDownOutside={(e) => showAddForm && e.preventDefault()}
          onInteractOutside={(e) => showAddForm && e.preventDefault()}
          onEscapeKeyDown={(e) => {
            if (showAddForm) {
              e.preventDefault()
              setShowAddForm(false)
            }
          }}
        >
          {statuses.map((status) => {
            const StatusIcon = status.icon || Circle
            return (
              <DropdownMenuItem
                key={status.id}
                onClick={() => handleStatusSelect(status.id)}
                className="gap-2"
              >
                <StatusIcon className={cn("size-4", status.color)} />
                <span>{status.label}</span>
              </DropdownMenuItem>
            )
          })}
          {onAddStatus && (
            <>
              <DropdownMenuSeparator />
              {!showAddForm ? (
                <div
                  role="menuitem"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowAddForm(true)
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm cursor-pointer hover:bg-accent outline-none"
                >
                  <Plus className="size-4" />
                  <span>Add status...</span>
                </div>
              ) : (
                <InlineAddStatus
                  onAdd={handleAddStatus}
                  onCancel={() => setShowAddForm(false)}
                />
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <span
            className={cn(
              "flex-1 text-left text-sm",
              task.status === "completed" && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onEdit?.(task.id)} className="gap-2">
            <Pencil className="size-4" />
            <span>Edit</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete?.(task.id)} className="gap-2 text-destructive focus:text-destructive">
            <Trash2 className="size-4" />
            <span>Delete</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <div {...dragHandleProps} className="shrink-0 cursor-grab touch-none">
        <GripVertical className="size-4 text-muted-foreground" />
      </div>
    </div>
  )
}

function DraggableTaskItem({ task, statuses, onStatusChange, onEdit, onDelete, onAddStatus }: TaskItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  })

  return (
    <div ref={setNodeRef}>
      <TaskItemContent
        task={task}
        statuses={statuses}
        onStatusChange={onStatusChange}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddStatus={onAddStatus}
        isDragging={isDragging}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  )
}

function DroppableStatusGroup({
  statusId,
  children,
  isOver,
}: {
  statusId: string
  children: React.ReactNode
  isOver: boolean
}) {
  const { setNodeRef } = useDroppable({
    id: statusId,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col gap-2 min-h-[40px] rounded-md transition-colors p-1 -m-1",
        isOver && "bg-accent/50"
      )}
    >
      {children}
    </div>
  )
}

function groupTasksByStatus(tasks: Task[], statuses: StatusConfig[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>()

  // Initialize with configured statuses in order
  for (const status of statuses) {
    grouped.set(status.id, [])
  }

  // Group tasks
  for (const task of tasks) {
    const existing = grouped.get(task.status)
    if (existing) {
      existing.push(task)
    } else {
      // Handle tasks with unknown status
      grouped.set(task.status, [task])
    }
  }

  return grouped
}

export function TaskList({
  tasks,
  statuses = defaultStatuses,
  onStatusChange,
  onEdit,
  onDelete,
  onAddTask,
  onAddStatus,
  className,
}: TaskListProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task
    setActiveTask(task)
  }

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)
    setOverId(null)

    if (over && active.id !== over.id) {
      const taskId = active.id as string
      const newStatus = over.id as string

      // Check if dropping over a valid status
      if (statuses.some((s) => s.id === newStatus)) {
        onStatusChange?.(taskId, newStatus)
      }
    }
  }

  if (tasks.length === 0) {
    return (
      <div className={cn("py-8 text-center text-muted-foreground", className)}>
        No tasks
      </div>
    )
  }

  const groupedTasks = groupTasksByStatus(tasks, statuses)

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("flex flex-col gap-6", className)}>
        {Array.from(groupedTasks.entries()).map(([statusId, statusTasks]) => {
          if (statusTasks.length === 0 && overId !== statusId) return null

          const config = getStatusConfig(statuses, statusId)
          const Icon = config.icon || Circle

          return (
            <div key={statusId} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Icon className={cn("size-4", config.color)} />
                <span>{config.label}</span>
                <span className="text-muted-foreground">({statusTasks.length})</span>
                {onAddTask && (
                  <button
                    type="button"
                    onClick={() => onAddTask(statusId)}
                    className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="size-4" />
                  </button>
                )}
              </div>
              <DroppableStatusGroup statusId={statusId} isOver={overId === statusId}>
                {statusTasks.map((task) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    statuses={statuses}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddStatus={onAddStatus}
                  />
                ))}
                {statusTasks.length === 0 && overId === statusId && (
                  <div className="h-10 rounded-md border-2 border-dashed border-muted-foreground/25" />
                )}
              </DroppableStatusGroup>
            </div>
          )
        })}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="opacity-80">
            <TaskItemContent
              task={activeTask}
              statuses={statuses}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}

export { defaultStatuses }
