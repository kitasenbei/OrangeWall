import { useState } from "react"
import { RefreshCw, Heart, Plus, Trash2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const defaultAffirmations = [
  "I am capable of achieving my goals",
  "I choose to be happy and grateful today",
  "I am worthy of love and respect",
  "I trust myself and my abilities",
  "I am getting stronger every day",
  "I embrace challenges as opportunities to grow",
  "I am in control of my thoughts and emotions",
  "I deserve success and happiness",
  "I am confident in who I am",
  "Today is going to be a great day",
  "I am surrounded by love and support",
  "I believe in my dreams and my ability to achieve them",
]

export function AffirmationsPage() {
  const [affirmations, setAffirmations] = useState(defaultAffirmations)
  const [current, setCurrent] = useState(() => affirmations[Math.floor(Math.random() * affirmations.length)])
  const [favorites, setFavorites] = useState<string[]>([])
  const [newAffirmation, setNewAffirmation] = useState("")
  const [view, setView] = useState<"daily" | "all" | "favorites">("daily")

  const shuffle = () => {
    const available = affirmations.filter(a => a !== current)
    setCurrent(available[Math.floor(Math.random() * available.length)])
  }

  const toggleFavorite = (affirmation: string) => {
    setFavorites(prev => prev.includes(affirmation) ? prev.filter(f => f !== affirmation) : [...prev, affirmation])
  }

  const addAffirmation = () => {
    if (newAffirmation.trim() && !affirmations.includes(newAffirmation.trim())) {
      setAffirmations([...affirmations, newAffirmation.trim()])
      setNewAffirmation("")
    }
  }

  const deleteAffirmation = (affirmation: string) => {
    setAffirmations(affirmations.filter(a => a !== affirmation))
    setFavorites(favorites.filter(f => f !== affirmation))
    if (current === affirmation) shuffle()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Affirmations</h1><p className="text-sm text-muted-foreground">Positive thoughts for a better day</p></div>
        <div className="flex gap-2">
          <Button variant={view === "daily" ? "default" : "outline"} size="sm" onClick={() => setView("daily")}>Daily</Button>
          <Button variant={view === "all" ? "default" : "outline"} size="sm" onClick={() => setView("all")}>All</Button>
          <Button variant={view === "favorites" ? "default" : "outline"} size="sm" onClick={() => setView("favorites")}>Favorites</Button>
        </div>
      </div>

      {view === "daily" && (
        <div className="flex flex-col items-center py-12">
          <Sparkles className="size-12 text-yellow-500 mb-6" />
          <p className="text-2xl md:text-3xl font-medium text-center max-w-2xl leading-relaxed mb-8">"{current}"</p>
          <div className="flex gap-3">
            <Button onClick={shuffle}><RefreshCw className="size-4 mr-2" />New Affirmation</Button>
            <Button variant="outline" onClick={() => toggleFavorite(current)}>
              <Heart className={`size-4 mr-2 ${favorites.includes(current) ? "fill-red-500 text-red-500" : ""}`} />
              {favorites.includes(current) ? "Favorited" : "Favorite"}
            </Button>
          </div>
        </div>
      )}

      {view !== "daily" && (
        <>
          <div className="flex gap-2">
            <Input value={newAffirmation} onChange={e => setNewAffirmation(e.target.value)} placeholder="Add your own affirmation..." onKeyDown={e => e.key === "Enter" && addAffirmation()} />
            <Button onClick={addAffirmation}><Plus className="size-4" /></Button>
          </div>

          <div className="space-y-2">
            {(view === "favorites" ? affirmations.filter(a => favorites.includes(a)) : affirmations).map(affirmation => (
              <div key={affirmation} className="flex items-center gap-3 bg-card border rounded-lg p-3 group">
                <button onClick={() => toggleFavorite(affirmation)}>
                  <Heart className={`size-4 ${favorites.includes(affirmation) ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                </button>
                <span className="flex-1">{affirmation}</span>
                <Button size="icon" variant="ghost" onClick={() => setCurrent(affirmation)} className="opacity-0 group-hover:opacity-100">
                  <Sparkles className="size-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deleteAffirmation(affirmation)} className="opacity-0 group-hover:opacity-100">
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>

          {view === "favorites" && favorites.length === 0 && (
            <p className="text-center py-8 text-muted-foreground">No favorites yet. Heart some affirmations!</p>
          )}
        </>
      )}
    </div>
  )
}
