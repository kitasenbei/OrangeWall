import { useState, useMemo } from "react"
import {
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  Code,
  Copy,
  Check,
  Search,
  Star,
  Folder,
  FileCode,
  Terminal,
  Database,
  Globe,
  Palette,
  Server,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/cheval-ui"
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

interface Snippet {
  id: string
  title: string
  description: string
  code: string
  language: string
  tags: string[]
  folder: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

const languages: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "javascript", label: "JavaScript", icon: FileCode },
  { id: "typescript", label: "TypeScript", icon: FileCode },
  { id: "python", label: "Python", icon: Terminal },
  { id: "bash", label: "Bash", icon: Terminal },
  { id: "sql", label: "SQL", icon: Database },
  { id: "html", label: "HTML", icon: Globe },
  { id: "css", label: "CSS", icon: Palette },
  { id: "json", label: "JSON", icon: Code },
  { id: "yaml", label: "YAML", icon: Server },
  { id: "markdown", label: "Markdown", icon: FileCode },
  { id: "go", label: "Go", icon: FileCode },
  { id: "rust", label: "Rust", icon: FileCode },
  { id: "java", label: "Java", icon: FileCode },
  { id: "csharp", label: "C#", icon: FileCode },
  { id: "php", label: "PHP", icon: Globe },
  { id: "ruby", label: "Ruby", icon: FileCode },
  { id: "other", label: "Other", icon: Code },
]

const defaultFolders = ["General", "React", "Backend", "DevOps", "Database", "Utilities"]

