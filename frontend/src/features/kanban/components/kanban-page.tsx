import { useState } from "react"
import {
  Plus, MoreHorizontal, Trash2, GripVertical, ArrowLeft, Folder, Edit2, Calendar,
  Flag, Tag, Search, X, Check, Clock, MessageSquare, Copy, Archive,
  AlertTriangle, Image, Send
} from "lucide-react"

// Note: This page uses local state due to its complex data model (projects with banners,
// cards with checklists, comments, labels, etc.). The useKanban hook will need
// extension to support all these features for full API integration.
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Types
interface Comment {
  id: string
  content: string
  createdAt: Date
}

interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

interface Card {
  id: string
  title: string
  description?: string
  labels: string[]
  coverImage?: string
  priority?: "low" | "medium" | "high"
  startDate?: string
  dueDate?: string
  checklist?: ChecklistItem[]
  estimatedHours?: number
  loggedHours?: number
  comments?: Comment[]
  archived?: boolean
  createdAt: Date
}

interface Column {
  id: string
  title: string
  cards: Card[]
  wipLimit?: number
}

interface Project {
  id: string
  name: string
  color: string
  banner?: string
  columns: Column[]
  createdAt: Date
}

// Config
const labelConfig: Record<string, { label: string; color: string }> = {
  feature: { label: "Feature", color: "bg-blue-500" },
  bug: { label: "Bug", color: "bg-red-500" },
  urgent: { label: "Urgent", color: "bg-orange-500" },
  design: { label: "Design", color: "bg-purple-500" },
  research: { label: "Research", color: "bg-green-500" },
  docs: { label: "Docs", color: "bg-cyan-500" },
  test: { label: "Test", color: "bg-yellow-500" },
}

