import { useState, useMemo } from "react"
import {
  Plus,
  Search,
  StickyNote,
  Star,
  Pin,
  Archive,
  Copy,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  MoreVertical,
  Clock,
  FileText,
  Grid3X3,
  List,
  ArrowUpDown,
  Folder,
  FolderPlus,
  Loader2,
  AlertCircle,
} from "lucide-react"
import { Chip } from "@/components/cheval-ui"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"
import { useNotes, type Note } from "@/hooks"

const noteColors = [
  { id: "default", label: "Default", class: "bg-card", border: "border-border" },
  { id: "yellow", label: "Yellow", class: "bg-yellow-100 dark:bg-yellow-900/30", border: "border-yellow-300 dark:border-yellow-700" },
  { id: "green", label: "Green", class: "bg-green-100 dark:bg-green-900/30", border: "border-green-300 dark:border-green-700" },
  { id: "blue", label: "Blue", class: "bg-blue-100 dark:bg-blue-900/30", border: "border-blue-300 dark:border-blue-700" },
  { id: "purple", label: "Purple", class: "bg-purple-100 dark:bg-purple-900/30", border: "border-purple-300 dark:border-purple-700" },
  { id: "pink", label: "Pink", class: "bg-pink-100 dark:bg-pink-900/30", border: "border-pink-300 dark:border-pink-700" },
  { id: "orange", label: "Orange", class: "bg-orange-100 dark:bg-orange-900/30", border: "border-orange-300 dark:border-orange-700" },
  { id: "red", label: "Red", class: "bg-red-100 dark:bg-red-900/30", border: "border-red-300 dark:border-red-700" },
]

const folderColors = ["gray", "blue", "green", "yellow", "purple", "pink", "orange", "red"]

type SortOption = "updatedAt" | "createdAt" | "title" | "color"
type ViewMode = "grid" | "list"
type FilterView = "all" | "starred" | "archived"

function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString()
}

function renderMarkdown(content: string): string {
  let html = content
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Headers
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-4 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-4 mb-2">$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del class="text-muted-foreground">$1</del>')
    // Inline code
    .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
    // Blockquotes
    .replace(/^&gt; (.+)$/gm, '<blockquote class="border-l-2 border-primary/50 pl-3 italic text-muted-foreground">$1</blockquote>')
    // Checkboxes
    .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2"><input type="checkbox" checked disabled class="accent-primary" /><span class="line-through text-muted-foreground">$1</span></div>')
    .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2"><input type="checkbox" disabled class="accent-primary" /><span>$1</span></div>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Line breaks
    .replace(/\n/g, '<br />')

  return html
}

function getWordCount(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length
}

function getCharCount(content: string): number {
  return content.length
}