function generateMockSnippets(): Snippet[] {
  return [
    {
      id: "1",
      title: "React useState Hook",
      description: "Basic useState hook with TypeScript",
      code: `const [count, setCount] = useState<number>(0);

// Update state
setCount(prev => prev + 1);

// Reset state
setCount(0);`,
      language: "typescript",
      tags: ["react", "hooks", "state"],
      folder: "React",
      isFavorite: true,
      createdAt: new Date(2024, 0, 1),
      updatedAt: new Date(2024, 0, 1),
    },
    {
      id: "2",
      title: "Fetch API with Error Handling",
      description: "Async fetch with proper error handling",
      code: `async function fetchData<T>(url: string): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}`,
      language: "typescript",
      tags: ["api", "fetch", "async"],
      folder: "General",
      isFavorite: true,
      createdAt: new Date(2024, 0, 5),
      updatedAt: new Date(2024, 0, 10),
    },
    {
      id: "3",
      title: "PostgreSQL Create Table",
      description: "Create table with common columns",
      code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);`,
      language: "sql",
      tags: ["database", "postgres", "table"],
      folder: "Database",
      isFavorite: false,
      createdAt: new Date(2024, 0, 8),
      updatedAt: new Date(2024, 0, 8),
    },
    {
      id: "4",
      title: "Docker Compose Node.js",
      description: "Basic docker-compose for Node.js app",
      code: `version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:pass@db:5432/mydb
    depends_on:
      - db
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`,
      language: "yaml",
      tags: ["docker", "devops", "nodejs"],
      folder: "DevOps",
      isFavorite: false,
      createdAt: new Date(2024, 0, 12),
      updatedAt: new Date(2024, 0, 12),
    },
    {
      id: "5",
      title: "Debounce Function",
      description: "Debounce utility function",
      code: `function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// Usage
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);`,
      language: "typescript",
      tags: ["utility", "performance"],
      folder: "Utilities",
      isFavorite: true,
      createdAt: new Date(2024, 0, 15),
      updatedAt: new Date(2024, 0, 15),
    },
    {
      id: "6",
      title: "Git Reset Commands",
      description: "Common git reset operations",
      code: `# Soft reset (keep changes staged)
git reset --soft HEAD~1

# Mixed reset (keep changes unstaged)
git reset HEAD~1

# Hard reset (discard changes)
git reset --hard HEAD~1

# Reset to specific commit
git reset --hard <commit-hash>

# Reset single file
git checkout HEAD -- <file>`,
      language: "bash",
      tags: ["git", "version-control"],
      folder: "General",
      isFavorite: false,
      createdAt: new Date(2024, 0, 18),
      updatedAt: new Date(2024, 0, 18),
    },
  ]
}

export function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>(generateMockSnippets)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterLanguage, setFilterLanguage] = useState<string | null>(null)
  const [filterFolder, setFilterFolder] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    language: "javascript",
    tags: [] as string[],
    folder: "General",
    newTag: "",
  })

  const folders = useMemo(() => {
    const uniqueFolders = new Set(snippets.map((s) => s.folder))
    defaultFolders.forEach((f) => uniqueFolders.add(f))
    return Array.from(uniqueFolders).sort()
  }, [snippets])

  const filteredSnippets = useMemo(() => {
    let result = [...snippets]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query) ||
          s.tags.some((t) => t.toLowerCase().includes(query)) ||
          s.code.toLowerCase().includes(query)
      )
    }

    if (filterLanguage) {
      result = result.filter((s) => s.language === filterLanguage)
    }

    if (filterFolder) {
      result = result.filter((s) => s.folder === filterFolder)
    }

    // Favorites first, then by date
    result.sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1
      return b.updatedAt.getTime() - a.updatedAt.getTime()
    })

    return result
  }, [snippets, searchQuery, filterLanguage, filterFolder])

  const stats = useMemo(() => {
    const total = snippets.length
    const favorites = snippets.filter((s) => s.isFavorite).length
    const languageCount = new Set(snippets.map((s) => s.language)).size
    const folderCount = new Set(snippets.map((s) => s.folder)).size

    return { total, favorites, languageCount, folderCount }
  }, [snippets])

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleOpenAdd = () => {
    setEditingSnippet(null)
    setFormData({
      title: "",
      description: "",
      code: "",
      language: "javascript",
      tags: [],
      folder: "General",
      newTag: "",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (snippet: Snippet) => {
    setEditingSnippet(snippet)
    setFormData({
      title: snippet.title,
      description: snippet.description,
      code: snippet.code,
      language: snippet.language,
      tags: snippet.tags,
      folder: snippet.folder,
      newTag: "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.title.trim() || !formData.code.trim()) return

    if (editingSnippet) {
      setSnippets((prev) =>
        prev.map((s) =>
          s.id === editingSnippet.id
            ? {
                ...s,
                title: formData.title,
                description: formData.description,
                code: formData.code,
                language: formData.language,
                tags: formData.tags,
                folder: formData.folder,
                updatedAt: new Date(),
              }
            : s
        )
      )
    } else {
      const newSnippet: Snippet = {
        id: crypto.randomUUID(),
        title: formData.title,
        description: formData.description,
        code: formData.code,
        language: formData.language,
        tags: formData.tags,
        folder: formData.folder,
        isFavorite: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      setSnippets((prev) => [...prev, newSnippet])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setSnippets((prev) => prev.filter((s) => s.id !== id))
  }

  const handleToggleFavorite = (id: string) => {
    setSnippets((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    )
  }

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, formData.newTag.trim().toLowerCase()],
        newTag: "",
      })
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const getLanguageInfo = (langId: string) => {
    return languages.find((l) => l.id === langId) || languages[languages.length - 1]
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Snippets</h1>
          <p className="text-muted-foreground">Store and organize your code snippets</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4 mr-2" />
          New Snippet
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Snippets" value={stats.total.toString()} icon={Code} />
        <StatCard title="Favorites" value={stats.favorites.toString()} icon={Star} />
        <StatCard title="Languages" value={stats.languageCount.toString()} icon={FileCode} />
        <StatCard title="Folders" value={stats.folderCount.toString()} icon={Folder} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search snippets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterLanguage || "all"}
          onValueChange={(v) => setFilterLanguage(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            {languages.map((lang) => {
              const LangIcon = lang.icon
              return (
                <SelectItem key={lang.id} value={lang.id}>
                  <span className="flex items-center gap-2">
                    <LangIcon className="size-4" />
                    {lang.label}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
        <Select
          value={filterFolder || "all"}
          onValueChange={(v) => setFilterFolder(v === "all" ? null : v)}
        >
          <SelectTrigger className="w-40">
            <Folder className="size-4 mr-2" />
            <SelectValue placeholder="Folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Folders</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder} value={folder}>
                {folder}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Snippets List */}
      {filteredSnippets.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Code className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium mb-2">No snippets found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery || filterLanguage || filterFolder
              ? "Try adjusting your filters"
              : "Start saving your code snippets"}
          </p>
          {!searchQuery && !filterLanguage && !filterFolder && (
            <Button onClick={handleOpenAdd}>
              <Plus className="size-4 mr-2" />
              New Snippet
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSnippets.map((snippet) => {
            const langInfo = getLanguageInfo(snippet.language)
            const LangIcon = langInfo.icon
            const isExpanded = expandedSnippet === snippet.id

            return (
              <div
                key={snippet.id}
                className="group rounded-lg border bg-card overflow-hidden"
              >
                <div className="flex items-start justify-between p-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {snippet.isFavorite && (
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      )}
                      <h3 className="font-semibold">{snippet.title}</h3>
                    </div>
                    {snippet.description && (
                      <p className="text-sm text-muted-foreground mb-2">{snippet.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="gap-1">
                        <LangIcon className="size-3" />
                        {langInfo.label}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Folder className="size-3" />
                        {snippet.folder}
                      </Badge>
                      {snippet.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleCopy(snippet.code, snippet.id)}
                    >
                      {copiedId === snippet.id ? (
                        <Check className="size-4 text-green-500" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenEdit(snippet)}>
                          <Edit3 className="size-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleFavorite(snippet.id)}>
                          <Star className="size-4 mr-2" />
                          {snippet.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopy(snippet.code, snippet.id)}>
                          <Copy className="size-4 mr-2" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(snippet.id)}
                        >
                          <Trash2 className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Code Preview */}
                <div
                  className={cn(
                    "bg-muted/50 border-t overflow-hidden transition-all",
                    isExpanded ? "max-h-[500px]" : "max-h-32"
                  )}
                >
                  <pre className="p-4 text-sm overflow-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                {snippet.code.split("\n").length > 5 && (
                  <button
                    onClick={() => setExpandedSnippet(isExpanded ? null : snippet.id)}
                    className="w-full py-2 text-sm text-muted-foreground hover:bg-muted/50 border-t"
                  >
                    {isExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingSnippet ? "Edit Snippet" : "New Snippet"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 overflow-auto flex-1">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., React useState Hook"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(v) => setFormData({ ...formData, language: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => {
                      const LangIcon = lang.icon
                      return (
                        <SelectItem key={lang.id} value={lang.id}>
                          <span className="flex items-center gap-2">
                            <LangIcon className="size-4" />
                            {lang.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Folder</Label>
                <Select
                  value={formData.folder}
                  onValueChange={(v) => setFormData({ ...formData, folder: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder} value={folder}>
                        {folder}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <span className="text-muted-foreground">&times;</span>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={formData.newTag}
                  onChange={(e) => setFormData({ ...formData, newTag: e.target.value })}
                  placeholder="Add tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="Paste your code here..."
                className="font-mono text-sm flex-1 min-h-[200px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title.trim() || !formData.code.trim()}>
                {editingSnippet ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
