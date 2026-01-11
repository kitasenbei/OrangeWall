import { useState } from "react"
import { Plus, Ruler, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface Measurement {
  id: string
  name: string
  unit: string
  entries: { date: string; value: number }[]
}

const initialMeasurements: Measurement[] = [
  { id: "1", name: "Weight", unit: "lbs", entries: [{ date: "2024-12-01", value: 175 }, { date: "2024-12-15", value: 173 }, { date: "2025-01-01", value: 171 }] },
  { id: "2", name: "Waist", unit: "in", entries: [{ date: "2024-12-01", value: 34 }, { date: "2025-01-01", value: 33.5 }] },
  { id: "3", name: "Chest", unit: "in", entries: [{ date: "2024-12-01", value: 42 }, { date: "2025-01-01", value: 42.5 }] },
  { id: "4", name: "Bicep", unit: "in", entries: [{ date: "2024-12-01", value: 14 }, { date: "2025-01-01", value: 14.5 }] },
]

export function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)
  const [name, setName] = useState(""); const [unit, setUnit] = useState("")
  const [newValue, setNewValue] = useState("")

  const addMeasurement = () => {
    if (!name || !unit) return
    setMeasurements([...measurements, { id: Date.now().toString(), name, unit, entries: [] }])
    setName(""); setUnit(""); setDialogOpen(false)
  }

  const addEntry = () => {
    if (!selectedMeasurement || !newValue) return
    const value = parseFloat(newValue)
    if (isNaN(value)) return
    setMeasurements(measurements.map(m =>
      m.id === selectedMeasurement.id
        ? { ...m, entries: [...m.entries, { date: new Date().toISOString().split("T")[0], value }] }
        : m
    ))
    setNewValue(""); setAddDialogOpen(false); setSelectedMeasurement(null)
  }

  const deleteMeasurement = (id: string) => setMeasurements(measurements.filter(m => m.id !== id))

  const getTrend = (entries: { value: number }[]) => {
    if (entries.length < 2) return null
    const diff = entries[entries.length - 1].value - entries[entries.length - 2].value
    if (Math.abs(diff) < 0.1) return { icon: Minus, color: "text-muted-foreground", value: 0 }
    return diff > 0
      ? { icon: TrendingUp, color: "text-green-500", value: diff }
      : { icon: TrendingDown, color: "text-red-500", value: diff }
  }

  const presets = ["Weight", "Height", "Waist", "Chest", "Hips", "Bicep", "Thigh", "Neck", "Body Fat %"]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Measurements</h1><p className="text-sm text-muted-foreground">Track body measurements over time</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button><Plus className="size-4 mr-2" />New Measurement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Measurement Type</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Weight" /></div>
              <div className="space-y-2"><Label>Unit</Label><Input value={unit} onChange={e => setUnit(e.target.value)} placeholder="lbs, kg, in, cm" /></div>
              <div className="flex flex-wrap gap-2">
                {presets.filter(p => !measurements.some(m => m.name === p)).map(p => (
                  <button key={p} onClick={() => { setName(p); setUnit(p === "Weight" ? "lbs" : p === "Height" ? "ft" : p === "Body Fat %" ? "%" : "in") }} className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80">{p}</button>
                ))}
              </div>
              <Button onClick={addMeasurement} className="w-full">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={o => { setAddDialogOpen(o); if (!o) setSelectedMeasurement(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add {selectedMeasurement?.name} Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Value ({selectedMeasurement?.unit})</Label>
              <Input type="number" step="0.1" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Enter value" />
            </div>
            <Button onClick={addEntry} className="w-full">Add Entry</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {measurements.map(m => {
          const trend = getTrend(m.entries)
          const latest = m.entries[m.entries.length - 1]
          const TrendIcon = trend?.icon
          return (
            <div key={m.id} className="bg-card border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg"><Ruler className="size-4 text-primary" /></div>
                  <div>
                    <h3 className="font-medium">{m.name}</h3>
                    <p className="text-xs text-muted-foreground">{m.entries.length} entries</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteMeasurement(m.id)}><Trash2 className="size-4" /></Button>
              </div>

              {latest ? (
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-3xl font-bold">{latest.value}</span>
                    <span className="text-lg text-muted-foreground ml-1">{m.unit}</span>
                    {trend && TrendIcon && (
                      <div className={`flex items-center gap-1 text-sm ${trend.color}`}>
                        <TrendIcon className="size-4" />
                        <span>{trend.value > 0 ? "+" : ""}{trend.value.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" onClick={() => { setSelectedMeasurement(m); setAddDialogOpen(true) }}><Plus className="size-4 mr-1" />Add</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => { setSelectedMeasurement(m); setAddDialogOpen(true) }} className="w-full"><Plus className="size-4 mr-1" />Add First Entry</Button>
              )}

              {m.entries.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">History</p>
                  <div className="flex gap-2 overflow-x-auto">
                    {m.entries.slice(-5).map((e, i) => (
                      <div key={i} className="text-center px-2 py-1 bg-muted rounded text-xs whitespace-nowrap">
                        <div className="font-medium">{e.value}</div>
                        <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {measurements.length === 0 && <p className="text-center py-8 text-muted-foreground">No measurements tracked</p>}
    </div>
  )
}
