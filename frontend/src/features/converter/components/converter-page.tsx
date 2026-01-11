import { useState } from "react"
import { ArrowRightLeft, Scale, Ruler, Thermometer, Clock, Database, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { LucideIcon } from "lucide-react"

type Category = "length" | "weight" | "temperature" | "time" | "data" | "volume"

interface UnitConfig {
  name: string
  toBase: (val: number) => number
  fromBase: (val: number) => number
}

const categories: { id: Category; label: string; icon: LucideIcon; baseUnit: string }[] = [
  { id: "length", label: "Length", icon: Ruler, baseUnit: "meters" },
  { id: "weight", label: "Weight", icon: Scale, baseUnit: "grams" },
  { id: "temperature", label: "Temperature", icon: Thermometer, baseUnit: "celsius" },
  { id: "time", label: "Time", icon: Clock, baseUnit: "seconds" },
  { id: "data", label: "Data", icon: Database, baseUnit: "bytes" },
  { id: "volume", label: "Volume", icon: Zap, baseUnit: "liters" },
]

const units: Record<Category, Record<string, UnitConfig>> = {
  length: {
    mm: { name: "Millimeters", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    cm: { name: "Centimeters", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    m: { name: "Meters", toBase: (v) => v, fromBase: (v) => v },
    km: { name: "Kilometers", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    in: { name: "Inches", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    ft: { name: "Feet", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    yd: { name: "Yards", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    mi: { name: "Miles", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  },
  weight: {
    mg: { name: "Milligrams", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    g: { name: "Grams", toBase: (v) => v, fromBase: (v) => v },
    kg: { name: "Kilograms", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    oz: { name: "Ounces", toBase: (v) => v * 28.3495, fromBase: (v) => v / 28.3495 },
    lb: { name: "Pounds", toBase: (v) => v * 453.592, fromBase: (v) => v / 453.592 },
    st: { name: "Stone", toBase: (v) => v * 6350.29, fromBase: (v) => v / 6350.29 },
    t: { name: "Metric Tons", toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
  },
  temperature: {
    c: { name: "Celsius", toBase: (v) => v, fromBase: (v) => v },
    f: { name: "Fahrenheit", toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
    k: { name: "Kelvin", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  },
  time: {
    ms: { name: "Milliseconds", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    s: { name: "Seconds", toBase: (v) => v, fromBase: (v) => v },
    min: { name: "Minutes", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    hr: { name: "Hours", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    day: { name: "Days", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    wk: { name: "Weeks", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    mo: { name: "Months (30d)", toBase: (v) => v * 2592000, fromBase: (v) => v / 2592000 },
    yr: { name: "Years (365d)", toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },
  },
  data: {
    b: { name: "Bytes", toBase: (v) => v, fromBase: (v) => v },
    kb: { name: "Kilobytes", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    mb: { name: "Megabytes", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
    gb: { name: "Gigabytes", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
    tb: { name: "Terabytes", toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
  },
  volume: {
    ml: { name: "Milliliters", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    l: { name: "Liters", toBase: (v) => v, fromBase: (v) => v },
    gal: { name: "Gallons (US)", toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
    qt: { name: "Quarts", toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
    pt: { name: "Pints", toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
    cup: { name: "Cups", toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
    floz: { name: "Fluid Ounces", toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
  },
}

export function ConverterPage() {
  const [category, setCategory] = useState<Category>("length")
  const [fromUnit, setFromUnit] = useState("m")
  const [toUnit, setToUnit] = useState("ft")
  const [fromValue, setFromValue] = useState("1")
  const [toValue, setToValue] = useState("")

  const convert = (value: string, from: string, to: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return ""

    const categoryUnits = units[category]
    const baseValue = categoryUnits[from].toBase(num)
    const result = categoryUnits[to].fromBase(baseValue)

    return result.toPrecision(10).replace(/\.?0+$/, "")
  }

  const handleFromChange = (value: string) => {
    setFromValue(value)
    setToValue(convert(value, fromUnit, toUnit))
  }

  const handleToChange = (value: string) => {
    setToValue(value)
    setFromValue(convert(value, toUnit, fromUnit))
  }

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory)
    const unitKeys = Object.keys(units[newCategory])
    setFromUnit(unitKeys[0])
    setToUnit(unitKeys[1])
    setFromValue("1")
    setToValue(convert("1", unitKeys[0], unitKeys[1]))
  }

  const handleSwap = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)
    setToValue(fromValue)
  }

  const handleUnitChange = (type: "from" | "to", unit: string) => {
    if (type === "from") {
      setFromUnit(unit)
      setToValue(convert(fromValue, unit, toUnit))
    } else {
      setToUnit(unit)
      setToValue(convert(fromValue, fromUnit, unit))
    }
  }

  // Initialize on mount
  useState(() => {
    setToValue(convert("1", "m", "ft"))
  })

  const categoryUnits = units[category]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Unit Converter</h1>
        <p className="text-sm text-muted-foreground">Convert between different units</p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const Icon = cat.icon
          return (
            <Button
              key={cat.id}
              variant={category === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(cat.id)}
            >
              <Icon className="size-4 mr-2" />
              {cat.label}
            </Button>
          )
        })}
      </div>

      {/* Converter Card */}
      <div className="bg-card border rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
          {/* From */}
          <div className="space-y-2">
            <Label>From</Label>
            <Select value={fromUnit} onValueChange={(v) => handleUnitChange("from", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryUnits).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              className="text-lg font-mono"
            />
          </div>

          {/* Swap Button */}
          <Button variant="ghost" size="icon" onClick={handleSwap} className="mb-1">
            <ArrowRightLeft className="size-4" />
          </Button>

          {/* To */}
          <div className="space-y-2">
            <Label>To</Label>
            <Select value={toUnit} onValueChange={(v) => handleUnitChange("to", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryUnits).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              className="text-lg font-mono"
            />
          </div>
        </div>

        {/* Formula Display */}
        <div className="text-center text-sm text-muted-foreground">
          {fromValue && toValue && (
            <span>
              {fromValue} {categoryUnits[fromUnit].name} = {toValue} {categoryUnits[toUnit].name}
            </span>
          )}
        </div>
      </div>

      {/* Quick Reference */}
      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-3">Quick Reference</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {Object.entries(categoryUnits).slice(0, 6).map(([key, config]) => (
            <div key={key} className="flex justify-between text-muted-foreground">
              <span>1 {config.name}</span>
              <span className="font-mono">
                {convert("1", key, Object.keys(categoryUnits)[0])} {categoryUnits[Object.keys(categoryUnits)[0]].name.slice(0, 4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
