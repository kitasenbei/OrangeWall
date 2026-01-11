import { useState } from "react"
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Trophy,
  Star,
  StarOff,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  ChevronLeft,
  Medal,
  Target,
  Zap,
  Users,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface Horse {
  id: string
  name: string
  nameJp: string
  age: number
  sex: "stallion" | "mare" | "gelding"
  color: string
  trainer: string
  jockey: string
  owner: string
  sire: string
  dam: string
  netkeibdId: string
  favorite: boolean
  notes: string
  stats: {
    totalRaces: number
    wins: number
    places: number
    shows: number
    earnings: number
  }
}

interface Race {
  id: string
  name: string
  nameJp: string
  date: string
  time: string
  venue: string
  grade: "G1" | "G2" | "G3" | "OP" | "Listed" | "Allowance" | "Maiden"
  distance: number
  surface: "turf" | "dirt"
  entries: RaceEntry[]
  status: "upcoming" | "completed"
}

interface RaceEntry {
  horseId: string
  horseName: string
  postPosition: number
  odds?: number
  jockey: string
  weight: number
  result?: number
}

const gradeColors: Record<Race["grade"], { bg: string; text: string }> = {
  "G1": { bg: "bg-yellow-500/20", text: "text-yellow-500" },
  "G2": { bg: "bg-pink-500/20", text: "text-pink-500" },
  "G3": { bg: "bg-orange-500/20", text: "text-orange-500" },
  "OP": { bg: "bg-blue-500/20", text: "text-blue-500" },
  "Listed": { bg: "bg-purple-500/20", text: "text-purple-500" },
  "Allowance": { bg: "bg-green-500/20", text: "text-green-500" },
  "Maiden": { bg: "bg-gray-500/20", text: "text-gray-500" },
}

const sexLabels: Record<Horse["sex"], string> = {
  "stallion": "Stallion",
  "mare": "Mare",
  "gelding": "Gelding",
}

const initialHorses: Horse[] = [
  {
    id: "1",
    name: "Equinox",
    nameJp: "イクイノックス",
    age: 5,
    sex: "stallion",
    color: "#3b82f6",
    trainer: "Tetsuya Kimura",
    jockey: "Christophe Lemaire",
    owner: "Silk Racing",
    sire: "Kitasan Black",
    dam: "Shaltin",
    netkeibdId: "2019104979",
    favorite: true,
    notes: "Retired champion. Undefeated in final 6 races including 2 Japan Cups.",
    stats: { totalRaces: 10, wins: 8, places: 1, shows: 0, earnings: 2230000000 },
  },
  {
    id: "2",
    name: "Liberty Island",
    nameJp: "リバティアイランド",
    age: 4,
    sex: "mare",
    color: "#ec4899",
    trainer: "Mitsumasa Nakauchida",
    jockey: "Yuga Kawada",
    owner: "Sunday Racing",
    sire: "Duramente",
    dam: "Yankee Rose",
    netkeibdId: "2020105506",
    favorite: true,
    notes: "Triple Tiara winner 2023. Dominant filly generation.",
    stats: { totalRaces: 9, wins: 6, places: 2, shows: 0, earnings: 980000000 },
  },
  {
    id: "3",
    name: "Dura Erede",
    nameJp: "ドゥラエレーデ",
    age: 4,
    sex: "stallion",
    color: "#22c55e",
    trainer: "Yasuo Tomomichi",
    jockey: "Mirco Demuro",
    owner: "Godolphin",
    sire: "Duramente",
    dam: "マルケッサ",
    netkeibdId: "2020103456",
    favorite: false,
    notes: "Hopeful Stakes winner. Improving form.",
    stats: { totalRaces: 12, wins: 3, places: 4, shows: 2, earnings: 320000000 },
  },
  {
    id: "4",
    name: "Tastiera",
    nameJp: "タスティエーラ",
    age: 4,
    sex: "stallion",
    color: "#f97316",
    trainer: "Noriyuki Hori",
    jockey: "Damian Lane",
    owner: "Carrot Farm",
    sire: "Satono Crown",
    dam: "Lady Jane",
    netkeibdId: "2020104123",
    favorite: false,
    notes: "2023 Derby winner. Strong stretch runner.",
    stats: { totalRaces: 10, wins: 4, places: 3, shows: 1, earnings: 650000000 },
  },
]

