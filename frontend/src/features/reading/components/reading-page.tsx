import { useState } from "react"
import { Plus, Book, BookOpen, CheckCircle, Star, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Chip } from "@/components/cheval-ui"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Book {
  id: string
  title: string
  author: string
  status: "to-read" | "reading" | "completed"
  rating?: number
  totalPages?: number
  currentPage?: number
  notes: string
  keyTakeaways: string[]
  category: string
  addedAt: Date
  completedAt?: Date
}

const categories = ["Business", "Self-Help", "Biography", "Tech", "Finance", "Marketing", "Leadership", "Other"]

const initialBooks: Book[] = [
  {
    id: "1",
    title: "Zero to One",
    author: "Peter Thiel",
    status: "completed",
    rating: 5,
    totalPages: 224,
    currentPage: 224,
    notes: "Essential reading for any entrepreneur. Great insights on building monopolies.",
    keyTakeaways: [
      "Competition is for losers - build a monopoly",
      "Start small and dominate a niche",
      "Technology creates 0 to 1, not 1 to n progress",
    ],
    category: "Business",
    addedAt: new Date(Date.now() - 2592000000),
    completedAt: new Date(Date.now() - 604800000),
  },
  {
    id: "2",
    title: "The Lean Startup",
    author: "Eric Ries",
    status: "reading",
    totalPages: 336,
    currentPage: 180,
    notes: "Build-Measure-Learn loop is key. MVP everything.",
    keyTakeaways: ["Validated learning over vanity metrics"],
    category: "Business",
    addedAt: new Date(Date.now() - 1296000000),
  },
  {
    id: "3",
    title: "Atomic Habits",
    author: "James Clear",
    status: "to-read",
    category: "Self-Help",
    notes: "",
    keyTakeaways: [],
    addedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "4",
    title: "The Hard Thing About Hard Things",
    author: "Ben Horowitz",
    status: "to-read",
    category: "Business",
    notes: "",
    keyTakeaways: [],
    addedAt: new Date(),
  },
]

const statusConfig = {
  "to-read": { label: "To Read", icon: Book, color: "text-gray-500" },
  reading: { label: "Reading", icon: BookOpen, color: "text-blue-500" },
  completed: { label: "Completed", icon: CheckCircle, color: "text-green-500" },
}