const priorityConfig = {
  low: { label: "Low", color: "text-gray-500", bg: "bg-gray-100" },
  medium: { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" },
  high: { label: "High", color: "text-red-600", bg: "bg-red-100" },
}

const projectColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

const defaultColumns: Column[] = [
  { id: "backlog", title: "Backlog", cards: [], wipLimit: undefined },
  { id: "todo", title: "To Do", cards: [], wipLimit: 5 },
  { id: "in-progress", title: "In Progress", cards: [], wipLimit: 3 },
  { id: "review", title: "Review", cards: [], wipLimit: 2 },
  { id: "done", title: "Done", cards: [], wipLimit: undefined },
]

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Orangewall MVP",
    color: "#3b82f6",
    banner: "/background.jpg",
    columns: [
      {
        id: "backlog",
        title: "Backlog",
        cards: [
          {
            id: "c1",
            title: "User authentication flow",
            description: "Implement OAuth and email/password auth",
            labels: ["feature"],
            priority: "high",
            dueDate: "2025-02-15",
            estimatedHours: 16,
            loggedHours: 4,
            createdAt: new Date(),
          },
          {
            id: "c2",
            title: "Payment integration",
            labels: ["feature", "urgent"],
            priority: "high",
            estimatedHours: 24,
            createdAt: new Date(),
          },
        ],
      },
      {
        id: "todo",
        title: "To Do",
        wipLimit: 5,
        cards: [
          {
            id: "c3",
            title: "API rate limiting",
            description: "Add rate limiting to prevent abuse",
            labels: ["feature"],
            priority: "medium",
            dueDate: "2025-01-20",
            startDate: "2025-01-15",
            estimatedHours: 8,
            createdAt: new Date(),
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        wipLimit: 3,
        cards: [
          {
            id: "c4",
            title: "Dashboard analytics",
            labels: ["feature"],
            priority: "medium",
            estimatedHours: 20,
            loggedHours: 12,
            checklist: [
              { id: "cl1", text: "Add chart components", done: true },
              { id: "cl2", text: "Connect to data source", done: false },
              { id: "cl3", text: "Add filters", done: false },
            ],
            comments: [
              { id: "cm1", content: "Started working on the chart components", createdAt: new Date(Date.now() - 86400000) },
              { id: "cm2", content: "Looking good!", createdAt: new Date() },
            ],
            createdAt: new Date(),
          },
        ]
      },
      { id: "review", title: "Review", wipLimit: 2, cards: [] },
      { id: "done", title: "Done", cards: [
        { id: "c5", title: "Project setup", labels: ["feature"], createdAt: new Date() },
      ] },
    ],
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Marketing Website",
    color: "#22c55e",
    banner: "/bg.png",
    columns: [
      { id: "backlog", title: "Backlog", cards: [
        { id: "c6", title: "Landing page design", labels: ["design"], priority: "high", coverImage: "/placeholder-1.jpg", createdAt: new Date() },
        { id: "c7", title: "SEO optimization", labels: ["feature"], priority: "low", createdAt: new Date() },
      ] },
      { id: "todo", title: "To Do", wipLimit: 5, cards: [] },
      { id: "in-progress", title: "In Progress", wipLimit: 3, cards: [] },
      { id: "review", title: "Review", wipLimit: 2, cards: [] },
      { id: "done", title: "Done", cards: [] },
    ],
    createdAt: new Date(),
  },
]

// Helper functions
function getDueDateStatus(dueDate: string, startDate?: string): "overdue" | "soon" | "ok" | "not-started" | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (startDate) {
    const start = new Date(startDate)
    if (now < start) return "not-started"
  }

  if (diffDays < 0) return "overdue"
  if (diffDays <= 3) return "soon"
  return "ok"
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function KanbanPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [newCardColumn, setNewCardColumn] = useState<string | null>(null)
  const [newCardTitle, setNewCardTitle] = useState("")
  const [draggedCard, setDraggedCard] = useState<{ cardId: string; fromColumn: string } | null>(null)
  const [dragOverCard, setDragOverCard] = useState<{ cardId: string; position: "before" | "after" } | null>(null)
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLabel, setFilterLabel] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  // Project dialog
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectFormData, setProjectFormData] = useState({ name: "", color: projectColors[0], banner: "" })

  // Card dialog
  const [isCardDialogOpen, setIsCardDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<{ card: Card; columnId: string } | null>(null)
  const [cardFormData, setCardFormData] = useState<{
    title: string
    description: string
    labels: string[]
    priority: string
    startDate: string
    dueDate: string
    checklist: ChecklistItem[]
    estimatedHours: string
    loggedHours: string
    coverImage: string
    comments: Comment[]
  }>({
    title: "",
    description: "",
    labels: [],
    priority: "",
    startDate: "",
    dueDate: "",
    checklist: [],
    estimatedHours: "",
    loggedHours: "",
    coverImage: "",
    comments: [],
  })
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [newComment, setNewComment] = useState("")

  // Column dialog
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<Column | null>(null)
  const [columnFormData, setColumnFormData] = useState({ title: "", wipLimit: "" })

  const activeProject = projects.find((p) => p.id === activeProjectId)

  // Project CRUD
  const openProjectDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project)
      setProjectFormData({ name: project.name, color: project.color, banner: project.banner || "" })
    } else {
      setEditingProject(null)
      setProjectFormData({ name: "", color: projectColors[0], banner: "" })
    }
    setIsProjectDialogOpen(true)
  }

  const handleSaveProject = () => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === editingProject.id
            ? { ...p, name: projectFormData.name, color: projectFormData.color, banner: projectFormData.banner || undefined }
            : p
        )
      )
    } else {
      const newProject: Project = {
        id: crypto.randomUUID(),
        name: projectFormData.name,
        color: projectFormData.color,
        banner: projectFormData.banner || undefined,
        columns: defaultColumns.map((col) => ({ ...col, id: crypto.randomUUID(), cards: [] })),
        createdAt: new Date(),
      }
      setProjects((prev) => [...prev, newProject])
      setActiveProjectId(newProject.id)
    }
    setIsProjectDialogOpen(false)
  }

  const handleDeleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id))
    if (activeProjectId === id) setActiveProjectId(null)
  }

  // Card CRUD
  const openCardDialog = (card: Card, columnId: string) => {
    setEditingCard({ card, columnId })
    setCardFormData({
      title: card.title,
      description: card.description || "",
      labels: card.labels,
      priority: card.priority || "",
      startDate: card.startDate || "",
      dueDate: card.dueDate || "",
      checklist: card.checklist || [],
      estimatedHours: card.estimatedHours?.toString() || "",
      loggedHours: card.loggedHours?.toString() || "",
      coverImage: card.coverImage || "",
      comments: card.comments || [],
    })
    setIsCardDialogOpen(true)
  }

  const handleSaveCard = () => {
    if (!editingCard || !activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === editingCard.columnId
                  ? {
                      ...col,
                      cards: col.cards.map((c) =>
                        c.id === editingCard.card.id
                          ? {
                              ...c,
                              title: cardFormData.title,
                              description: cardFormData.description || undefined,
                              labels: cardFormData.labels,
                              priority: cardFormData.priority as Card["priority"] || undefined,
                              startDate: cardFormData.startDate || undefined,
                              dueDate: cardFormData.dueDate || undefined,
                              checklist: cardFormData.checklist.length > 0 ? cardFormData.checklist : undefined,
                              estimatedHours: cardFormData.estimatedHours ? parseFloat(cardFormData.estimatedHours) : undefined,
                              loggedHours: cardFormData.loggedHours ? parseFloat(cardFormData.loggedHours) : undefined,
                              coverImage: cardFormData.coverImage || undefined,
                              comments: cardFormData.comments.length > 0 ? cardFormData.comments : undefined,
                            }
                          : c
                      ),
                    }
                  : col
              ),
            }
          : project
      )
    )
    setIsCardDialogOpen(false)
    setEditingCard(null)
  }

  const handleAddCard = (columnId: string) => {
    if (!newCardTitle.trim() || !activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: [...col.cards, { id: crypto.randomUUID(), title: newCardTitle, labels: [], createdAt: new Date() }] }
                  : col
              ),
            }
          : project
      )
    )
    setNewCardTitle("")
    setNewCardColumn(null)
  }

  const handleDeleteCard = (columnId: string, cardId: string) => {
    if (!activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
                  : col
              ),
            }
          : project
      )
    )
  }

  const handleArchiveCard = (columnId: string, cardId: string) => {
    if (!activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      cards: col.cards.map((c) =>
                        c.id === cardId ? { ...c, archived: !c.archived } : c
                      )
                    }
                  : col
              ),
            }
          : project
      )
    )
  }

  const handleDuplicateCard = (columnId: string, card: Card) => {
    if (!activeProjectId) return

    const duplicatedCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      title: `${card.title} (copy)`,
      comments: [],
      createdAt: new Date(),
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: [...col.cards, duplicatedCard] }
                  : col
              ),
            }
          : project
      )
    )
  }

  // Comments
  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: crypto.randomUUID(),
      content: newComment,
      createdAt: new Date(),
    }
    setCardFormData((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }))
    setNewComment("")
  }

  // Checklist
  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    setCardFormData((prev) => ({
      ...prev,
      checklist: [...prev.checklist, { id: crypto.randomUUID(), text: newChecklistItem, done: false }],
    }))
    setNewChecklistItem("")
  }

  const toggleChecklistItem = (itemId: string) => {
    setCardFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    }))
  }

  const deleteChecklistItem = (itemId: string) => {
    setCardFormData((prev) => ({
      ...prev,
      checklist: prev.checklist.filter((item) => item.id !== itemId),
    }))
  }

  // Column CRUD
  const openColumnDialog = (column?: Column) => {
    if (column) {
      setEditingColumn(column)
      setColumnFormData({ title: column.title, wipLimit: column.wipLimit?.toString() || "" })
    } else {
      setEditingColumn(null)
      setColumnFormData({ title: "", wipLimit: "" })
    }
    setIsColumnDialogOpen(true)
  }

  const handleSaveColumn = () => {
    if (!columnFormData.title.trim() || !activeProjectId) return

    if (editingColumn) {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                columns: project.columns.map((col) =>
                  col.id === editingColumn.id
                    ? { ...col, title: columnFormData.title, wipLimit: columnFormData.wipLimit ? parseInt(columnFormData.wipLimit) : undefined }
                    : col
                ),
              }
            : project
        )
      )
    } else {
      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProjectId
            ? {
                ...project,
                columns: [...project.columns, {
                  id: crypto.randomUUID(),
                  title: columnFormData.title,
                  cards: [],
                  wipLimit: columnFormData.wipLimit ? parseInt(columnFormData.wipLimit) : undefined,
                }],
              }
            : project
        )
      )
    }
    setIsColumnDialogOpen(false)
    setEditingColumn(null)
    setColumnFormData({ title: "", wipLimit: "" })
  }

  const handleDeleteColumn = (columnId: string) => {
    if (!activeProjectId) return

    setProjects((prev) =>
      prev.map((project) =>
        project.id === activeProjectId
          ? { ...project, columns: project.columns.filter((col) => col.id !== columnId) }
          : project
      )
    )
  }

  // Drag and drop - Cards
  const handleCardDragStart = (e: React.DragEvent, cardId: string, fromColumn: string) => {
    e.dataTransfer.effectAllowed = "move"
    setDraggedCard({ cardId, fromColumn })
    setDraggedColumn(null)
  }

  const handleCardDragOver = (e: React.DragEvent, cardId: string) => {
    e.preventDefault()
    if (!draggedCard || draggedCard.cardId === cardId) return

    const rect = e.currentTarget.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    const position = e.clientY < midY ? "before" : "after"
    setDragOverCard({ cardId, position })
  }

  const handleCardDragLeave = () => {
    setDragOverCard(null)
  }

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleCardDrop = (toColumn: string, targetCardId?: string) => {
    if (!draggedCard || !activeProjectId) {
      resetDragState()
      return
    }

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== activeProjectId) return project

        const fromCol = project.columns.find((c) => c.id === draggedCard.fromColumn)
        const card = fromCol?.cards.find((c) => c.id === draggedCard.cardId)
        if (!card) return project

        return {
          ...project,
          columns: project.columns.map((col) => {
            let cards = col.id === draggedCard.fromColumn
              ? col.cards.filter((c) => c.id !== draggedCard.cardId)
              : [...col.cards]

            if (col.id === toColumn) {
              if (targetCardId && dragOverCard) {
                const targetIndex = cards.findIndex((c) => c.id === targetCardId)
                if (targetIndex !== -1) {
                  const insertIndex = dragOverCard.position === "before" ? targetIndex : targetIndex + 1
                  cards.splice(insertIndex, 0, card)
                } else {
                  cards.push(card)
                }
              } else {
                cards.push(card)
              }
            }

            return { ...col, cards }
          }),
        }
      })
    )
    resetDragState()
  }

  // Drag and drop - Columns
  const handleColumnDragStart = (e: React.DragEvent, columnId: string) => {
    e.dataTransfer.effectAllowed = "move"
    setDraggedColumn(columnId)
    setDraggedCard(null)
  }

  const handleColumnDragOverColumn = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (!draggedColumn || draggedColumn === columnId) return
    setDragOverColumn(columnId)
  }

  const handleColumnDrop = () => {
    if (!draggedColumn || !dragOverColumn || !activeProjectId || draggedColumn === dragOverColumn) {
      resetDragState()
      return
    }

    setProjects((prev) =>
      prev.map((project) => {
        if (project.id !== activeProjectId) return project

        const columns = [...project.columns]
        const fromIndex = columns.findIndex((c) => c.id === draggedColumn)
        const toIndex = columns.findIndex((c) => c.id === dragOverColumn)

        if (fromIndex === -1 || toIndex === -1) return project

        const [movedColumn] = columns.splice(fromIndex, 1)
        columns.splice(toIndex, 0, movedColumn)

        return { ...project, columns }
      })
    )
    resetDragState()
  }

  const resetDragState = () => {
    setDraggedCard(null)
    setDragOverCard(null)
    setDraggedColumn(null)
    setDragOverColumn(null)
  }

  // Filter cards
  const filterCards = (cards: Card[]) => {
    return cards.filter((card) => {
      if (!showArchived && card.archived) return false
      if (showArchived && !card.archived) return false
      if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      if (filterLabel && !card.labels.includes(filterLabel)) return false
      if (filterPriority && card.priority !== filterPriority) return false
      return true
    })
  }

  const hasActiveFilters = searchQuery || filterLabel || filterPriority

  // Project List View
  if (!activeProject) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <OrangeLogo className="size-8" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Kanban Boards</h1>
              <p className="text-sm text-muted-foreground">Manage your projects visually</p>
            </div>
          </div>
          <Button onClick={() => openProjectDialog()}>
            <Plus className="size-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const totalCards = project.columns.reduce((acc, col) => acc + col.cards.filter(c => !c.archived).length, 0)
            const doneCards = project.columns.find((c) => c.title === "Done")?.cards.filter(c => !c.archived).length || 0

            return (
              <div
                key={project.id}
                className="group rounded-lg border bg-card p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setActiveProjectId(project.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${project.color}20` }}
                    >
                      <Folder className="size-5" style={{ color: project.color }} />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {totalCards} cards • {doneCards} done
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openProjectDialog(project) }}>
                        <Edit2 className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-1 mt-3">
                  {project.columns.map((col) => (
                    <div
                      key={col.id}
                      className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden"
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: project.color,
                          width: col.cards.filter(c => !c.archived).length > 0 ? "100%" : "0%",
                          opacity: col.cards.filter(c => !c.archived).length > 0 ? 0.3 + (col.cards.filter(c => !c.archived).length * 0.1) : 0,
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Add Project Card */}
          <div
            className="rounded-lg border border-dashed bg-muted/30 p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors min-h-32"
            onClick={() => openProjectDialog()}
          >
            <Plus className="size-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">New Project</span>
          </div>
        </div>

        {/* Project Dialog */}
        <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={projectFormData.name}
                  onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                  placeholder="My awesome project..."
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setProjectFormData({ ...projectFormData, color })}
                      className={cn(
                        "size-8 rounded-full border-2 transition-transform hover:scale-110",
                        projectFormData.color === color ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="banner">Banner Image Path (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="banner"
                    value={projectFormData.banner}
                    onChange={(e) => setProjectFormData({ ...projectFormData, banner: e.target.value })}
                    placeholder="/background.jpg"
                  />
                  {projectFormData.banner && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setProjectFormData({ ...projectFormData, banner: "" })}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
                {projectFormData.banner && (
                  <div className="relative h-20 rounded-md overflow-hidden bg-muted">
                    <img
                      src={projectFormData.banner}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProject} disabled={!projectFormData.name.trim()}>
                  {editingProject ? "Save" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Board View
  const totalCards = activeProject.columns.reduce((acc, col) => acc + col.cards.filter(c => !c.archived).length, 0)
  const hasBanner = !!activeProject.banner

  return (
    <div className="flex flex-col -m-6 bg-background overflow-hidden" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 px-6 py-4 gap-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setActiveProjectId(null)}>
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="size-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${activeProject.color}20` }}
            >
              <Folder className="size-4" style={{ color: activeProject.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{activeProject.name}</h1>
              <p className="text-sm text-muted-foreground">{totalCards} cards across {activeProject.columns.length} columns</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => openProjectDialog(activeProject)}>
            <Edit2 className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex items-center gap-2 px-6 py-2 shrink-0 border-b bg-background flex-wrap">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-48 h-8"
          />
        </div>

        <Select value={filterLabel || "all"} onValueChange={(v) => setFilterLabel(v === "all" ? null : v)}>
          <SelectTrigger className="w-40 h-8">
            <Tag className="size-4 mr-2" />
            <SelectValue placeholder="Label" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Labels</SelectItem>
            {Object.entries(labelConfig).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterPriority || "all"} onValueChange={(v) => setFilterPriority(v === "all" ? null : v)}>
          <SelectTrigger className="w-40 h-8">
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

        <Button
          variant={showArchived ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setShowArchived(!showArchived)}
          className="h-8"
        >
          <Archive className="size-4 mr-1" />
          {showArchived ? "Archived" : "Archive"}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("")
              setFilterLabel(null)
              setFilterPriority(null)
            }}
            className="h-8"
          >
            <X className="size-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Board */}
      <div
        className="flex-1 min-h-0 flex gap-4 p-6 overflow-x-auto overflow-y-hidden"
        style={hasBanner ? {
          backgroundImage: `url(${activeProject.banner})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {activeProject.columns.map((column) => {
          const filteredCards = filterCards(column.cards)
          const isColumnDragging = draggedColumn === column.id
          const isColumnDragOver = dragOverColumn === column.id && draggedColumn !== column.id
          const isOverWipLimit = column.wipLimit && filteredCards.length > column.wipLimit

          return (
            <div
              key={column.id}
              draggable
              onDragStart={(e) => handleColumnDragStart(e, column.id)}
              onDragOver={(e) => {
                handleColumnDragOver(e)
                if (draggedColumn) handleColumnDragOverColumn(e, column.id)
              }}
              onDrop={() => {
                if (draggedColumn) {
                  handleColumnDrop()
                } else if (draggedCard) {
                  handleCardDrop(column.id)
                }
              }}
              onDragEnd={resetDragState}
              className={cn(
                "flex flex-col w-72 shrink-0 rounded-lg max-h-full transition-all relative z-10",
                hasBanner
                  ? "bg-background/80 backdrop-blur-md border border-white/20 shadow-lg"
                  : "bg-muted/50",
                isColumnDragging && "opacity-50",
                isColumnDragOver && "ring-2 ring-primary ring-offset-2",
                isOverWipLimit && "ring-2 ring-orange-500"
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-3 border-b shrink-0 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-2">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <h3 className="font-medium">{column.title}</h3>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    isOverWipLimit ? "bg-orange-100 text-orange-600" : "bg-muted text-muted-foreground"
                  )}>
                    {filteredCards.length}{column.wipLimit ? `/${column.wipLimit}` : ''}
                  </span>
                  {isOverWipLimit && (
                    <AlertTriangle className="size-4 text-orange-500" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    onClick={(e) => { e.stopPropagation(); setNewCardColumn(column.id) }}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="size-7">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openColumnDialog(column)}>
                        <Edit2 className="size-4 mr-2" />
                        Edit Column
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        <Trash2 className="size-4 mr-2" />
                        Delete Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                {filteredCards.map((card) => {
                  const dueDateStatus = card.dueDate ? getDueDateStatus(card.dueDate, card.startDate) : null
                  const checklistProgress = card.checklist
                    ? Math.round((card.checklist.filter((c) => c.done).length / card.checklist.length) * 100)
                    : null
                  const isBeingDraggedOver = dragOverCard?.cardId === card.id
                  const dropPosition = dragOverCard?.position
                  const timeProgress = card.estimatedHours && card.loggedHours
                    ? Math.min(100, Math.round((card.loggedHours / card.estimatedHours) * 100))
                    : null

                  return (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={(e) => handleCardDragStart(e, card.id, column.id)}
                      onDragOver={(e) => handleCardDragOver(e, card.id)}
                      onDragLeave={handleCardDragLeave}
                      onDrop={(e) => { e.stopPropagation(); handleCardDrop(column.id, card.id) }}
                      onDragEnd={resetDragState}
                      onClick={() => openCardDialog(card, column.id)}
                      className={cn(
                        "group rounded-lg border bg-card shadow-sm cursor-grab active:cursor-grabbing overflow-hidden",
                        "hover:shadow-md transition-all",
                        draggedCard?.cardId === card.id && "opacity-50",
                        isBeingDraggedOver && dropPosition === "before" && "border-t-2 border-t-primary mt-4",
                        isBeingDraggedOver && dropPosition === "after" && "border-b-2 border-b-primary mb-4",
                        card.archived && "opacity-60"
                      )}
                    >
                      {/* Cover Image */}
                      {card.coverImage && (
                        <div className="w-full h-32 overflow-hidden">
                          <img
                            src={card.coverImage}
                            alt=""
                            className="w-full h-full object-cover"
                            draggable={false}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-start gap-2">
                          <GripVertical className="size-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{card.title}</p>

                            {/* Labels */}
                            {card.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {card.labels.map((label) => (
                                  <span
                                    key={label}
                                    className={cn(
                                      "text-xs px-1.5 py-0.5 rounded text-white",
                                      labelConfig[label]?.color || "bg-gray-500"
                                    )}
                                  >
                                    {labelConfig[label]?.label || label}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Meta row */}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {card.priority && (
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                                  priorityConfig[card.priority].bg,
                                  priorityConfig[card.priority].color
                                )}>
                                  <Flag className="size-3" />
                                  {priorityConfig[card.priority].label}
                                </span>
                              )}

                              {card.dueDate && (
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                                  dueDateStatus === "overdue" && "bg-red-100 text-red-600",
                                  dueDateStatus === "soon" && "bg-orange-100 text-orange-600",
                                  dueDateStatus === "not-started" && "bg-blue-100 text-blue-600",
                                  dueDateStatus === "ok" && "bg-muted text-muted-foreground"
                                )}>
                                  <Calendar className="size-3" />
                                  {card.startDate && `${new Date(card.startDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })} - `}
                                  {new Date(card.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              )}

                              {checklistProgress !== null && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                                  <Check className="size-3" />
                                  {checklistProgress}%
                                </span>
                              )}

                              {timeProgress !== null && (
                                <span className={cn(
                                  "text-xs px-1.5 py-0.5 rounded flex items-center gap-1",
                                  timeProgress > 100 ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                                )}>
                                  <Clock className="size-3" />
                                  {card.loggedHours}h/{card.estimatedHours}h
                                </span>
                              )}

                              {card.comments && card.comments.length > 0 && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                                  <MessageSquare className="size-3" />
                                  {card.comments.length}
                                </span>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openCardDialog(card, column.id) }}>
                                <Edit2 className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicateCard(column.id, card) }}>
                                <Copy className="size-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleArchiveCard(column.id, card.id) }}>
                                <Archive className="size-4 mr-2" />
                                {card.archived ? "Unarchive" : "Archive"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={(e) => { e.stopPropagation(); handleDeleteCard(column.id, card.id) }}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* New Card Input */}
                {newCardColumn === column.id && (
                  <div className="rounded-lg border bg-card p-2">
                    <Input
                      autoFocus
                      placeholder="Card title..."
                      value={newCardTitle}
                      onChange={(e) => setNewCardTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCard(column.id)
                        if (e.key === "Escape") {
                          setNewCardColumn(null)
                          setNewCardTitle("")
                        }
                      }}
                      className="mb-2"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddCard(column.id)}>
                        Add
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setNewCardColumn(null)
                          setNewCardTitle("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {/* Add Column */}
        <div
          className={cn(
            "flex flex-col w-72 shrink-0 rounded-lg border border-dashed items-center justify-center cursor-pointer transition-colors",
            hasBanner
              ? "bg-background/50 backdrop-blur-md border-white/30 hover:bg-background/70"
              : "bg-muted/30 hover:bg-muted/50"
          )}
          onClick={() => openColumnDialog()}
        >
          <Plus className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground mt-1">Add Column</span>
        </div>
      </div>

      {/* Card Detail Dialog */}
      <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Edit Card</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="details" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="shrink-0">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="comments">
                Comments {cardFormData.comments.length > 0 && `(${cardFormData.comments.length})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto mt-4">
              <div className="flex flex-col gap-4">
                {/* Cover Image */}
                {cardFormData.coverImage && (
                  <div className="relative h-32 rounded-md overflow-hidden bg-muted">
                    <img
                      src={cardFormData.coverImage}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 size-6"
                      onClick={() => setCardFormData({ ...cardFormData, coverImage: "" })}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-title">Title</Label>
                  <Input
                    id="card-title"
                    value={cardFormData.title}
                    onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                    placeholder="Card title..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="card-description">Description</Label>
                  <Textarea
                    id="card-description"
                    value={cardFormData.description}
                    onChange={(e) => setCardFormData({ ...cardFormData, description: e.target.value })}
                    placeholder="Add a more detailed description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label>Priority</Label>
                    <Select
                      value={cardFormData.priority || "none"}
                      onValueChange={(v) => setCardFormData({ ...cardFormData, priority: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>{config.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-cover">Cover Image</Label>
                    <div className="flex gap-2">
                      <Input
                        id="card-cover"
                        value={cardFormData.coverImage}
                        onChange={(e) => setCardFormData({ ...cardFormData, coverImage: e.target.value })}
                        placeholder="/image.jpg"
                      />
                      <Button variant="outline" size="icon">
                        <Image className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-start">Start Date</Label>
                    <Input
                      id="card-start"
                      type="date"
                      value={cardFormData.startDate}
                      onChange={(e) => setCardFormData({ ...cardFormData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-due">Due Date</Label>
                    <Input
                      id="card-due"
                      type="date"
                      value={cardFormData.dueDate}
                      onChange={(e) => setCardFormData({ ...cardFormData, dueDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-estimate">Estimated Hours</Label>
                    <Input
                      id="card-estimate"
                      type="number"
                      min="0"
                      step="0.5"
                      value={cardFormData.estimatedHours}
                      onChange={(e) => setCardFormData({ ...cardFormData, estimatedHours: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="card-logged">Logged Hours</Label>
                    <Input
                      id="card-logged"
                      type="number"
                      min="0"
                      step="0.5"
                      value={cardFormData.loggedHours}
                      onChange={(e) => setCardFormData({ ...cardFormData, loggedHours: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Labels</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(labelConfig).map(([key, config]) => {
                      const isSelected = cardFormData.labels.includes(key)
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() =>
                            setCardFormData({
                              ...cardFormData,
                              labels: isSelected
                                ? cardFormData.labels.filter((l) => l !== key)
                                : [...cardFormData.labels, key],
                            })
                          }
                          className={cn(
                            "text-xs px-2 py-1 rounded text-white transition-all",
                            config.color,
                            isSelected ? "ring-2 ring-offset-2 ring-primary" : "opacity-50 hover:opacity-100"
                          )}
                        >
                          {config.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="checklist" className="flex-1 overflow-auto mt-4">
              <div className="flex flex-col gap-2">
                {cardFormData.checklist.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round((cardFormData.checklist.filter(i => i.done).length / cardFormData.checklist.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(cardFormData.checklist.filter(i => i.done).length / cardFormData.checklist.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {cardFormData.checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className={cn(
                        "size-5 rounded border flex items-center justify-center shrink-0",
                        item.done ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                      )}
                    >
                      {item.done && <Check className="size-3" />}
                    </button>
                    <span className={cn("flex-1 text-sm", item.done && "line-through text-muted-foreground")}>
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteChecklistItem(item.id)}
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add an item..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={addChecklistItem}>
                    Add
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="flex-1 overflow-hidden flex flex-col mt-4">
              <div className="flex-1 overflow-auto space-y-3 mb-4">
                {cardFormData.comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No comments yet</p>
                ) : (
                  cardFormData.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div
                        className="size-8 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0 bg-primary"
                      >
                        Me
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(new Date(comment.createdAt))}</span>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                  <Send className="size-4" />
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t shrink-0">
            <Button variant="outline" onClick={() => setIsCardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCard} disabled={!cardFormData.title.trim()}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Column Dialog */}
      <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColumn ? "Edit Column" : "Add Column"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="column-title">Column Name</Label>
              <Input
                id="column-title"
                value={columnFormData.title}
                onChange={(e) => setColumnFormData({ ...columnFormData, title: e.target.value })}
                placeholder="e.g., In Review, Blocked..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="column-wip">WIP Limit (optional)</Label>
              <Input
                id="column-wip"
                type="number"
                min="0"
                value={columnFormData.wipLimit}
                onChange={(e) => setColumnFormData({ ...columnFormData, wipLimit: e.target.value })}
                placeholder="No limit"
              />
              <p className="text-xs text-muted-foreground">Work-in-progress limit. Column will show warning when exceeded.</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveColumn} disabled={!columnFormData.title.trim()}>
                {editingColumn ? "Save" : "Add Column"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Dialog (for edit in board view) */}
      <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name-board">Project Name</Label>
              <Input
                id="name-board"
                value={projectFormData.name}
                onChange={(e) => setProjectFormData({ ...projectFormData, name: e.target.value })}
                placeholder="My awesome project..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {projectColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setProjectFormData({ ...projectFormData, color })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      projectFormData.color === color ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="banner-board">Banner Image Path (optional)</Label>
              <div className="flex gap-2">
                <Input
                  id="banner-board"
                  value={projectFormData.banner}
                  onChange={(e) => setProjectFormData({ ...projectFormData, banner: e.target.value })}
                  placeholder="/background.jpg"
                />
                {projectFormData.banner && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setProjectFormData({ ...projectFormData, banner: "" })}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
              {projectFormData.banner && (
                <div className="relative h-20 rounded-md overflow-hidden bg-muted">
                  <img
                    src={projectFormData.banner}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsProjectDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={!projectFormData.name.trim()}>
                {editingProject ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
