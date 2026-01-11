import { useState } from "react"
import { Plus, Search, Bookmark as BookmarkIcon, Grid, List, Star } from "lucide-react"
import { BookmarkCard, type Bookmark, Chip, IconButton } from "@/components/cheval-ui"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const initialBookmarks: Bookmark[] = [
  {
    id: "1",
    title: "GitHub",
    url: "https://github.com",
    description: "Where the world builds software",
    favicon: "https://github.githubassets.com/favicons/favicon.svg",
    tags: ["dev", "code"],
    starred: true,
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    title: "Hacker News",
    url: "https://news.ycombinator.com",
    description: "Social news website focusing on computer science",
    tags: ["news", "tech"],
    starred: true,
    createdAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org",
    description: "Resources for developers, by developers",
    favicon: "https://developer.mozilla.org/favicon-48x48.png",
    tags: ["docs", "dev"],
    starred: false,
    createdAt: new Date(Date.now() - 259200000),
  },
  {
    id: "4",
    title: "Tailwind CSS",
    url: "https://tailwindcss.com",
    description: "A utility-first CSS framework",
    favicon: "https://tailwindcss.com/favicons/favicon.ico",
    tags: ["css", "dev"],
    starred: false,
    createdAt: new Date(Date.now() - 345600000),
  },
  {
    id: "5",
    title: "Vercel",
    url: "https://vercel.com",
    description: "Develop. Preview. Ship.",
    favicon: "https://vercel.com/favicon.ico",
    tags: ["hosting", "dev"],
    starred: false,
    createdAt: new Date(Date.now() - 432000000),
  },
]

export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ title: "", url: "", description: "", tags: "" })

  const allTags = [...new Set(bookmarks.flatMap((b) => b.tags || []))]

  const filteredBookmarks = bookmarks
    .filter((bookmark) => {
      const matchesSearch =
        bookmark.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = !selectedTag || bookmark.tags?.includes(selectedTag)
      const matchesStarred = !showStarredOnly || bookmark.starred
      return matchesSearch && matchesTag && matchesStarred
    })
    .sort((a, b) => {
      if (a.starred && !b.starred) return -1
      if (!a.starred && b.starred) return 1
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

  const handleCreate = () => {
    const tags = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    const newBookmark: Bookmark = {
      id: crypto.randomUUID(),
      title: formData.title || formData.url,
      url: formData.url.startsWith("http") ? formData.url : `https://${formData.url}`,
      description: formData.description,
      tags,
      starred: false,
      createdAt: new Date(),
    }
    setBookmarks((prev) => [newBookmark, ...prev])
    setIsDialogOpen(false)
    setFormData({ title: "", url: "", description: "", tags: "" })
  }

  const handleDelete = (id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
  }

  const handleToggleStar = (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, starred: !b.starred } : b))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-muted-foreground">Save and organize your favorite links</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Bookmark
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={Star}
            variant={showStarredOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            label="Show starred only"
          />
          <div className="flex rounded-md border">
            <IconButton
              icon={Grid}
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              label="Grid view"
              className="rounded-r-none"
            />
            <IconButton
              icon={List}
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              label="List view"
              className="rounded-l-none"
            />
          </div>
        </div>
      </div>

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

      {filteredBookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookmarkIcon className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No bookmarks found</h3>
          <p className="text-muted-foreground">Add your first bookmark to get started</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              variant="card"
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
              variant="row"
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Page title..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="dev, tools, reference..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.url.trim()}>
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