export function ReadingPage() {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "Business",
    totalPages: "",
    notes: "",
  })

  const filteredBooks = books.filter(
    (book) => !selectedStatus || book.status === selectedStatus
  )

  const stats = {
    toRead: books.filter((b) => b.status === "to-read").length,
    reading: books.filter((b) => b.status === "reading").length,
    completed: books.filter((b) => b.status === "completed").length,
    totalPages: books.filter((b) => b.status === "completed").reduce((acc, b) => acc + (b.totalPages || 0), 0),
  }

  const handleCreate = () => {
    const newBook: Book = {
      id: crypto.randomUUID(),
      title: formData.title,
      author: formData.author,
      status: "to-read",
      category: formData.category,
      totalPages: formData.totalPages ? Number(formData.totalPages) : undefined,
      notes: formData.notes,
      keyTakeaways: [],
      addedAt: new Date(),
    }
    setBooks((prev) => [newBook, ...prev])
    setIsDialogOpen(false)
    setFormData({ title: "", author: "", category: "Business", totalPages: "", notes: "" })
  }

  const handleDelete = (id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }

  const handleStatusChange = (id: string, status: Book["status"]) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              status,
              completedAt: status === "completed" ? new Date() : undefined,
              currentPage: status === "completed" ? b.totalPages : b.currentPage,
            }
          : b
      )
    )
  }

  const handleUpdateProgress = (id: string, currentPage: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, currentPage, status: "reading" } : b))
    )
  }

  const handleRate = (id: string, rating: number) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rating } : b))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reading List</h1>
          <p className="text-muted-foreground">Track books and capture learnings</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Book
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.toRead}</p>
          <p className="text-sm text-muted-foreground">To Read</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.reading}</p>
          <p className="text-sm text-muted-foreground">Reading</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.completed}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-center">
          <p className="text-2xl font-bold">{stats.totalPages.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Pages Read</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Chip label="All" selected={!selectedStatus} onClick={() => setSelectedStatus(null)} />
        {Object.entries(statusConfig).map(([key, config]) => (
          <Chip
            key={key}
            label={config.label}
            selected={selectedStatus === key}
            onClick={() => setSelectedStatus(key)}
          />
        ))}
      </div>

      {/* Books Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map((book) => {
          const StatusIcon = statusConfig[book.status].icon
          const progress = book.totalPages && book.currentPage
            ? (book.currentPage / book.totalPages) * 100
            : 0

          return (
            <div
              key={book.id}
              className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setSelectedBook(book)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(book.id, "reading") }}>
                      <BookOpen className="size-4 mr-2" />
                      Start Reading
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(book.id, "completed") }}>
                      <CheckCircle className="size-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(book.id) }}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StatusIcon className={cn("size-4", statusConfig[book.status].color)} />
                <span className="text-xs text-muted-foreground">{statusConfig[book.status].label}</span>
                <span className="text-xs text-muted-foreground">• {book.category}</span>
              </div>

              {book.status === "reading" && book.totalPages && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{book.currentPage || 0} / {book.totalPages} pages</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {book.status === "completed" && book.rating && (
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "size-4",
                        star <= book.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted"
                      )}
                    />
                  ))}
                </div>
              )}

              {book.keyTakeaways.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {book.keyTakeaways.length} takeaway{book.keyTakeaways.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Book className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No books found</h3>
          <p className="text-muted-foreground">Add a book to start your reading list</p>
        </div>
      )}

      {/* Add Book Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Book</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Book title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="Author name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="pages">Total Pages</Label>
                <Input
                  id="pages"
                  type="number"
                  value={formData.totalPages}
                  onChange={(e) => setFormData({ ...formData, totalPages: e.target.value })}
                  placeholder="300"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Why do you want to read this?"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title.trim() || !formData.author.trim()}>
                Add Book
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Book Dialog */}
      <Dialog open={!!selectedBook} onOpenChange={() => setSelectedBook(null)}>
        <DialogContent className="max-w-lg">
          {selectedBook && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedBook.title}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground">{selectedBook.author}</p>

                <div className="flex items-center gap-4">
                  <span className={cn("text-sm", statusConfig[selectedBook.status].color)}>
                    {statusConfig[selectedBook.status].label}
                  </span>
                  <span className="text-sm text-muted-foreground">{selectedBook.category}</span>
                </div>

                {selectedBook.status === "reading" && selectedBook.totalPages && (
                  <div>
                    <Label className="text-sm">Update Progress</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        value={selectedBook.currentPage || 0}
                        onChange={(e) => handleUpdateProgress(selectedBook.id, Number(e.target.value))}
                        className="w-24"
                        max={selectedBook.totalPages}
                      />
                      <span className="text-sm text-muted-foreground">/ {selectedBook.totalPages} pages</span>
                    </div>
                  </div>
                )}

                {selectedBook.status === "completed" && (
                  <div>
                    <Label className="text-sm">Rating</Label>
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(selectedBook.id, star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star
                            className={cn(
                              "size-6",
                              star <= (selectedBook.rating || 0)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted hover:text-yellow-400"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBook.notes && (
                  <div>
                    <Label className="text-sm">Notes</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedBook.notes}</p>
                  </div>
                )}

                {selectedBook.keyTakeaways.length > 0 && (
                  <div>
                    <Label className="text-sm">Key Takeaways</Label>
                    <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside space-y-1">
                      {selectedBook.keyTakeaways.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedBook.status !== "reading" && (
                    <Button
                      variant="outline"
                      onClick={() => { handleStatusChange(selectedBook.id, "reading"); setSelectedBook(null) }}
                    >
                      <BookOpen className="size-4 mr-2" />
                      Start Reading
                    </Button>
                  )}
                  {selectedBook.status !== "completed" && (
                    <Button
                      onClick={() => { handleStatusChange(selectedBook.id, "completed"); setSelectedBook(null) }}
                    >
                      <CheckCircle className="size-4 mr-2" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
