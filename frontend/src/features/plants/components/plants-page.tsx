import { useState } from "react"
import { Plus, Flower2, Droplets, Sun, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Plant {
  id: string
  name: string
  species: string
  location: string
  light: "low" | "medium" | "bright"
  waterFrequency: number
  lastWatered: string
  notes: string
}

const locations = ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Balcony", "Garden"]

const initialPlants: Plant[] = [
  { id: "1", name: "Monty", species: "Monstera Deliciosa", location: "Living Room", light: "medium", waterFrequency: 7, lastWatered: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0], notes: "Mist leaves weekly" },
  { id: "2", name: "Fern", species: "Boston Fern", location: "Bathroom", light: "low", waterFrequency: 3, lastWatered: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0], notes: "Loves humidity" },
  { id: "3", name: "Sunny", species: "Snake Plant", location: "Bedroom", light: "low", waterFrequency: 14, lastWatered: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0], notes: "" },
  { id: "4", name: "Aloe", species: "Aloe Vera", location: "Kitchen", light: "bright", waterFrequency: 14, lastWatered: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0], notes: "Don't overwater" },
]

export function PlantsPage() {
  const [plants, setPlants] = useState<Plant[]>(initialPlants)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null)

  const [name, setName] = useState("")
  const [species, setSpecies] = useState("")
  const [location, setLocation] = useState("Living Room")
  const [light, setLight] = useState<Plant["light"]>("medium")
  const [waterFrequency, setWaterFrequency] = useState("7")
  const [notes, setNotes] = useState("")

  const getDaysUntilWater = (plant: Plant) => {
    const last = new Date(plant.lastWatered)
    const next = new Date(last.getTime() + plant.waterFrequency * 86400000)
    const diff = Math.ceil((next.getTime() - Date.now()) / 86400000)
    return diff
  }

  const handleSave = () => {
    if (!name.trim()) return
    if (editingPlant) {
      setPlants(prev => prev.map(p => p.id === editingPlant.id ? { ...p, name, species, location, light, waterFrequency: parseInt(waterFrequency) || 7, notes } : p))
    } else {
      setPlants(prev => [...prev, { id: Date.now().toString(), name, species, location, light, waterFrequency: parseInt(waterFrequency) || 7, lastWatered: new Date().toISOString().split('T')[0], notes }])
    }
    resetForm()
    setDialogOpen(false)
  }

  const resetForm = () => { setName(""); setSpecies(""); setLocation("Living Room"); setLight("medium"); setWaterFrequency("7"); setNotes(""); setEditingPlant(null) }

  const openEdit = (plant: Plant) => {
    setEditingPlant(plant); setName(plant.name); setSpecies(plant.species); setLocation(plant.location)
    setLight(plant.light); setWaterFrequency(plant.waterFrequency.toString()); setNotes(plant.notes); setDialogOpen(true)
  }

  const waterPlant = (id: string) => setPlants(prev => prev.map(p => p.id === id ? { ...p, lastWatered: new Date().toISOString().split('T')[0] } : p))
  const deletePlant = (id: string) => setPlants(prev => prev.filter(p => p.id !== id))

  const needsWater = plants.filter(p => getDaysUntilWater(p) <= 0).length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Plants</h1><p className="text-sm text-muted-foreground">Care for your plant family</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Plant</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingPlant ? "Edit" : "Add"} Plant</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Nickname</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Monty" /></div>
                <div className="space-y-2"><Label>Species</Label><Input value={species} onChange={e => setSpecies(e.target.value)} placeholder="Monstera" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Location</Label><Select value={location} onValueChange={setLocation}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Light Needs</Label><Select value={light} onValueChange={(v) => setLight(v as Plant["light"])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="bright">Bright</SelectItem></SelectContent></Select></div>
              </div>
              <div className="space-y-2"><Label>Water Every (days)</Label><Input type="number" value={waterFrequency} onChange={e => setWaterFrequency(e.target.value)} /></div>
              <div className="space-y-2"><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} /></div>
              <Button onClick={handleSave} className="w-full">{editingPlant ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Flower2 className="size-4" /><span className="text-sm">Total Plants</span></div><span className="text-2xl font-semibold">{plants.length}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Droplets className="size-4" /><span className="text-sm">Need Water</span></div><span className="text-2xl font-semibold text-blue-500">{needsWater}</span></div>
        <div className="bg-card border rounded-lg p-4"><div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="size-4" /><span className="text-sm">Locations</span></div><span className="text-2xl font-semibold">{new Set(plants.map(p => p.location)).size}</span></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plants.map(plant => {
          const daysUntil = getDaysUntilWater(plant)
          const needsWaterNow = daysUntil <= 0
          return (
            <div key={plant.id} className={cn("bg-card border rounded-lg p-4", needsWaterNow && "border-blue-500/50")}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("size-12 rounded-xl flex items-center justify-center", needsWaterNow ? "bg-blue-500/10" : "bg-green-500/10")}>
                    <Flower2 className={cn("size-6", needsWaterNow ? "text-blue-500" : "text-green-500")} />
                  </div>
                  <div><h3 className="font-medium">{plant.name}</h3><p className="text-sm text-muted-foreground">{plant.species}</p></div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(plant)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deletePlant(plant.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Sun className="size-3" />{plant.light}</span>
                <span>{plant.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", needsWaterNow ? "text-blue-500 font-medium" : "text-muted-foreground")}>
                  {needsWaterNow ? "Needs water!" : `Water in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                </span>
                <Button size="sm" variant={needsWaterNow ? "default" : "outline"} onClick={() => waterPlant(plant.id)}>
                  <Droplets className="size-4 mr-1" />Water
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {plants.length === 0 && <div className="text-center py-12 text-muted-foreground"><Flower2 className="size-12 mx-auto mb-4 opacity-50" /><p>No plants yet</p></div>}
    </div>
  )
}
