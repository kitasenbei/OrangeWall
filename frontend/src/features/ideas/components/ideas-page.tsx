import { useState } from "react"
import { Plus, Lightbulb, Star, TrendingUp, Clock, Check, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

interface Idea {
  id: string
  title: string
  description: string
  problem: string
  solution: string
  category: "product" | "service" | "content" | "side-project" | "improvement"
  status: "raw" | "researching" | "validated" | "building" | "parked"
  potential: 1 | 2 | 3 | 4 | 5
  effort: "low" | "medium" | "high"
  notes: string
  createdAt: Date
  updatedAt: Date
}

const categoryConfig = {
  product: { label: "Product", color: "bg-blue-500" },
  service: { label: "Service", color: "bg-green-500" },
  content: { label: "Content", color: "bg-purple-500" },
  "side-project": { label: "Side Project", color: "bg-orange-500" },
  improvement: { label: "Improvement", color: "bg-gray-500" },
}

const statusConfig = {
  raw: { label: "Raw", color: "bg-gray-400" },
  researching: { label: "Researching", color: "bg-blue-400" },
  validated: { label: "Validated", color: "bg-green-400" },
  building: { label: "Building", color: "bg-purple-400" },
  parked: { label: "Parked", color: "bg-gray-400" },
}

const effortConfig = {
  low: { label: "Low Effort", color: "text-green-600" },
  medium: { label: "Medium Effort", color: "text-yellow-600" },
  high: { label: "High Effort", color: "text-red-600" },
}

const initialIdeas: Idea[] = [
  {
    id: "1",
    title: "AI Writing Assistant for Founders",
    description: "A tool that helps founders write investor updates, pitch decks, and customer emails using AI",
    problem: "Founders spend too much time on writing tasks that take away from building",
    solution: "AI-powered templates and suggestions tailored to startup communication",
    category: "product",
    status: "researching",
    potential: 4,
    effort: "high",
    notes: "Market research shows strong demand. Need to differentiate from existing tools.",
    createdAt: new Date(Date.now() - 604800000),
    updatedAt: new Date(Date.now() - 86400000),
  },
  {
    id: "2",
    title: "Startup Expense Tracker",
    description: "Simple expense tracking built specifically for early-stage startups",
    problem: "Existing tools are too complex or expensive for bootstrapped startups",
    solution: "Minimal, free tier focused expense tracker with runway calculations",
    category: "product",
    status: "validated",
    potential: 3,
    effort: "medium",
    notes: "Talked to 10 founders, 8 said they'd use this. Start with MVP.",
    createdAt: new Date(Date.now() - 1209600000),
    updatedAt: new Date(Date.now() - 172800000),
  },
  {
    id: "3",
    title: "Weekly Newsletter on Indie Hacking",
    description: "Curated newsletter sharing lessons from building in public",
    problem: "Too much noise, hard to find actionable startup advice",
    solution: "Weekly digest with one deep insight and curated resources",
    category: "content",
    status: "building",
    potential: 2,
    effort: "low",
    notes: "Started with 50 subscribers. Growing organically.",
    createdAt: new Date(Date.now() - 2592000000),
    updatedAt: new Date(),
  },
  {
    id: "4",
    title: "Local Business Directory App",
    description: "Hyperlocal business discovery with reviews from real neighbors",
    problem: "Yelp and Google are full of fake reviews",
    solution: "Verified local reviews with neighborhood focus",
    category: "side-project",
    status: "parked",
    potential: 3,
    effort: "high",
    notes: "Good idea but too ambitious for now. Revisit later.",
    createdAt: new Date(Date.now() - 5184000000),
    updatedAt: new Date(Date.now() - 2592000000),
  },
]

export function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problem: "",
    solution: "",
    category: "product" as Idea["category"],
    potential: 3 as Idea["potential"],
    effort: "medium" as Idea["effort"],
    notes: "",
  })

  const filteredIdeas = ideas
    .filter((idea) => !selectedStatus || idea.status === selectedStatus)
    .sort((a, b) => {
      // Sort by potential (high first), then by effort (low first)
      if (a.potential !== b.potential) return b.potential - a.potential
      const effortOrder = { low: 0, medium: 1, high: 2 }
      return effortOrder[a.effort] - effortOrder[b.effort]
    })

  const handleCreate = () => {
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      ...formData,
      status: "raw",
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setIdeas((prev) => [newIdea, ...prev])
    setIsDialogOpen(false)
    setFormData({
      title: "",
      description: "",
      problem: "",
      solution: "",
      category: "product",
      potential: 3,
      effort: "medium",
      notes: "",
    })
  }

  const handleDelete = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  const handleStatusChange = (id: string, status: Idea["status"]) => {
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status, updatedAt: new Date() } : i))
    )
  }

  const topIdeas = ideas
    .filter((i) => i.status !== "parked")
    .sort((a, b) => b.potential - a.potential)
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ideas Vault</h1>
          <p className="text-muted-foreground">Capture, validate, and prioritize ideas</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          New Idea
        </Button>
      </div>

      {/* Top Ideas */}
      {topIdeas.length > 0 && (
        <div className="rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="size-4" />
            Top Ideas by Potential
          </h2>
          <div className="flex flex-wrap gap-2">
            {topIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-lg px-3 py-2 border shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedIdea(idea)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{idea.title}</span>
                  <div className="flex">
                    {[...Array(idea.potential)].map((_, i) => (
                      <Star key={i} className="size-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Ideas Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => setSelectedIdea(idea)}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 text-yellow-500" />
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded text-white",
                  categoryConfig[idea.category].color
                )}>
                  {categoryConfig[idea.category].label}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(idea.id, "researching") }}>
                    Research
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(idea.id, "validated") }}>
                    <Check className="size-4 mr-2" />
                    Validate
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(idea.id, "parked") }}>
                    <Clock className="size-4 mr-2" />
                    Park
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => { e.stopPropagation(); handleDelete(idea.id) }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-medium mb-1">{idea.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{idea.description}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded",
                  statusConfig[idea.status].color,
                  "text-white"
                )}>
                  {statusConfig[idea.status].label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "size-3",
                        i < idea.potential
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
                <span className={cn("text-xs", effortConfig[idea.effort].color)}>
                  {idea.effort}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredIdeas.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Lightbulb className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No ideas yet</h3>
          <p className="text-muted-foreground">Capture your first idea to start the vault</p>
        </div>
      )}

      {/* New Idea Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>New Idea</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="The big idea..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What is this idea about?"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="problem">Problem</Label>
              <Textarea
                id="problem"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                placeholder="What problem does this solve?"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="solution">Solution</Label>
              <Textarea
                id="solution"
                value={formData.solution}
                onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                placeholder="How would you solve it?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v as Idea["category"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Potential</Label>
                <Select
                  value={formData.potential.toString()}
                  onValueChange={(v) => setFormData({ ...formData, potential: Number(v) as Idea["potential"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} Star{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Effort</Label>
                <Select
                  value={formData.effort}
                  onValueChange={(v) => setFormData({ ...formData, effort: v as Idea["effort"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional thoughts..."
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.title.trim()}>
                Save Idea
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Idea Dialog */}
      <Dialog open={!!selectedIdea} onOpenChange={() => setSelectedIdea(null)}>
        <DialogContent className="max-w-lg">
          {selectedIdea && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Lightbulb className="size-5 text-yellow-500" />
                  {selectedIdea.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded text-white",
                    categoryConfig[selectedIdea.category].color
                  )}>
                    {categoryConfig[selectedIdea.category].label}
                  </span>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded text-white",
                    statusConfig[selectedIdea.status].color
                  )}>
                    {statusConfig[selectedIdea.status].label}
                  </span>
                  <div className="flex ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < selectedIdea.potential
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm">{selectedIdea.description}</p>

                {selectedIdea.problem && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Problem</h4>
                    <p className="text-sm text-muted-foreground">{selectedIdea.problem}</p>
                  </div>
                )}

                {selectedIdea.solution && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Solution</h4>
                    <p className="text-sm text-muted-foreground">{selectedIdea.solution}</p>
                  </div>
                )}

                {selectedIdea.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedIdea.notes}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Select
                    value={selectedIdea.status}
                    onValueChange={(v) => {
                      handleStatusChange(selectedIdea.id, v as Idea["status"])
                      setSelectedIdea({ ...selectedIdea, status: v as Idea["status"] })
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground">
                  Last updated: {selectedIdea.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
