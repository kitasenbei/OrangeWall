import { useState } from "react"
import {
  Dices,
  Coins,
  Shuffle,
  Hash,
  ListOrdered,
  Copy,
  Check,
  Plus,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type Tool = "dice" | "coin" | "number" | "picker" | "shuffle"

export function DicePage() {
  const [activeTool, setActiveTool] = useState<Tool>("dice")

  // Dice state
  const [diceCount, setDiceCount] = useState(2)
  const [diceSides, setDiceSides] = useState(6)
  const [diceResults, setDiceResults] = useState<number[]>([])

  // Coin state
  const [coinResult, setCoinResult] = useState<"heads" | "tails" | null>(null)
  const [coinFlipping, setCoinFlipping] = useState(false)

  // Number state
  const [minNum, setMinNum] = useState(1)
  const [maxNum, setMaxNum] = useState(100)
  const [randomNum, setRandomNum] = useState<number | null>(null)

  // Picker state
  const [pickerItems, setPickerItems] = useState<string[]>(["Option 1", "Option 2", "Option 3"])
  const [newItem, setNewItem] = useState("")
  const [pickedItem, setPickedItem] = useState<string | null>(null)

  // Shuffle state
  const [shuffleText, setShuffleText] = useState("Apple\nBanana\nCherry\nDate\nElderberry")
  const [shuffledList, setShuffledList] = useState<string[]>([])

  const [copied, setCopied] = useState(false)

  const rollDice = () => {
    const results: number[] = []
    for (let i = 0; i < diceCount; i++) {
      results.push(Math.floor(Math.random() * diceSides) + 1)
    }
    setDiceResults(results)
  }

  const flipCoin = () => {
    setCoinFlipping(true)
    setCoinResult(null)
    setTimeout(() => {
      setCoinResult(Math.random() < 0.5 ? "heads" : "tails")
      setCoinFlipping(false)
    }, 500)
  }

  const generateNumber = () => {
    const min = Math.min(minNum, maxNum)
    const max = Math.max(minNum, maxNum)
    setRandomNum(Math.floor(Math.random() * (max - min + 1)) + min)
  }

  const addPickerItem = () => {
    if (newItem.trim() && !pickerItems.includes(newItem.trim())) {
      setPickerItems([...pickerItems, newItem.trim()])
      setNewItem("")
    }
  }

  const removePickerItem = (item: string) => {
    setPickerItems(pickerItems.filter(i => i !== item))
  }

  const pickRandom = () => {
    if (pickerItems.length > 0) {
      const idx = Math.floor(Math.random() * pickerItems.length)
      setPickedItem(pickerItems[idx])
    }
  }

  const shuffleList = () => {
    const items = shuffleText.split("\n").filter(s => s.trim())
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setShuffledList(shuffled)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tools = [
    { id: "dice" as Tool, label: "Dice", icon: Dices },
    { id: "coin" as Tool, label: "Coin Flip", icon: Coins },
    { id: "number" as Tool, label: "Number", icon: Hash },
    { id: "picker" as Tool, label: "Picker", icon: ListOrdered },
    { id: "shuffle" as Tool, label: "Shuffle", icon: Shuffle },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Random Tools</h1>
        <p className="text-sm text-muted-foreground">Dice, coins, random numbers & more</p>
      </div>

      {/* Tool Selector */}
      <div className="flex flex-wrap gap-2">
        {tools.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeTool === id ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTool(id)}
          >
            <Icon className="size-4 mr-2" />
            {label}
          </Button>
        ))}
      </div>

      {/* Dice Tool */}
      {activeTool === "dice" && (
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Number of Dice</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sides per Die</Label>
              <Input
                type="number"
                min={2}
                max={100}
                value={diceSides}
                onChange={(e) => setDiceSides(Math.max(2, Math.min(100, parseInt(e.target.value) || 6)))}
              />
            </div>
          </div>

          <Button onClick={rollDice} className="w-full" size="lg">
            <Dices className="size-5 mr-2" />
            Roll {diceCount}d{diceSides}
          </Button>

          {diceResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 justify-center">
                {diceResults.map((result, i) => (
                  <div
                    key={i}
                    className="size-16 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-2xl font-bold"
                  >
                    {result}
                  </div>
                ))}
              </div>
              <div className="text-center text-lg">
                Total: <span className="font-bold">{diceResults.reduce((a, b) => a + b, 0)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Coin Flip Tool */}
      {activeTool === "coin" && (
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="flex justify-center">
            <div
              className={cn(
                "size-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl font-bold text-yellow-900 shadow-lg transition-transform",
                coinFlipping && "animate-spin"
              )}
            >
              {coinResult ? (coinResult === "heads" ? "H" : "T") : "?"}
            </div>
          </div>

          <Button onClick={flipCoin} className="w-full" size="lg" disabled={coinFlipping}>
            <Coins className="size-5 mr-2" />
            Flip Coin
          </Button>

          {coinResult && (
            <div className="text-center text-2xl font-bold capitalize">
              {coinResult}!
            </div>
          )}
        </div>
      )}

      {/* Random Number Tool */}
      {activeTool === "number" && (
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum</Label>
              <Input
                type="number"
                value={minNum}
                onChange={(e) => setMinNum(parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Maximum</Label>
              <Input
                type="number"
                value={maxNum}
                onChange={(e) => setMaxNum(parseInt(e.target.value) || 100)}
              />
            </div>
          </div>

          <Button onClick={generateNumber} className="w-full" size="lg">
            <Hash className="size-5 mr-2" />
            Generate Number
          </Button>

          {randomNum !== null && (
            <div className="text-center">
              <div className="text-6xl font-bold text-primary">{randomNum}</div>
              <p className="text-sm text-muted-foreground mt-2">
                Between {Math.min(minNum, maxNum)} and {Math.max(minNum, maxNum)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Picker Tool */}
      {activeTool === "picker" && (
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <Label>Add Items</Label>
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Enter an option"
                onKeyDown={(e) => e.key === "Enter" && addPickerItem()}
              />
              <Button onClick={addPickerItem}>
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {pickerItems.map((item) => (
              <div
                key={item}
                className={cn(
                  "px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-2",
                  pickedItem === item && "bg-primary text-primary-foreground"
                )}
              >
                {item}
                <button onClick={() => removePickerItem(item)} className="hover:text-destructive">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <Button onClick={pickRandom} className="w-full" size="lg" disabled={pickerItems.length === 0}>
            <Shuffle className="size-5 mr-2" />
            Pick Random
          </Button>

          {pickedItem && (
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Winner:</p>
              <p className="text-2xl font-bold text-primary">{pickedItem}</p>
            </div>
          )}
        </div>
      )}

      {/* Shuffle Tool */}
      {activeTool === "shuffle" && (
        <div className="bg-card border rounded-lg p-6 space-y-6">
          <div className="space-y-2">
            <Label>Enter items (one per line)</Label>
            <Textarea
              value={shuffleText}
              onChange={(e) => setShuffleText(e.target.value)}
              rows={5}
              placeholder="Item 1&#10;Item 2&#10;Item 3"
            />
          </div>

          <Button onClick={shuffleList} className="w-full" size="lg">
            <Shuffle className="size-5 mr-2" />
            Shuffle List
          </Button>

          {shuffledList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Shuffled Result</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(shuffledList.join("\n"))}
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
              <div className="bg-muted rounded-lg p-4 space-y-1">
                {shuffledList.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm w-6">{i + 1}.</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
