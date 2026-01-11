import { useState } from "react"
import { Plus, Dog, Cat, Bird, Fish, Heart, Calendar, Syringe, MoreVertical, Pencil, Trash2, Cake } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LucideIcon } from "lucide-react"

interface Pet { id: string; name: string; species: string; breed: string; birthday: string; weight: string; vetVisit: string; vaccinations: string; notes: string }

const speciesIcons: Record<string, LucideIcon> = { dog: Dog, cat: Cat, bird: Bird, fish: Fish }
const speciesList = ["dog", "cat", "bird", "fish", "other"]

const initialPets: Pet[] = [
  { id: "1", name: "Max", species: "dog", breed: "Golden Retriever", birthday: "2020-03-15", weight: "70 lbs", vetVisit: "2024-01-10", vaccinations: "Rabies, DHPP - Up to date", notes: "Loves fetch and swimming" },
  { id: "2", name: "Luna", species: "cat", breed: "Siamese", birthday: "2021-07-22", weight: "9 lbs", vetVisit: "2023-11-05", vaccinations: "FVRCP - Due 2024-11", notes: "Indoor only" },
]

function getAge(birthday: string): string {
  const years = Math.floor((Date.now() - new Date(birthday).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  return years < 1 ? "< 1 year" : `${years} year${years > 1 ? "s" : ""}`
}

export function PetsPage() {
  const [pets, setPets] = useState<Pet[]>(initialPets)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  const [name, setName] = useState(""); const [species, setSpecies] = useState("dog"); const [breed, setBreed] = useState("")
  const [birthday, setBirthday] = useState(""); const [weight, setWeight] = useState(""); const [vetVisit, setVetVisit] = useState("")
  const [vaccinations, setVaccinations] = useState(""); const [notes, setNotes] = useState("")

  const handleSave = () => {
    if (!name.trim()) return
    if (editingPet) { setPets(prev => prev.map(p => p.id === editingPet.id ? { ...p, name, species, breed, birthday, weight, vetVisit, vaccinations, notes } : p)) }
    else { setPets(prev => [...prev, { id: Date.now().toString(), name, species, breed, birthday, weight, vetVisit, vaccinations, notes }]) }
    resetForm(); setDialogOpen(false)
  }

  const resetForm = () => { setName(""); setSpecies("dog"); setBreed(""); setBirthday(""); setWeight(""); setVetVisit(""); setVaccinations(""); setNotes(""); setEditingPet(null) }
  const openEdit = (pet: Pet) => { setEditingPet(pet); setName(pet.name); setSpecies(pet.species); setBreed(pet.breed); setBirthday(pet.birthday); setWeight(pet.weight); setVetVisit(pet.vetVisit); setVaccinations(pet.vaccinations); setNotes(pet.notes); setDialogOpen(true) }
  const deletePet = (id: string) => setPets(prev => prev.filter(p => p.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Pets</h1><p className="text-sm text-muted-foreground">Track your furry friends</p></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Pet</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingPet ? "Edit" : "Add"} Pet</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Species</Label><Select value={species} onValueChange={setSpecies}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{speciesList.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Breed</Label><Input value={breed} onChange={e => setBreed(e.target.value)} /></div>
                <div className="space-y-2"><Label>Birthday</Label><Input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Weight</Label><Input value={weight} onChange={e => setWeight(e.target.value)} placeholder="e.g., 25 lbs" /></div>
                <div className="space-y-2"><Label>Last Vet Visit</Label><Input type="date" value={vetVisit} onChange={e => setVetVisit(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Vaccinations</Label><Input value={vaccinations} onChange={e => setVaccinations(e.target.value)} /></div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
              <Button onClick={handleSave} className="w-full">{editingPet ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pets.map(pet => {
          const Icon = speciesIcons[pet.species] || Heart
          return (
            <div key={pet.id} className="bg-card border rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="size-7 text-primary" /></div>
                  <div><h3 className="text-lg font-medium">{pet.name}</h3><p className="text-sm text-muted-foreground capitalize">{pet.breed || pet.species}</p></div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(pet)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deletePet(pet.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {pet.birthday && <div className="flex items-center gap-2 text-muted-foreground"><Cake className="size-4" /><span>{getAge(pet.birthday)} old</span></div>}
                {pet.weight && <div className="flex items-center gap-2 text-muted-foreground"><Heart className="size-4" /><span>{pet.weight}</span></div>}
                {pet.vetVisit && <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="size-4" /><span>Vet: {pet.vetVisit}</span></div>}
                {pet.vaccinations && <div className="flex items-center gap-2 text-muted-foreground"><Syringe className="size-4" /><span className="truncate">{pet.vaccinations}</span></div>}
              </div>
              {pet.notes && <p className="text-sm text-muted-foreground mt-3 pt-3 border-t">{pet.notes}</p>}
            </div>
          )
        })}
      </div>

      {pets.length === 0 && <div className="text-center py-12 text-muted-foreground"><Heart className="size-12 mx-auto mb-4 opacity-50" /><p>No pets added yet</p></div>}
    </div>
  )
}
