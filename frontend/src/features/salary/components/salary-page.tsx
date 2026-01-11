import { useState, useMemo } from "react"
import { DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SalaryPage() {
  const [amount, setAmount] = useState(75000)
  const [type, setType] = useState<"annual" | "monthly" | "biweekly" | "weekly" | "hourly">("annual")
  const [hoursPerWeek, setHoursPerWeek] = useState(40)

  const conversions = useMemo(() => {
    const hoursPerYear = hoursPerWeek * 52
    let hourly: number
    switch (type) {
      case "hourly": hourly = amount; break
      case "weekly": hourly = amount / hoursPerWeek; break
      case "biweekly": hourly = amount / (hoursPerWeek * 2); break
      case "monthly": hourly = (amount * 12) / hoursPerYear; break
      case "annual": hourly = amount / hoursPerYear; break
    }
    return {
      hourly,
      daily: hourly * (hoursPerWeek / 5),
      weekly: hourly * hoursPerWeek,
      biweekly: hourly * hoursPerWeek * 2,
      monthly: (hourly * hoursPerYear) / 12,
      annual: hourly * hoursPerYear,
    }
  }, [amount, type, hoursPerWeek])

  const types = [
    { value: "annual", label: "Annual" },
    { value: "monthly", label: "Monthly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "weekly", label: "Weekly" },
    { value: "hourly", label: "Hourly" },
  ] as const

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Salary Converter</h1><p className="text-sm text-muted-foreground">Convert between salary frequencies</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><DollarSign className="size-4" />Amount</Label>
            <Input type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} min={0} />
          </div>

          <div className="space-y-2">
            <Label>Pay Period</Label>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <button key={t.value} onClick={() => setType(t.value)} className={`px-3 py-1.5 rounded-lg text-sm border ${type === t.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{t.label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hours per Week</Label>
            <Input type="number" value={hoursPerWeek} onChange={e => setHoursPerWeek(Math.max(1, parseInt(e.target.value) || 40))} min={1} max={168} />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-4 space-y-3">
          {[
            { label: "Hourly", value: conversions.hourly },
            { label: "Daily", value: conversions.daily },
            { label: "Weekly", value: conversions.weekly },
            { label: "Bi-weekly", value: conversions.biweekly },
            { label: "Monthly", value: conversions.monthly },
            { label: "Annual", value: conversions.annual },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center py-2 border-b last:border-0">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-mono font-semibold">${row.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
