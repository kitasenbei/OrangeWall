import { useState } from "react"
import {
  Plus,
  Quote,
  Heart,
  Copy,
  Check,
  Shuffle,
  Trash2,
  Pencil,
  MoreVertical,
  Search,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { cn } from "@/lib/utils"

interface QuoteItem {
  id: string
  text: string
  author: string
  source: string
  favorite: boolean
  tags: string[]
}

const suggestedTags = ["Motivation", "Life", "Success", "Love", "Wisdom", "Funny", "Business", "Philosophy"]

const initialQuotes: QuoteItem[] = [
  {
    id: "1",
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    source: "Stanford Commencement Speech",
    favorite: true,
    tags: ["Motivation", "Success"],
  },
  {
    id: "2",
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    source: "",
    favorite: false,
    tags: ["Wisdom", "Motivation"],
  },
  {
    id: "3",
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Chinese Proverb",
    source: "",
    favorite: true,
    tags: ["Wisdom", "Life"],
  },
  {
    id: "4",
    text: "Stay hungry, stay foolish.",
    author: "Steve Jobs",
    source: "Stanford Commencement Speech",
    favorite: true,
    tags: ["Motivation"],
  },
  {
    id: "5",
    text: "The only thing we have to fear is fear itself.",
    author: "Franklin D. Roosevelt",
    source: "Inaugural Address",
    favorite: false,
    tags: ["Wisdom", "Life"],
  },
]

export function QuotesPage() {
  const [quotes, setQuotes] = useState<QuoteItem[]>(initialQuotes)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<QuoteItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [randomQuote, setRandomQuote] = useState<QuoteItem | null>(null)
  const [copied, setCopied] = useState(false)

  // Form state
  const [text, setText] = useState("")
  const [author, setAuthor] = useState("")
  const [source, setSource] = useState("")
  const [tags, setTags] = useState<string[]>([])

  const filteredQuotes = quotes.filter(q => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!q.text.toLowerCase().includes(query) &&
          !q.author.toLowerCase().includes(query)) return false
    }
    if (showFavoritesOnly && !q.favorite) return false
    return true
  })

  const handleSave = () => {
    if (!text.trim()) return

    if (editingQuote) {
      setQuotes(prev => prev.map(q =>
        q.id === editingQuote.id
          ? { ...q, text, author, source, tags }
          : q
      ))
    } else {
      const newQuote: QuoteItem = {
        id: Date.now().toString(),
        text,
        author: author || "Unknown",
        source,
        favorite: false,
        tags,
      }
      setQuotes(prev => [newQuote, ...prev])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => {
    setText("")
    setAuthor("")
    setSource("")
    setTags([])
    setEditingQuote(null)
  }

  const openEdit = (quote: QuoteItem) => {
    setEditingQuote(quote)
    setText(quote.text)
    setAuthor(quote.author)
    setSource(quote.source)
    setTags(quote.tags)
    setDialogOpen(true)
  }

  const toggleFavorite = (id: string) => {
    setQuotes(prev => prev.map(q =>
      q.id === id ? { ...q, favorite: !q.favorite } : q
    ))
  }

  const deleteQuote = (id: string) => {
    setQuotes(prev => prev.filter(q => q.id !== id))
  }

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const getRandomQuote = () => {
    const idx = Math.floor(Math.random() * quotes.length)
    setRandomQuote(quotes[idx])
  }

  const copyQuote = async (quote: QuoteItem) => {
    const text = `"${quote.text}" — ${quote.author}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quotes</h1>
          <p className="text-sm text-muted-foreground">Your collection of inspiring quotes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={getRandomQuote}>
            <Shuffle className="size-4 mr-2" />
            Random
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="size-4 mr-2" />
                Add Quote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingQuote ? "Edit Quote" : "Add Quote"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Quote</Label>
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter the quote..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Who said it?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Source (optional)</Label>
                    <Input
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="Book, speech, etc."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "px-3 py-1 rounded-full text-sm transition-colors",
                          tags.includes(tag)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full">
                  {editingQuote ? "Save Changes" : "Add Quote"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Random Quote Display */}
      {randomQuote && (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Sparkles className="size-6 text-primary shrink-0 mt-1" />
            <div className="flex-1">
              <blockquote className="text-lg italic mb-2">"{randomQuote.text}"</blockquote>
              <p className="text-sm text-muted-foreground">— {randomQuote.author}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => copyQuote(randomQuote)}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Quote className="size-4" />
            <span className="text-sm">Total Quotes</span>
          </div>
          <span className="text-2xl font-semibold">{quotes.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Heart className="size-4" />
            <span className="text-sm">Favorites</span>
          </div>
          <span className="text-2xl font-semibold">{quotes.filter(q => q.favorite).length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Sparkles className="size-4" />
            <span className="text-sm">Authors</span>
          </div>
          <span className="text-2xl font-semibold">
            {new Set(quotes.map(q => q.author)).size}
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quotes..."
            className="pl-9"
          />
        </div>
        <Button
          variant={showFavoritesOnly ? "secondary" : "outline"}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        >
          <Heart className="size-4 mr-2" />
          Favorites
        </Button>
      </div>

      {/* Quotes List */}
      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <div
            key={quote.id}
            className="bg-card border rounded-lg p-5"
          >
            <div className="flex items-start gap-4">
              <Quote className="size-5 text-muted-foreground shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <blockquote className="text-base mb-2">"{quote.text}"</blockquote>
                <p className="text-sm text-muted-foreground">
                  — {quote.author}
                  {quote.source && <span className="opacity-70">, {quote.source}</span>}
                </p>
                {quote.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {quote.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-muted rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavorite(quote.id)}
                >
                  <Heart className={cn(
                    "size-4",
                    quote.favorite && "fill-red-500 text-red-500"
                  )} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyQuote(quote)}
                >
                  <Copy className="size-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(quote)}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteQuote(quote.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Quote className="size-12 mx-auto mb-4 opacity-50" />
          <p>No quotes found</p>
          <p className="text-sm">Add some inspiring quotes to your collection</p>
        </div>
      )}
    </div>
  )
}