const initialRaces: Race[] = [
  {
    id: "1",
    name: "Osaka Hai",
    nameJp: "大阪杯",
    date: "2024-03-31",
    time: "15:40",
    venue: "Hanshin",
    grade: "G1",
    distance: 2000,
    surface: "turf",
    status: "upcoming",
    entries: [
      { horseId: "2", horseName: "Liberty Island", postPosition: 5, odds: 2.1, jockey: "Yuga Kawada", weight: 55 },
      { horseId: "4", horseName: "Tastiera", postPosition: 8, odds: 5.5, jockey: "Damian Lane", weight: 58 },
      { horseId: "3", horseName: "Dura Erede", postPosition: 3, odds: 12.0, jockey: "Mirco Demuro", weight: 58 },
    ],
  },
  {
    id: "2",
    name: "Japan Cup",
    nameJp: "ジャパンカップ",
    date: "2023-11-26",
    time: "15:40",
    venue: "Tokyo",
    grade: "G1",
    distance: 2400,
    surface: "turf",
    status: "completed",
    entries: [
      { horseId: "1", horseName: "Equinox", postPosition: 4, odds: 1.2, jockey: "C. Lemaire", weight: 58, result: 1 },
      { horseId: "2", horseName: "Liberty Island", postPosition: 7, odds: 3.8, jockey: "Y. Kawada", weight: 55, result: 2 },
      { horseId: "4", horseName: "Tastiera", postPosition: 12, odds: 15.0, jockey: "D. Lane", weight: 58, result: 6 },
    ],
  },
  {
    id: "3",
    name: "Arima Kinen",
    nameJp: "有馬記念",
    date: "2023-12-24",
    time: "15:25",
    venue: "Nakayama",
    grade: "G1",
    distance: 2500,
    surface: "turf",
    status: "completed",
    entries: [
      { horseId: "4", horseName: "Tastiera", postPosition: 6, odds: 8.2, jockey: "D. Lane", weight: 58, result: 3 },
      { horseId: "3", horseName: "Dura Erede", postPosition: 2, odds: 25.0, jockey: "M. Demuro", weight: 58, result: 8 },
    ],
  },
]

