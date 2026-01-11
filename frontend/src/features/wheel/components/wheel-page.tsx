import { useState } from "react"
import { Play, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9"]

export function WheelPage() {
  const [items, setItems] = useState(["Pizza", "Sushi", "Tacos", "Burger", "Pasta", "Salad"])
  const [newItem, setNewItem] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<string | null>(null)

  const addItem = () => {
    if (newItem.trim() && items.length < 12) {
      setItems([...items, newItem.trim()])
      setNewItem("")
    }
  }

  const removeItem = (index: number) => {
    if (items.length > 2) setItems(items.filter((_, i) => i !== index))
  }

  const spin = () => {
    if (spinning || items.length < 2) return
    setSpinning(true)
    setResult(null)
    const spins = 5 + Math.random() * 5
    const newRotation = rotation + spins * 360 + Math.random() * 360
    setRotation(newRotation)

    setTimeout(() => {
      const normalizedRotation = newRotation % 360
      const segmentAngle = 360 / items.length
      const winningIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) % 360 / segmentAngle) % items.length
      setResult(items[winningIndex])
      setSpinning(false)
    }, 4000)
  }

  const segmentAngle = 360 / items.length

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Spin the Wheel</h1><p className="text-sm text-muted-foreground">Let fate decide for you</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-primary" />
            <svg viewBox="0 0 200 200" className="w-72 h-72 transition-transform duration-[4000ms] ease-out" style={{ transform: `rotate(${rotation}deg)` }}>
              {items.map((item, i) => {
                const startAngle = i * segmentAngle - 90
                const endAngle = (i + 1) * segmentAngle - 90
                const x1 = 100 + 95 * Math.cos(startAngle * Math.PI / 180)
                const y1 = 100 + 95 * Math.sin(startAngle * Math.PI / 180)
                const x2 = 100 + 95 * Math.cos(endAngle * Math.PI / 180)
                const y2 = 100 + 95 * Math.sin(endAngle * Math.PI / 180)
                const largeArc = segmentAngle > 180 ? 1 : 0
                const textAngle = startAngle + segmentAngle / 2
                const textX = 100 + 60 * Math.cos(textAngle * Math.PI / 180)
                const textY = 100 + 60 * Math.sin(textAngle * Math.PI / 180)
                return (
                  <g key={i}>
                    <path d={`M100,100 L${x1},${y1} A95,95 0 ${largeArc},1 ${x2},${y2} Z`} fill={colors[i % colors.length]} stroke="white" strokeWidth="2" />
                    <text x={textX} y={textY} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="bold" transform={`rotate(${textAngle + 90}, ${textX}, ${textY})`}>
                      {item.length > 8 ? item.slice(0, 8) + "…" : item}
                    </text>
                  </g>
                )
              })}
              <circle cx="100" cy="100" r="15" fill="white" stroke="#333" strokeWidth="2" />
            </svg>
          </div>

          <Button onClick={spin} disabled={spinning || items.length < 2} size="lg" className="mt-4">
            <Play className="size-5 mr-2" />{spinning ? "Spinning..." : "Spin!"}
          </Button>

          {result && (
            <div className="mt-4 text-center p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-muted-foreground">Winner:</p>
              <p className="text-2xl font-bold">{result}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add option..." onKeyDown={e => e.key === "Enter" && addItem()} />
            <Button onClick={addItem} disabled={items.length >= 12}><Plus className="size-4" /></Button>
          </div>

          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border rounded-lg px-3 py-2">
                <div className="size-4 rounded" style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="flex-1">{item}</span>
                <Button size="icon" variant="ghost" onClick={() => removeItem(i)} disabled={items.length <= 2}><Trash2 className="size-4" /></Button>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{items.length}/12 options</p>
        </div>
      </div>
    </div>
  )
}
