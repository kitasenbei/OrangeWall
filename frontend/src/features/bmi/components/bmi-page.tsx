import { useState, useMemo } from "react"
import { Scale, Ruler } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function BmiPage() {
  const [unit, setUnit] = useState<"metric" | "imperial">("imperial")
  const [weight, setWeight] = useState(170)
  const [heightFt, setHeightFt] = useState(5)
  const [heightIn, setHeightIn] = useState(10)
  const [heightCm, setHeightCm] = useState(178)

  const bmi = useMemo(() => {
    if (unit === "metric") {
      return weight / Math.pow(heightCm / 100, 2)
    } else {
      const totalInches = heightFt * 12 + heightIn
      return (weight / Math.pow(totalInches, 2)) * 703
    }
  }, [unit, weight, heightFt, heightIn, heightCm])

  const category = bmi < 18.5 ? { name: "Underweight", color: "text-blue-500" }
    : bmi < 25 ? { name: "Normal", color: "text-green-500" }
    : bmi < 30 ? { name: "Overweight", color: "text-yellow-500" }
    : { name: "Obese", color: "text-red-500" }

  const ranges = [
    { name: "Underweight", range: "< 18.5", min: 0, max: 18.5 },
    { name: "Normal", range: "18.5 - 24.9", min: 18.5, max: 25 },
    { name: "Overweight", range: "25 - 29.9", min: 25, max: 30 },
    { name: "Obese", range: "≥ 30", min: 30, max: 50 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">BMI Calculator</h1><p className="text-sm text-muted-foreground">Calculate your Body Mass Index</p></div>
        <div className="flex gap-2">
          <Button variant={unit === "imperial" ? "default" : "outline"} onClick={() => setUnit("imperial")}>Imperial</Button>
          <Button variant={unit === "metric" ? "default" : "outline"} onClick={() => setUnit("metric")}>Metric</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Scale className="size-4" />Weight ({unit === "metric" ? "kg" : "lbs"})</Label>
            <Input type="number" value={weight} onChange={e => setWeight(parseFloat(e.target.value) || 0)} min={0} />
          </div>

          {unit === "imperial" ? (
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Ruler className="size-4" />Height</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input type="number" value={heightFt} onChange={e => setHeightFt(parseInt(e.target.value) || 0)} min={0} max={8} />
                  <span className="text-xs text-muted-foreground">feet</span>
                </div>
                <div className="flex-1">
                  <Input type="number" value={heightIn} onChange={e => setHeightIn(parseInt(e.target.value) || 0)} min={0} max={11} />
                  <span className="text-xs text-muted-foreground">inches</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Ruler className="size-4" />Height (cm)</Label>
              <Input type="number" value={heightCm} onChange={e => setHeightCm(parseInt(e.target.value) || 0)} min={0} />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
            <p className="text-5xl font-bold">{bmi.toFixed(1)}</p>
            <p className={`text-lg font-medium mt-2 ${category.color}`}>{category.name}</p>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-2">
            {ranges.map(r => (
              <div key={r.name} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${r.name === "Underweight" ? "bg-blue-500" : r.name === "Normal" ? "bg-green-500" : r.name === "Overweight" ? "bg-yellow-500" : "bg-red-500"}`} />
                <span className="flex-1">{r.name}</span>
                <span className="text-sm text-muted-foreground">{r.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
