import { useState, useMemo } from "react"
import {
  Plus,
  Trash2,
  Edit3,
  MoreVertical,
  Star,
  Clock,
  CheckCircle2,
  Eye,
  Film,
  Tv,
  Clapperboard,
  Search,
  SortAsc,
  Heart,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface WatchlistItem {
  id: string
  title: string
  type: "movie" | "tv" | "anime"
  status: "watchlist" | "watching" | "completed" | "dropped"
  rating?: number
  year?: number
  genre: string[]
  notes: string
  poster?: string
  dateAdded: Date
  dateCompleted?: Date
  currentEpisode?: number
  totalEpisodes?: number
  isFavorite: boolean
}

const mediaTypes: { value: WatchlistItem["type"]; label: string; icon: LucideIcon }[] = [
  { value: "movie", label: "Movie", icon: Film },
  { value: "tv", label: "TV Show", icon: Tv },
  { value: "anime", label: "Anime", icon: Clapperboard },
]

const statusOptions: { value: WatchlistItem["status"]; label: string; icon: LucideIcon }[] = [
  { value: "watchlist", label: "Watchlist", icon: Clock },
  { value: "watching", label: "Watching", icon: Eye },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
  { value: "dropped", label: "Dropped", icon: Trash2 },
]

const genres = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi",
  "Thriller", "Western", "Slice of Life", "Sports", "Music"
]

function generateMockWatchlist(): WatchlistItem[] {
  return [
    {
      id: "1",
      title: "Breaking Bad",
      type: "tv",
      status: "completed",
      rating: 10,
      year: 2008,
      genre: ["Drama", "Crime", "Thriller"],
      notes: "One of the best TV shows ever made",
      dateAdded: new Date(2023, 0, 1),
      dateCompleted: new Date(2023, 3, 15),
      currentEpisode: 62,
      totalEpisodes: 62,
      isFavorite: true,
    },
    {
      id: "2",
      title: "Inception",
      type: "movie",
      status: "completed",
      rating: 9,
      year: 2010,
      genre: ["Sci-Fi", "Action", "Thriller"],
      notes: "Mind-bending masterpiece by Nolan",
      dateAdded: new Date(2023, 1, 10),
      dateCompleted: new Date(2023, 1, 10),
      isFavorite: true,
    },
    {
      id: "3",
      title: "Attack on Titan",
      type: "anime",
      status: "watching",
      rating: undefined,
      year: 2013,
      genre: ["Action", "Drama", "Fantasy"],
      notes: "Currently on season 4",
      dateAdded: new Date(2023, 5, 1),
      currentEpisode: 75,
      totalEpisodes: 87,
      isFavorite: false,
    },
    {
      id: "4",
      title: "Dune: Part Two",
      type: "movie",
      status: "watchlist",
      year: 2024,
      genre: ["Sci-Fi", "Adventure", "Drama"],
      notes: "",
      dateAdded: new Date(2024, 0, 15),
      isFavorite: false,
    },
    {
      id: "5",
      title: "The Last of Us",
      type: "tv",
      status: "watching",
      year: 2023,
      genre: ["Drama", "Action", "Horror"],
      notes: "Based on the video game",
      dateAdded: new Date(2024, 0, 20),
      currentEpisode: 5,
      totalEpisodes: 9,
      isFavorite: false,
    },
    {
      id: "6",
      title: "Spirited Away",
      type: "anime",
      status: "completed",
      rating: 10,
      year: 2001,
      genre: ["Animation", "Fantasy", "Adventure"],
      notes: "Studio Ghibli masterpiece",
      dateAdded: new Date(2022, 6, 1),
      dateCompleted: new Date(2022, 6, 1),
      isFavorite: true,
    },
    {
      id: "7",
      title: "Severance",
      type: "tv",
      status: "watchlist",
      year: 2022,
      genre: ["Drama", "Mystery", "Sci-Fi"],
      notes: "Heard great things about it",
      dateAdded: new Date(2024, 1, 5),
      isFavorite: false,
    },
  ]
}

type ViewTab = "all" | "watchlist" | "watching" | "completed"

