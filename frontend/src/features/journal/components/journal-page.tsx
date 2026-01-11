import { useState } from "react"
import { Plus, Calendar, Smile, Meh, Frown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { OrangeLogo } from "@/components/common/orange-logo"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface JournalEntry {
  id: string
  date: string // ISO date string
  mood: "great" | "good" | "okay" | "bad"
  content: string
  gratitude: string[]
  wins: string[]
  lessons: string[]
}

const moodConfig = {
  great: { icon: Sparkles, label: "Great", color: "text-yellow-500 bg-yellow-100" },
  good: { icon: Smile, label: "Good", color: "text-green-500 bg-green-100" },
  okay: { icon: Meh, label: "Okay", color: "text-blue-500 bg-blue-100" },
  bad: { icon: Frown, label: "Bad", color: "text-red-500 bg-red-100" },
}

const prompts = [
  "What's on your mind today?",
  "What made today meaningful?",
  "What are you grateful for?",
  "What did you learn today?",
  "What's one thing you want to improve?",
]

const initialEntries: JournalEntry[] = [
  {
    id: "1",
    date: new Date().toISOString().split("T")[0],
    mood: "good",
    content: "Had a productive day working on the new features. Finally figured out that tricky bug that's been bothering me for days.",
    gratitude: ["Good health", "Supportive team", "Morning coffee"],
    wins: ["Fixed the authentication bug", "Completed 3 tasks"],
    lessons: ["Take breaks more often", "Write tests first"],
  },
  {
    id: "2",
    date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    mood: "great",
    content: "Amazing day! Got positive feedback from a potential investor. Feeling motivated to push forward.",
    gratitude: ["Opportunity", "Growth mindset"],
    wins: ["Successful pitch meeting", "New partnership lead"],
    lessons: ["Preparation pays off"],
  },
  {
    id: "3",
    date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
    mood: "okay",
    content: "Slow day. Struggled with focus but managed to get some work done. Need to figure out better routines.",
    gratitude: ["Another day to try"],
    wins: ["Showed up despite low energy"],
    lessons: ["Sleep is important", "Don't be too hard on yourself"],
  },
]

export function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [currentPrompt] = useState(() => prompts[Math.floor(Math.random() * prompts.length)])
  const [formData, setFormData] = useState({
    mood: "good" as JournalEntry["mood"],
    content: "",
    gratitude: "",
    wins: "",
    lessons: "",
  })

  const today = new Date().toISOString().split("T")[0]
  const hasEntryToday = entries.some((e) => e.date === today)

  const handleCreate = () => {
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      date: today,
      mood: formData.mood,
      content: formData.content,
      gratitude: formData.gratitude.split("\n").filter(Boolean),
      wins: formData.wins.split("\n").filter(Boolean),
      lessons: formData.lessons.split("\n").filter(Boolean),
    }
    setEntries((prev) => [newEntry, ...prev])
    setIsDialogOpen(false)
    setFormData({ mood: "good", content: "", gratitude: "", wins: "", lessons: "" })
  }

  const viewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(Date.now() - 86400000)

    if (dateStr === today.toISOString().split("T")[0]) return "Today"
    if (dateStr === yesterday.toISOString().split("T")[0]) return "Yesterday"
    return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })
  }

  // Get mood distribution for the last 7 days
  const moodDistribution = entries.slice(0, 7).reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrangeLogo className="size-8" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
            <p className="text-sm text-muted-foreground">Reflect, learn, and grow</p>
          </div>
        </div>
        {!hasEntryToday && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="size-4 mr-2" />
            Write Today
          </Button>
        )}
      </div>

      {/* Mood Summary */}
      <div className="rounded-lg border bg-card p-6">
        <h2 className="font-semibold mb-4">Last 7 Days</h2>
        <div className="flex gap-4">
          {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map((mood) => {
            const config = moodConfig[mood]
            const count = moodDistribution[mood] || 0
            const Icon = config.icon

            return (
              <div key={mood} className="flex items-center gap-2">
                <div className={cn("size-8 rounded-full flex items-center justify-center", config.color)}>
                  <Icon className="size-4" />
                </div>
                <span className="text-sm font-medium">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Prompt */}
      {!hasEntryToday && (
        <div
          className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setIsDialogOpen(true)}
        >
          <p className="text-lg font-medium">{currentPrompt}</p>
          <p className="text-sm text-muted-foreground mt-1">Click to start writing...</p>
        </div>
      )}

      {/* Entries */}
      <div className="flex flex-col gap-4">
        {entries.map((entry) => {
          const MoodIcon = moodConfig[entry.mood].icon
          const moodColor = moodConfig[entry.mood].color

          return (
            <div
              key={entry.id}
              className="rounded-lg border bg-card p-4 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => viewEntry(entry)}
            >
              <div className="flex items-start gap-4">
                <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", moodColor)}>
                  <MoodIcon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{formatDate(entry.date)}</span>
                    <span className="text-sm text-muted-foreground">{moodConfig[entry.mood].label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    {entry.wins.length > 0 && <span>{entry.wins.length} wins</span>}
                    {entry.gratitude.length > 0 && <span>{entry.gratitude.length} gratitudes</span>}
                    {entry.lessons.length > 0 && <span>{entry.lessons.length} lessons</span>}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {entries.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No entries yet</h3>
          <p className="text-muted-foreground">Start journaling to track your journey</p>
        </div>
      )}

      {/* New Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Today's Entry</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>How are you feeling?</Label>
              <div className="flex gap-2">
                {(Object.keys(moodConfig) as Array<keyof typeof moodConfig>).map((mood) => {
                  const config = moodConfig[mood]
                  const Icon = config.icon

                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setFormData({ ...formData, mood })}
                      className={cn(
                        "flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all",
                        formData.mood === mood
                          ? "border-primary bg-primary/5"
                          : "border-transparent hover:bg-muted"
                      )}
                    >
                      <div className={cn("size-8 rounded-full flex items-center justify-center", config.color)}>
                        <Icon className="size-4" />
                      </div>
                      <span className="text-xs">{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content">What's on your mind?</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write freely..."
                rows={4}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="wins">Wins (one per line)</Label>
              <Textarea
                id="wins"
                value={formData.wins}
                onChange={(e) => setFormData({ ...formData, wins: e.target.value })}
                placeholder="What went well today?"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="gratitude">Gratitude (one per line)</Label>
              <Textarea
                id="gratitude"
                value={formData.gratitude}
                onChange={(e) => setFormData({ ...formData, gratitude: e.target.value })}
                placeholder="What are you grateful for?"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="lessons">Lessons (one per line)</Label>
              <Textarea
                id="lessons"
                value={formData.lessons}
                onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                placeholder="What did you learn?"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.content.trim()}>
                Save Entry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Entry Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {formatDate(selectedEntry.date)}
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    moodConfig[selectedEntry.mood].color
                  )}>
                    {moodConfig[selectedEntry.mood].label}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                <p className="text-sm">{selectedEntry.content}</p>

                {selectedEntry.wins.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Wins</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {selectedEntry.wins.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {selectedEntry.gratitude.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Gratitude</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {selectedEntry.gratitude.map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                )}

                {selectedEntry.lessons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Lessons</h4>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {selectedEntry.lessons.map((l, i) => <li key={i}>{l}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