export function NotesPage() {
  const {
    notes,
    folders,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote: deleteNoteApi,
    createFolder: createFolderApi,
    deleteFolder: deleteFolderApi,
  } = useNotes()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [filterView, setFilterView] = useState<FilterView>("all")
  const [sortBy, setSortBy] = useState<SortOption>("updatedAt")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "default",
    tags: "",
    folderId: "" as string | null,
  })
  const [folderFormData, setFolderFormData] = useState({ name: "", color: "gray" })

  const allTags = useMemo(
    () => [...new Set(notes.filter(n => !n.archived).flatMap((n) => n.tags || []))],
    [notes]
  )

  const stats = useMemo(() => {
    const activeNotes = notes.filter(n => !n.archived)
    return {
      total: activeNotes.length,
      pinned: activeNotes.filter(n => n.pinned).length,
      starred: activeNotes.filter(n => n.starred).length,
      archived: notes.filter(n => n.archived).length,
    }
  }, [notes])

  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        // Filter by view
        if (filterView === "starred" && !note.starred) return false
        if (filterView === "archived" && !note.archived) return false
        if (filterView === "all" && note.archived) return false

        // Filter by folder
        if (selectedFolder && note.folderId !== selectedFolder) return false

        // Search
        const matchesSearch =
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase())

        // Tag filter
        const matchesTag = !selectedTag || note.tags?.includes(selectedTag)

        return matchesSearch && matchesTag
      })
      .sort((a, b) => {
        // Pinned first
        if (a.pinned && !b.pinned) return -1
        if (!a.pinned && b.pinned) return 1

        // Then sort by selected option
        switch (sortBy) {
          case "updatedAt":
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          case "createdAt":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          case "title":
            return a.title.localeCompare(b.title)
          case "color":
            return a.color.localeCompare(b.color)
          default:
            return 0
        }
      })
  }, [notes, searchQuery, selectedTag, selectedFolder, filterView, sortBy])

  const handleCreate = () => {
    setEditingNote(null)
    setFormData({ title: "", content: "", color: "default", tags: "", folderId: selectedFolder })
    setShowPreview(false)
    setIsDialogOpen(true)
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      title: note.title,
      content: note.content,
      color: note.color || "default",
      tags: note.tags?.join(", ") || "",
      folderId: note.folderId,
    })
    setShowPreview(false)
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title: formData.title,
          content: formData.content,
          color: formData.color,
          tags,
          folderId: formData.folderId || null,
        })
      } else {
        await createNote({
          title: formData.title,
          content: formData.content,
          color: formData.color,
          tags,
          folderId: formData.folderId || null,
        })
      }
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Failed to save note:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNoteApi(id)
    } catch (err) {
      console.error("Failed to delete note:", err)
    }
  }

  const handleTogglePin = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    try {
      await updateNote(id, { pinned: !note.pinned })
    } catch (err) {
      console.error("Failed to toggle pin:", err)
    }
  }

  const handleToggleStar = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    try {
      await updateNote(id, { starred: !note.starred })
    } catch (err) {
      console.error("Failed to toggle star:", err)
    }
  }

  const handleToggleArchive = async (id: string) => {
    const note = notes.find(n => n.id === id)
    if (!note) return
    try {
      await updateNote(id, { archived: !note.archived, pinned: false })
    } catch (err) {
      console.error("Failed to toggle archive:", err)
    }
  }

  const handleDuplicate = async (note: Note) => {
    try {
      await createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        color: note.color,
        tags: note.tags,
        folderId: note.folderId,
        pinned: false,
        starred: false,
      })
    } catch (err) {
      console.error("Failed to duplicate note:", err)
    }
  }

  const handleCreateFolder = async () => {
    if (!folderFormData.name.trim()) return
    try {
      await createFolderApi({
        name: folderFormData.name,
        color: folderFormData.color,
      })
      setFolderFormData({ name: "", color: "gray" })
      setIsFolderDialogOpen(false)
    } catch (err) {
      console.error("Failed to create folder:", err)
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolderApi(folderId)
      if (selectedFolder === folderId) setSelectedFolder(null)
    } catch (err) {
      console.error("Failed to delete folder:", err)
    }
  }

  const getColorClass = (colorId: string) => {
    return noteColors.find(c => c.id === colorId)?.class || "bg-card"
  }

  const getBorderClass = (colorId: string) => {
    return noteColors.find(c => c.id === colorId)?.border || "border-border"
  }

  const getFolderColorClass = (color: string) => {
    const colors: Record<string, string> = {
      gray: "text-gray-500",
      blue: "text-blue-500",
      green: "text-green-500",
      yellow: "text-yellow-500",
      purple: "text-purple-500",
      pink: "text-pink-500",
      orange: "text-orange-500",
      red: "text-red-500",
    }
    return colors[color] || "text-gray-500"
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading notes...</p>
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
            <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
            <p className="text-sm text-muted-foreground">Capture your thoughts and ideas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFolderDialogOpen(true)}>
            <FolderPlus className="size-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="size-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="size-4" />
            <span className="text-sm">Total Notes</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Pin className="size-4" />
            <span className="text-sm">Pinned</span>
          </div>
          <p className="text-2xl font-bold">{stats.pinned}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Star className="size-4" />
            <span className="text-sm">Starred</span>
          </div>
          <p className="text-2xl font-bold">{stats.starred}</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Archive className="size-4" />
            <span className="text-sm">Archived</span>
          </div>
          <p className="text-2xl font-bold">{stats.archived}</p>
        </div>
      </div>

      {/* Folders sidebar + content */}
      <div className="flex gap-6">
        {/* Folders sidebar */}
        <div className="w-48 shrink-0 hidden lg:block">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-muted-foreground">Folders</h3>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedFolder(null)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                !selectedFolder ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              )}
            >
              <Folder className="size-4 text-muted-foreground" />
              All Notes
            </button>
            {folders.map((folder) => (
              <div key={folder.id} className="group relative">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    selectedFolder === folder.id ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                  )}
                >
                  <Folder className={cn("size-4", getFolderColorClass(folder.color))} />
                  <span className="truncate">{folder.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {notes.filter(n => n.folderId === folder.id && !n.archived).length}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 rounded transition-opacity"
                >
                  <Trash2 className="size-3 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Filters and search */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterView} onValueChange={(v) => setFilterView(v as FilterView)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notes</SelectItem>
                    <SelectItem value="starred">Starred</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                  <SelectTrigger className="w-40">
                    <ArrowUpDown className="size-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updatedAt">Last Updated</SelectItem>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="size-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Chip
                label="All"
                selected={!selectedTag}
                onClick={() => setSelectedTag(null)}
              />
              {allTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  selected={selectedTag === tag}
                  onClick={() => setSelectedTag(tag)}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <OrangeLogo className="size-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium">No notes found</h3>
              <p className="text-muted-foreground">
                {filterView === "archived"
                  ? "No archived notes"
                  : filterView === "starred"
                  ? "No starred notes"
                  : "Create your first note to get started"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "group relative rounded-lg border p-4 transition-shadow hover:shadow-md cursor-pointer",
                    getColorClass(note.color),
                    getBorderClass(note.color)
                  )}
                  onClick={() => handleEdit(note)}
                >
                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id) }}
                      className="p-1 rounded hover:bg-background/50"
                    >
                      <Star className={cn("size-4", note.starred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleTogglePin(note.id) }}
                      className="p-1 rounded hover:bg-background/50"
                    >
                      <Pin className={cn("size-4", note.pinned ? "fill-primary text-primary" : "text-muted-foreground")} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded hover:bg-background/50">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit3 className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(note)}>
                          <Copy className="size-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleArchive(note.id)}>
                          <Archive className="size-4 mr-2" />
                          {note.archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1 mb-2">
                    {note.pinned && <Pin className="size-3 fill-primary text-primary" />}
                    {note.starred && <Star className="size-3 fill-yellow-500 text-yellow-500" />}
                    {note.archived && <Archive className="size-3 text-muted-foreground" />}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold mb-2 pr-16 line-clamp-1">{note.title}</h3>

                  {/* Content preview */}
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3 whitespace-pre-wrap">
                    {note.content.replace(/[#*`>\[\]]/g, "").slice(0, 150)}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {formatRelativeTime(note.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      {note.folderId && (
                        <span className="flex items-center gap-1">
                          <Folder className={cn("size-3", getFolderColorClass(folders.find(f => f.id === note.folderId)?.color || "gray"))} />
                        </span>
                      )}
                      {note.tags?.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {(note.tags?.length || 0) > 2 && (
                        <span className="text-xs">+{note.tags!.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // List view
            <div className="space-y-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className={cn(
                    "group flex items-center gap-4 rounded-lg border p-4 transition-shadow hover:shadow-md cursor-pointer",
                    getColorClass(note.color),
                    getBorderClass(note.color)
                  )}
                  onClick={() => handleEdit(note)}
                >
                  {/* Icons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {note.pinned && <Pin className="size-4 fill-primary text-primary" />}
                    {note.starred && <Star className="size-4 fill-yellow-500 text-yellow-500" />}
                    {!note.pinned && !note.starred && <StickyNote className="size-4 text-muted-foreground" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{note.title}</h3>
                      {note.archived && <Badge variant="secondary">Archived</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {note.content.replace(/[#*`>\[\]]/g, "").slice(0, 100)}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="hidden sm:flex items-center gap-1 shrink-0">
                    {note.tags?.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                    <Clock className="size-3" />
                    {formatRelativeTime(note.updatedAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleStar(note.id) }}
                      className="p-1 rounded hover:bg-background/50"
                    >
                      <Star className={cn("size-4", note.starred ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground")} />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 rounded hover:bg-background/50">
                          <MoreVertical className="size-4 text-muted-foreground" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(note)}>
                          <Edit3 className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(note)}>
                          <Copy className="size-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleArchive(note.id)}>
                          <Archive className="size-4 mr-2" />
                          {note.archived ? "Unarchive" : "Archive"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{editingNote ? "Edit Note" : "New Note"}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOff className="size-4 mr-2" /> : <Eye className="size-4 mr-2" />}
                {showPreview ? "Edit" : "Preview"}
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-y-auto flex-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Note title..."
              />
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Content</Label>
                {!showPreview && (
                  <span className="text-xs text-muted-foreground">
                    {getWordCount(formData.content)} words · {getCharCount(formData.content)} chars
                  </span>
                )}
              </div>
              {showPreview ? (
                <div
                  className="min-h-[200px] p-4 rounded-md border bg-muted/30 overflow-y-auto prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }}
                />
              ) : (
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your note... (Markdown supported)"
                  className="min-h-[200px] font-mono text-sm"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {noteColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.id })}
                      className={cn(
                        "size-8 rounded-full border-2 transition-transform hover:scale-110",
                        color.class,
                        formData.color === color.id ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                      )}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Folder</Label>
                <Select
                  value={formData.folderId || "none"}
                  onValueChange={(v) => setFormData({ ...formData, folderId: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <span className="flex items-center gap-2">
                          <Folder className={cn("size-4", getFolderColorClass(folder.color))} />
                          {folder.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="work, ideas, personal..."
              />
            </div>

            {editingNote && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                <span>Created: {new Date(editingNote.createdAt).toLocaleString()}</span>
                <span>Updated: {new Date(editingNote.updatedAt).toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title.trim()}>
                {editingNote ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Folder Dialog */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="folderName">Name</Label>
              <Input
                id="folderName"
                value={folderFormData.name}
                onChange={(e) => setFolderFormData({ ...folderFormData, name: e.target.value })}
                placeholder="Folder name..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {folderColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFolderFormData({ ...folderFormData, color })}
                    className={cn(
                      "size-8 rounded-full border-2 transition-transform hover:scale-110",
                      getFolderColorClass(color).replace("text-", "bg-").replace("-500", "-200"),
                      folderFormData.color === color ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFolder} disabled={!folderFormData.name.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