export function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>(generateMockWatchlist)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<WatchlistItem["type"] | "all">("all")
  const [filterGenre, _setFilterGenre] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"dateAdded" | "rating" | "title" | "year">("dateAdded")
  const [activeTab, setActiveTab] = useState<ViewTab>("all")

  const [formData, setFormData] = useState({
    title: "",
    type: "movie" as WatchlistItem["type"],
    status: "watchlist" as WatchlistItem["status"],
    rating: "",
    year: "",
    genre: [] as string[],
    notes: "",
    currentEpisode: "",
    totalEpisodes: "",
  })

  const filteredItems = useMemo(() => {
    let result = [...items]

    // Tab filter
    if (activeTab !== "all") {
      result = result.filter((item) => item.status === activeTab)
    }

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.genre.some((g) => g.toLowerCase().includes(query))
      )
    }

    // Type filter
    if (filterType !== "all") {
      result = result.filter((item) => item.type === filterType)
    }

    // Genre filter
    if (filterGenre) {
      result = result.filter((item) => item.genre.includes(filterGenre))
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "title":
          return a.title.localeCompare(b.title)
        case "year":
          return (b.year || 0) - (a.year || 0)
        case "dateAdded":
        default:
          return b.dateAdded.getTime() - a.dateAdded.getTime()
      }
    })

    // Favorites first
    result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0))

    return result
  }, [items, activeTab, searchQuery, filterType, filterGenre, sortBy])

  const stats = useMemo(() => {
    const total = items.length
    const watchlist = items.filter((i) => i.status === "watchlist").length
    const watching = items.filter((i) => i.status === "watching").length
    const completed = items.filter((i) => i.status === "completed").length
    const avgRating =
      items.filter((i) => i.rating).reduce((acc, i) => acc + (i.rating || 0), 0) /
        items.filter((i) => i.rating).length || 0

    return { total, watchlist, watching, completed, avgRating }
  }, [items])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      title: "",
      type: "movie",
      status: "watchlist",
      rating: "",
      year: "",
      genre: [],
      notes: "",
      currentEpisode: "",
      totalEpisodes: "",
    })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (item: WatchlistItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      type: item.type,
      status: item.status,
      rating: item.rating?.toString() || "",
      year: item.year?.toString() || "",
      genre: item.genre,
      notes: item.notes,
      currentEpisode: item.currentEpisode?.toString() || "",
      totalEpisodes: item.totalEpisodes?.toString() || "",
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (!formData.title.trim()) return

    if (editingItem) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                title: formData.title,
                type: formData.type,
                status: formData.status,
                rating: formData.rating ? parseInt(formData.rating) : undefined,
                year: formData.year ? parseInt(formData.year) : undefined,
                genre: formData.genre,
                notes: formData.notes,
                currentEpisode: formData.currentEpisode ? parseInt(formData.currentEpisode) : undefined,
                totalEpisodes: formData.totalEpisodes ? parseInt(formData.totalEpisodes) : undefined,
                dateCompleted: formData.status === "completed" && !item.dateCompleted ? new Date() : item.dateCompleted,
              }
            : item
        )
      )
    } else {
      const newItem: WatchlistItem = {
        id: crypto.randomUUID(),
        title: formData.title,
        type: formData.type,
        status: formData.status,
        rating: formData.rating ? parseInt(formData.rating) : undefined,
        year: formData.year ? parseInt(formData.year) : undefined,
        genre: formData.genre,
        notes: formData.notes,
        dateAdded: new Date(),
        currentEpisode: formData.currentEpisode ? parseInt(formData.currentEpisode) : undefined,
        totalEpisodes: formData.totalEpisodes ? parseInt(formData.totalEpisodes) : undefined,
        isFavorite: false,
      }
      setItems((prev) => [...prev, newItem])
    }
    setIsDialogOpen(false)
  }

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    )
  }

  const handleStatusChange = (id: string, status: WatchlistItem["status"]) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              dateCompleted: status === "completed" ? new Date() : item.dateCompleted,
            }
          : item
      )
    )
  }

  const getTypeIcon = (type: WatchlistItem["type"]) => {
    return mediaTypes.find((t) => t.value === type)?.icon || Film
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Watchlist</h1>
          <p className="text-muted-foreground">Track movies, TV shows, and anime</p>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="size-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total" value={stats.total.toString()} icon={Film} />
        <StatCard title="Watchlist" value={stats.watchlist.toString()} icon={Clock} />
        <StatCard title="Watching" value={stats.watching.toString()} icon={Eye} />
        <StatCard title="Completed" value={stats.completed.toString()} icon={CheckCircle2} />
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Star className="size-4" />
            <span className="text-sm">Avg Rating</span>
          </div>
          <span className="text-2xl font-bold">
            {stats.avgRating ? stats.avgRating.toFixed(1) : "—"}/10
          </span>
        </div>
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViewTab)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="watching">Watching</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-48"
              />
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {mediaTypes.map((type) => {
                  const TypeIcon = type.icon
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <TypeIcon className="size-4" />
                        {type.label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-36">
                <SortAsc className="size-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dateAdded">Date Added</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <Film className="size-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your filters"
                  : "Start adding movies and shows to track"}
              </p>
              {!searchQuery && filterType === "all" && (
                <Button onClick={handleOpenAdd}>
                  <Plus className="size-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredItems.map((item) => {
                const TypeIcon = getTypeIcon(item.type)
                const StatusIcon = statusOptions.find((s) => s.value === item.status)?.icon || Clock

                return (
                  <div
                    key={item.id}
                    className={cn(
                      "group rounded-lg border bg-card overflow-hidden transition-all hover:shadow-md",
                      item.status === "dropped" && "opacity-60"
                    )}
                  >
                    {/* Poster placeholder */}
                    <div className="aspect-[2/3] bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                      <TypeIcon className="size-16 text-muted-foreground/30" />
                      {item.isFavorite && (
                        <div className="absolute top-2 left-2">
                          <Heart className="size-5 fill-red-500 text-red-500" />
                        </div>
                      )}
                      {item.rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          <Star className="size-3 fill-yellow-400 text-yellow-400" />
                          {item.rating}
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="size-8 opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEdit(item)}>
                              <Edit3 className="size-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFavorite(item.id)}>
                              <Heart className="size-4 mr-2" />
                              {item.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {statusOptions.map((status) => {
                              const SIcon = status.icon
                              return (
                                <DropdownMenuItem
                                  key={status.value}
                                  onClick={() => handleStatusChange(item.id, status.value)}
                                  className={item.status === status.value ? "bg-muted" : ""}
                                >
                                  <SIcon className="size-4 mr-2" />
                                  {status.label}
                                </DropdownMenuItem>
                              )
                            })}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="size-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Badge variant="outline" className="gap-1">
                          <TypeIcon className="size-3" />
                          {mediaTypes.find((t) => t.value === item.type)?.label}
                        </Badge>
                        {item.year && <span>{item.year}</span>}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "gap-1",
                            item.status === "completed" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            item.status === "watching" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          )}
                        >
                          <StatusIcon className="size-3" />
                          {statusOptions.find((s) => s.value === item.status)?.label}
                        </Badge>
                        {item.type !== "movie" && item.currentEpisode !== undefined && (
                          <span className="text-muted-foreground text-xs">
                            Ep {item.currentEpisode}/{item.totalEpisodes || "?"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Item" : "Add to Watchlist"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as WatchlistItem["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypes.map((type) => {
                      const TypeIcon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <TypeIcon className="size-4" />
                            {type.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v as WatchlistItem["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => {
                      const SIcon = status.icon
                      return (
                        <SelectItem key={status.value} value={status.value}>
                          <span className="flex items-center gap-2">
                            <SIcon className="size-4" />
                            {status.label}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="2024"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="rating">Rating (1-10)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="—"
                />
              </div>
            </div>

            {formData.type !== "movie" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="currentEpisode">Current Episode</Label>
                  <Input
                    id="currentEpisode"
                    type="number"
                    value={formData.currentEpisode}
                    onChange={(e) => setFormData({ ...formData, currentEpisode: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="totalEpisodes">Total Episodes</Label>
                  <Input
                    id="totalEpisodes"
                    type="number"
                    value={formData.totalEpisodes}
                    onChange={(e) => setFormData({ ...formData, totalEpisodes: e.target.value })}
                    placeholder="?"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <Badge
                    key={genre}
                    variant={formData.genre.includes(genre) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        genre: formData.genre.includes(genre)
                          ? formData.genre.filter((g) => g !== genre)
                          : [...formData.genre, genre],
                      })
                    }}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add your thoughts..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!formData.title.trim()}>
                {editingItem ? "Save" : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
