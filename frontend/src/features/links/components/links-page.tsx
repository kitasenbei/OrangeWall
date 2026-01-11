import { useState } from "react"
import {
  Plus,
  ExternalLink,
  Pencil,
  Trash2,
  Search,
  Globe,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { OrangeLogo } from "@/components/common/orange-logo"

interface QuickLink {
  id: string
  title: string
  url: string
  category: string
}

const categories = ["Work", "Social", "Dev", "News", "Tools", "Other"]

const initialLinks: QuickLink[] = [
  { id: "1", title: "GitHub", url: "https://github.com", category: "Dev" },
  { id: "2", title: "Twitter", url: "https://twitter.com", category: "Social" },
  { id: "3", title: "YouTube", url: "https://youtube.com", category: "Social" },
  { id: "4", title: "LinkedIn", url: "https://linkedin.com", category: "Work" },
  { id: "5", title: "Gmail", url: "https://mail.google.com", category: "Work" },
  { id: "6", title: "Vercel", url: "https://vercel.com", category: "Dev" },
]

export function LinksPage() {
  const [links, setLinks] = useState<QuickLink[]>(initialLinks)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("all")

  // Form state
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [category, setCategory] = useState("Other")

  const filteredLinks = links.filter(link => {
    if (searchQuery && !link.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (filterCategory !== "all" && link.category !== filterCategory) return false
    return true
  })

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return

    let finalUrl = url.trim()
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl
    }

    if (editingLink) {
      setLinks(prev => prev.map(l =>
        l.id === editingLink.id
          ? { ...l, title, url: finalUrl, category }
          : l
      ))
    } else {
      const newLink: QuickLink = {
        id: Date.now().toString(),
        title,
        url: finalUrl,
        category,
      }
      setLinks(prev => [...prev, newLink])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setTitle("")
    setUrl("")
    setCategory("Other")
    setEditingLink(null)
  }

  const openEdit = (link: QuickLink) => {
    setEditingLink(link)
    setTitle(link.title)
    setUrl(link.url)
    setCategory(link.category)
    setDialogOpen(true)
  }

  const deleteLink = (id: string) => {
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Quick Links</h1>
            <p className="text-sm text-muted-foreground">Your frequently used links</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="size-4 mr-2" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? "Edit Link" : "Add Link"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., GitHub"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
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
              <Button onClick={handleSave} className="w-full">
                {editingLink ? "Save Changes" : "Add Link"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search links..."
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* All Links Grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredLinks.map((link) => {
          const domain = link.url.replace(/^https?:\/\//, "").split("/")[0]
          // Get root domain for better favicon matching (e.g., mail.google.com -> google.com)
          const parts = domain.split(".")
          const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : domain
          const faviconUrl = `https://www.google.com/s2/favicons?domain=${rootDomain}&sz=64`
          return (
            <div
              key={link.id}
              className="group bg-card border rounded-lg p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="size-10 rounded-lg flex items-center justify-center bg-muted overflow-hidden"
                >
                  <img
                    src={faviconUrl}
                    alt={link.title}
                    className="size-6"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Globe className="size-5 text-muted-foreground hidden" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 opacity-0 group-hover:opacity-100">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(link)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteLink(link.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="font-medium truncate">{link.title}</h3>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                  <ExternalLink className="size-3" />
                  {link.url.replace(/^https?:\/\//, "").split("/")[0]}
                </p>
              </a>
              <span className="text-xs text-primary/70 mt-2 block">{link.category}</span>
            </div>
          )
        })}
      </div>

      {filteredLinks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <OrangeLogo className="size-12 mx-auto mb-4 opacity-50" />
          <p>No links found</p>
          <p className="text-sm">Add some quick links to get started</p>
        </div>
      )}
    </div>
  )
}