export function HorsesPage() {
  const [horses, setHorses] = useState<Horse[]>(initialHorses)
  const [races, setRaces] = useState<Race[]>(initialRaces)
  const [activeTab, setActiveTab] = useState<"horses" | "races">("horses")
  const [selectedHorse, setSelectedHorse] = useState<Horse | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [filterGrade, setFilterGrade] = useState<string>("all")

  // Dialog states
  const [horseDialogOpen, setHorseDialogOpen] = useState(false)
  const [raceDialogOpen, setRaceDialogOpen] = useState(false)
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null)

  // Horse form
  const [hName, setHName] = useState("")
  const [hNameJp, setHNameJp] = useState("")
  const [hAge, setHAge] = useState("")
  const [hSex, setHSex] = useState<Horse["sex"]>("stallion")
  const [hTrainer, setHTrainer] = useState("")
  const [hJockey, setHJockey] = useState("")
  const [hSire, setHSire] = useState("")
  const [hDam, setHDam] = useState("")
  const [hNetkeiba, setHNetkeiba] = useState("")
  const [hNotes, setHNotes] = useState("")

  // Race form
  const [rName, setRName] = useState("")
  const [rNameJp, setRNameJp] = useState("")
  const [rDate, setRDate] = useState("")
  const [rVenue, setRVenue] = useState("")
  const [rGrade, setRGrade] = useState<Race["grade"]>("G1")
  const [rDistance, setRDistance] = useState("")
  const [rSurface, setRSurface] = useState<Race["surface"]>("turf")

  const filteredHorses = horses.filter(h => {
    if (searchQuery && !h.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !h.nameJp.includes(searchQuery)) return false
    if (showFavoritesOnly && !h.favorite) return false
    return true
  })

  const filteredRaces = races.filter(r => {
    if (filterGrade !== "all" && r.grade !== filterGrade) return false
    return true
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const handleSaveHorse = () => {
    if (!hName.trim()) return

    if (editingHorse) {
      setHorses(prev => prev.map(h =>
        h.id === editingHorse.id
          ? {
              ...h,
              name: hName,
              nameJp: hNameJp,
              age: parseInt(hAge) || h.age,
              sex: hSex,
              trainer: hTrainer,
              jockey: hJockey,
              sire: hSire,
              dam: hDam,
              netkeibdId: hNetkeiba,
              notes: hNotes,
            }
          : h
      ))
    } else {
      const newHorse: Horse = {
        id: Date.now().toString(),
        name: hName,
        nameJp: hNameJp,
        age: parseInt(hAge) || 3,
        sex: hSex,
        color: ["#3b82f6", "#ec4899", "#22c55e", "#f97316", "#8b5cf6"][Math.floor(Math.random() * 5)],
        trainer: hTrainer,
        jockey: hJockey,
        owner: "",
        sire: hSire,
        dam: hDam,
        netkeibdId: hNetkeiba,
        favorite: false,
        notes: hNotes,
        stats: { totalRaces: 0, wins: 0, places: 0, shows: 0, earnings: 0 },
      }
      setHorses(prev => [newHorse, ...prev])
    }
    resetHorseForm()
    setHorseDialogOpen(false)
  }

  const handleSaveRace = () => {
    if (!rName.trim() || !rDate) return

    const newRace: Race = {
      id: Date.now().toString(),
      name: rName,
      nameJp: rNameJp,
      date: rDate,
      time: "15:00",
      venue: rVenue,
      grade: rGrade,
      distance: parseInt(rDistance) || 2000,
      surface: rSurface,
      status: "upcoming",
      entries: [],
    }
    setRaces(prev => [newRace, ...prev])
    resetRaceForm()
    setRaceDialogOpen(false)
  }

  const resetHorseForm = () => {
    setHName("")
    setHNameJp("")
    setHAge("")
    setHSex("stallion")
    setHTrainer("")
    setHJockey("")
    setHSire("")
    setHDam("")
    setHNetkeiba("")
    setHNotes("")
    setEditingHorse(null)
  }

  const resetRaceForm = () => {
    setRName("")
    setRNameJp("")
    setRDate("")
    setRVenue("")
    setRGrade("G1")
    setRDistance("")
    setRSurface("turf")
  }

  const openEditHorse = (horse: Horse) => {
    setEditingHorse(horse)
    setHName(horse.name)
    setHNameJp(horse.nameJp)
    setHAge(horse.age.toString())
    setHSex(horse.sex)
    setHTrainer(horse.trainer)
    setHJockey(horse.jockey)
    setHSire(horse.sire)
    setHDam(horse.dam)
    setHNetkeiba(horse.netkeibdId)
    setHNotes(horse.notes)
    setHorseDialogOpen(true)
  }

  const toggleFavorite = (id: string) => {
    setHorses(prev => prev.map(h =>
      h.id === id ? { ...h, favorite: !h.favorite } : h
    ))
  }

  const deleteHorse = (id: string) => {
    setHorses(prev => prev.filter(h => h.id !== id))
    if (selectedHorse?.id === id) setSelectedHorse(null)
  }

  const deleteRace = (id: string) => {
    setRaces(prev => prev.filter(r => r.id !== id))
  }

  const formatEarnings = (amount: number) => {
    if (amount >= 100000000) return `¥${(amount / 100000000).toFixed(1)}億`
    if (amount >= 10000) return `¥${(amount / 10000).toFixed(0)}万`
    return `¥${amount.toLocaleString()}`
  }

  const getWinRate = (stats: Horse["stats"]) => {
    if (stats.totalRaces === 0) return 0
    return Math.round((stats.wins / stats.totalRaces) * 100)
  }

  const getPlaceRate = (stats: Horse["stats"]) => {
    if (stats.totalRaces === 0) return 0
    return Math.round(((stats.wins + stats.places + stats.shows) / stats.totalRaces) * 100)
  }

  // Horse Detail View
  if (selectedHorse) {
    const horseRaces = races.filter(r =>
      r.entries.some(e => e.horseId === selectedHorse.id)
    )

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedHorse(null)}>
            <ChevronLeft className="size-4 mr-2" />
            Back
          </Button>
          {selectedHorse.netkeibdId && (
            <Button variant="outline" asChild>
              <a
                href={`https://db.netkeiba.com/horse/${selectedHorse.netkeibdId}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="size-4 mr-2" />
                View on netkeiba
              </a>
            </Button>
          )}
        </div>

        {/* Horse Header */}
        <div className="flex items-start gap-6">
          <div
            className="size-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white"
            style={{ backgroundColor: selectedHorse.color }}
          >
            {selectedHorse.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold">{selectedHorse.name}</h1>
              <button onClick={() => toggleFavorite(selectedHorse.id)}>
                {selectedHorse.favorite ? (
                  <Star className="size-5 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="size-5 text-muted-foreground" />
                )}
              </button>
            </div>
            <p className="text-lg text-muted-foreground">{selectedHorse.nameJp}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedHorse.age}yo {sexLabels[selectedHorse.sex]} • {selectedHorse.sire} x {selectedHorse.dam}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Target className="size-4" />
              <span className="text-sm">Record</span>
            </div>
            <span className="text-xl font-semibold">
              {selectedHorse.stats.wins}-{selectedHorse.stats.places}-{selectedHorse.stats.shows}/{selectedHorse.stats.totalRaces}
            </span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Trophy className="size-4" />
              <span className="text-sm">Win Rate</span>
            </div>
            <span className="text-xl font-semibold">{getWinRate(selectedHorse.stats)}%</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Medal className="size-4" />
              <span className="text-sm">Place Rate</span>
            </div>
            <span className="text-xl font-semibold">{getPlaceRate(selectedHorse.stats)}%</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Zap className="size-4" />
              <span className="text-sm">Earnings</span>
            </div>
            <span className="text-xl font-semibold">{formatEarnings(selectedHorse.stats.earnings)}</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Users className="size-4" />
              <span className="text-sm">Trainer</span>
            </div>
            <span className="text-sm font-medium truncate">{selectedHorse.trainer}</span>
          </div>
        </div>

        {/* Notes */}
        {selectedHorse.notes && (
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-medium mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{selectedHorse.notes}</p>
          </div>
        )}

        {/* Race History */}
        <div>
          <h3 className="font-medium mb-3">Race History</h3>
          <div className="space-y-2">
            {horseRaces.map((race) => {
              const entry = race.entries.find(e => e.horseId === selectedHorse.id)
              if (!entry) return null
              const gradeStyle = gradeColors[race.grade]

              return (
                <div key={race.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn("px-2 py-1 rounded text-xs font-medium", gradeStyle.bg, gradeStyle.text)}>
                      {race.grade}
                    </div>
                    <div>
                      <p className="font-medium">{race.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {race.venue} • {race.distance}m {race.surface} • {race.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {race.status === "completed" && entry.result && (
                      <span className={cn(
                        "text-lg font-bold",
                        entry.result === 1 && "text-yellow-500",
                        entry.result === 2 && "text-gray-400",
                        entry.result === 3 && "text-orange-400",
                        entry.result > 3 && "text-muted-foreground"
                      )}>
                        {entry.result === 1 ? "1st" : entry.result === 2 ? "2nd" : entry.result === 3 ? "3rd" : `${entry.result}th`}
                      </span>
                    )}
                    {race.status === "upcoming" && (
                      <span className="text-sm text-blue-500">Upcoming</span>
                    )}
                  </div>
                </div>
              )
            })}
            {horseRaces.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No race history</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Horse Racing</h1>
          <p className="text-sm text-muted-foreground">Track horses and races</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={raceDialogOpen} onOpenChange={setRaceDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetRaceForm}>
                <Calendar className="size-4 mr-2" />
                Add Race
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Race</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={rName}
                      onChange={(e) => setRName(e.target.value)}
                      placeholder="Japan Cup"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (JP)</Label>
                    <Input
                      value={rNameJp}
                      onChange={(e) => setRNameJp(e.target.value)}
                      placeholder="ジャパンカップ"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={rDate}
                      onChange={(e) => setRDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Venue</Label>
                    <Input
                      value={rVenue}
                      onChange={(e) => setRVenue(e.target.value)}
                      placeholder="Tokyo"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select value={rGrade} onValueChange={(v) => setRGrade(v as Race["grade"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="G1">G1</SelectItem>
                        <SelectItem value="G2">G2</SelectItem>
                        <SelectItem value="G3">G3</SelectItem>
                        <SelectItem value="OP">Open</SelectItem>
                        <SelectItem value="Listed">Listed</SelectItem>
                        <SelectItem value="Allowance">Allowance</SelectItem>
                        <SelectItem value="Maiden">Maiden</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Distance (m)</Label>
                    <Input
                      type="number"
                      value={rDistance}
                      onChange={(e) => setRDistance(e.target.value)}
                      placeholder="2000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Surface</Label>
                    <Select value={rSurface} onValueChange={(v) => setRSurface(v as Race["surface"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="turf">Turf</SelectItem>
                        <SelectItem value="dirt">Dirt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveRace} className="w-full">Add Race</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={horseDialogOpen} onOpenChange={setHorseDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetHorseForm}>
                <Plus className="size-4 mr-2" />
                Add Horse
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingHorse ? "Edit Horse" : "Add Horse"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name (EN)</Label>
                    <Input
                      value={hName}
                      onChange={(e) => setHName(e.target.value)}
                      placeholder="Equinox"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name (JP)</Label>
                    <Input
                      value={hNameJp}
                      onChange={(e) => setHNameJp(e.target.value)}
                      placeholder="イクイノックス"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={hAge}
                      onChange={(e) => setHAge(e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Sex</Label>
                    <Select value={hSex} onValueChange={(v) => setHSex(v as Horse["sex"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stallion">Stallion</SelectItem>
                        <SelectItem value="mare">Mare</SelectItem>
                        <SelectItem value="gelding">Gelding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sire</Label>
                    <Input
                      value={hSire}
                      onChange={(e) => setHSire(e.target.value)}
                      placeholder="Kitasan Black"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dam</Label>
                    <Input
                      value={hDam}
                      onChange={(e) => setHDam(e.target.value)}
                      placeholder="Dam name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trainer</Label>
                    <Input
                      value={hTrainer}
                      onChange={(e) => setHTrainer(e.target.value)}
                      placeholder="Trainer name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Jockey</Label>
                    <Input
                      value={hJockey}
                      onChange={(e) => setHJockey(e.target.value)}
                      placeholder="Jockey name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>netkeiba ID</Label>
                  <Input
                    value={hNetkeiba}
                    onChange={(e) => setHNetkeiba(e.target.value)}
                    placeholder="2019104979"
                  />
                  <p className="text-xs text-muted-foreground">
                    Find at db.netkeiba.com/horse/[ID]/
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={hNotes}
                    onChange={(e) => setHNotes(e.target.value)}
                    placeholder="Performance notes, observations..."
                    rows={2}
                  />
                </div>
                <Button onClick={handleSaveHorse} className="w-full">
                  {editingHorse ? "Save Changes" : "Add Horse"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="size-4" />
            <span className="text-sm">Tracked Horses</span>
          </div>
          <span className="text-2xl font-semibold">{horses.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Star className="size-4" />
            <span className="text-sm">Favorites</span>
          </div>
          <span className="text-2xl font-semibold">{horses.filter(h => h.favorite).length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Calendar className="size-4" />
            <span className="text-sm">Upcoming Races</span>
          </div>
          <span className="text-2xl font-semibold">{races.filter(r => r.status === "upcoming").length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="size-4" />
            <span className="text-sm">G1 Races</span>
          </div>
          <span className="text-2xl font-semibold">{races.filter(r => r.grade === "G1").length}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(["horses", "races"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
              activeTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Horses Tab */}
      {activeTab === "horses" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search horses..."
                className="pl-9"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Star className="size-4 mr-2" />
              Favorites
            </Button>
          </div>

          {/* Horse Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHorses.map((horse) => (
              <div
                key={horse.id}
                className="bg-card border rounded-lg p-4 cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => setSelectedHorse(horse)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="size-12 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0"
                    style={{ backgroundColor: horse.color }}
                  >
                    {horse.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{horse.name}</h3>
                      {horse.favorite && <Star className="size-4 text-yellow-500 fill-yellow-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{horse.nameJp}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {horse.age}yo {sexLabels[horse.sex]} • {horse.trainer}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-medium">
                      {horse.stats.wins}-{horse.stats.places}-{horse.stats.shows}
                    </p>
                    <p className="text-xs text-muted-foreground">{getWinRate(horse.stats)}% win</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); toggleFavorite(horse.id) }}>
                        {horse.favorite ? (
                          <><StarOff className="size-4 mr-2" />Unfavorite</>
                        ) : (
                          <><Star className="size-4 mr-2" />Favorite</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditHorse(horse) }}>
                        <Pencil className="size-4 mr-2" />Edit
                      </DropdownMenuItem>
                      {horse.netkeibdId && (
                        <DropdownMenuItem asChild>
                          <a
                            href={`https://db.netkeiba.com/horse/${horse.netkeibdId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-4 mr-2" />netkeiba
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={(e) => { e.stopPropagation(); deleteHorse(horse.id) }}
                        className="text-destructive"
                      >
                        <Trash2 className="size-4 mr-2" />Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredHorses.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="size-12 mx-auto mb-4 opacity-50" />
              <p>No horses found</p>
            </div>
          )}
        </div>
      )}

      {/* Races Tab */}
      {activeTab === "races" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <Filter className="size-4 text-muted-foreground" />
            <Select value={filterGrade} onValueChange={setFilterGrade}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="G1">G1</SelectItem>
                <SelectItem value="G2">G2</SelectItem>
                <SelectItem value="G3">G3</SelectItem>
                <SelectItem value="OP">Open</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Race Cards */}
          <div className="space-y-3">
            {filteredRaces.map((race) => {
              const gradeStyle = gradeColors[race.grade]
              const isUpcoming = race.status === "upcoming"

              return (
                <div key={race.id} className="bg-card border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("px-2 py-1 rounded text-xs font-bold", gradeStyle.bg, gradeStyle.text)}>
                        {race.grade}
                      </div>
                      <div>
                        <h3 className="font-medium">{race.name}</h3>
                        <p className="text-sm text-muted-foreground">{race.nameJp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isUpcoming && (
                        <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">
                          Upcoming
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => deleteRace(race.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="size-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-4" />
                      <span>{race.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      <span>{race.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      <span>{race.venue}</span>
                    </div>
                    <span>{race.distance}m {race.surface}</span>
                  </div>

                  {race.entries.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="text-xs text-muted-foreground mb-2">Entries ({race.entries.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {race.entries.map((entry) => (
                          <div
                            key={entry.horseId}
                            className={cn(
                              "px-2 py-1 rounded text-xs flex items-center gap-2",
                              race.status === "completed" && entry.result === 1 && "bg-yellow-500/10 text-yellow-600",
                              race.status === "completed" && entry.result === 2 && "bg-gray-500/10 text-gray-600",
                              race.status === "completed" && entry.result === 3 && "bg-orange-500/10 text-orange-600",
                              (race.status === "upcoming" || (entry.result && entry.result > 3)) && "bg-muted"
                            )}
                          >
                            <span>{entry.horseName}</span>
                            {race.status === "completed" && entry.result && (
                              <span className="font-medium">
                                {entry.result === 1 ? "1st" : entry.result === 2 ? "2nd" : entry.result === 3 ? "3rd" : `${entry.result}th`}
                              </span>
                            )}
                            {race.status === "upcoming" && entry.odds && (
                              <span className="text-muted-foreground">{entry.odds.toFixed(1)}x</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {filteredRaces.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="size-12 mx-auto mb-4 opacity-50" />
              <p>No races found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
