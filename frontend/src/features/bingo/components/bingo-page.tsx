import { useState } from "react"
import { Shuffle, RotateCcw, Download, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const defaultItems = [
  "Someone's on mute", "Background noise", "Can you see my screen?", "You're on mute",
  "Connection issues", "Sorry, go ahead", "Can everyone hear me?", "Let's take this offline",
  "I'll send a follow-up email", "Technical difficulties", "Can you repeat that?", "FREE",
  "Who just joined?", "Sorry I'm late", "Let me share my screen", "Any questions?",
  "We're running short on time", "I have a hard stop", "Circle back", "Synergy",
  "Low-hanging fruit", "Move the needle", "Pet/kid cameo", "Echo on the call", "Action items"
]

export function BingoPage() {
  const [items, setItems] = useState(defaultItems.join("\n"))
  const [board, setBoard] = useState<string[]>([])
  const [marked, setMarked] = useState<Set<number>>(new Set())
  const [bingo, setBingo] = useState(false)

  const generateBoard = () => {
    const itemList = items.split("\n").map(i => i.trim()).filter(Boolean)
    if (itemList.length < 24) {
      alert("Need at least 24 items (center is free)")
      return
    }
    const shuffled = [...itemList].sort(() => Math.random() - 0.5).slice(0, 24)
    shuffled.splice(12, 0, "FREE")
    setBoard(shuffled)
    setMarked(new Set([12])) // Center is free
    setBingo(false)
  }

  const toggleCell = (index: number) => {
    if (index === 12) return // Can't unmark free space
    const newMarked = new Set(marked)
    if (newMarked.has(index)) newMarked.delete(index)
    else newMarked.add(index)
    setMarked(newMarked)
    checkBingo(newMarked)
  }

  const checkBingo = (marked: Set<number>) => {
    const lines = [
      [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24], // rows
      [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24], // cols
      [0, 6, 12, 18, 24], [4, 8, 12, 16, 20] // diagonals
    ]
    const hasBingo = lines.some(line => line.every(i => marked.has(i)))
    setBingo(hasBingo)
  }

  const resetBoard = () => {
    setMarked(new Set([12]))
    setBingo(false)
  }

  const downloadBoard = () => {
    const text = board.map((item, i) => `${i % 5 === 0 && i > 0 ? "\n" : ""}[${marked.has(i) ? "X" : " "}] ${item}`).join("\t")
    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "bingo-card.txt"; a.click()
  }

  const presets = {
    "Meeting Bingo": defaultItems,
    "Travel Bingo": ["License plate game", "Rest stop", "Fast food", "Gas station", "Billboard ad", "Construction zone", "Police car", "Motorcycle", "RV/Camper", "Semi truck", "State line", "FREE", "Toll booth", "Speed limit change", "Someone sleeping", "Snack break", "Phone charging", "Music debate", "Are we there yet?", "Wrong turn", "Traffic jam", "Beautiful view", "Road work ahead", "Wildlife crossing", "Exit confusion"],
    "Holiday Bingo": ["Gift wrapping", "Holiday music", "Ugly sweater", "Hot cocoa", "Fireplace", "Snow", "Cookies", "Family photo", "Holiday movie", "Decorations", "Gift exchange", "FREE", "Holiday dinner", "Relatives asking questions", "Holiday cards", "Shopping", "Travel delays", "Leftovers", "New Year's resolutions", "Countdown", "Champagne toast", "Fireworks", "Holiday lights", "Carol singing", "Secret Santa"],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Bingo Generator</h1><p className="text-sm text-muted-foreground">Create custom bingo cards</p></div>
        <div className="flex gap-2">
          {board.length > 0 && (
            <>
              <Button variant="outline" onClick={resetBoard}><RotateCcw className="size-4 mr-2" />Reset</Button>
              <Button variant="outline" onClick={downloadBoard}><Download className="size-4 mr-2" />Export</Button>
            </>
          )}
          <Button onClick={generateBoard}><Shuffle className="size-4 mr-2" />Generate</Button>
        </div>
      </div>

      {bingo && (
        <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 flex items-center gap-3">
          <Trophy className="size-6 text-yellow-500" />
          <span className="font-bold text-lg">BINGO!</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.keys(presets).map(name => (
              <Button key={name} variant="outline" size="sm" onClick={() => setItems(presets[name as keyof typeof presets].join("\n"))}>{name}</Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Bingo Items (one per line, need 24+)</Label>
            <Textarea value={items} onChange={e => setItems(e.target.value)} rows={12} placeholder="Enter bingo items..." />
            <p className="text-xs text-muted-foreground">{items.split("\n").filter(i => i.trim()).length} items</p>
          </div>
        </div>

        {board.length > 0 && (
          <div className="space-y-2">
            <Label>Your Bingo Card</Label>
            <div className="grid grid-cols-5 gap-1">
              {["B", "I", "N", "G", "O"].map(letter => (
                <div key={letter} className="bg-primary text-primary-foreground text-center py-2 font-bold rounded-t-lg">{letter}</div>
              ))}
              {board.map((item, i) => (
                <button key={i} onClick={() => toggleCell(i)} className={`aspect-square p-1 text-xs sm:text-sm border rounded-lg flex items-center justify-center text-center transition-colors ${marked.has(i) ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"} ${i === 12 ? "font-bold" : ""}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {board.length === 0 && <p className="text-center py-8 text-muted-foreground">Add items and click Generate to create your bingo card</p>}
    </div>
  )
}
