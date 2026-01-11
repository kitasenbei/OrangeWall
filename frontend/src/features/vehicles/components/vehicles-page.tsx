import { useState } from "react"
import {
  Plus,
  Car,
  Fuel,
  Wrench,
  MoreVertical,
  Pencil,
  Trash2,
  Gauge,
  DollarSign,
  TrendingUp,
  ChevronLeft,
  Clock
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

interface Vehicle {
  id: string
  name: string
  make: string
  model: string
  year: number
  color: string
  licensePlate: string
  vin: string
  currentMileage: number
  fuelType: "gasoline" | "diesel" | "electric" | "hybrid"
}

interface MaintenanceRecord {
  id: string
  vehicleId: string
  type: string
  description: string
  date: string
  mileage: number
  cost: number
}

interface FuelLog {
  id: string
  vehicleId: string
  date: string
  gallons: number
  pricePerGallon: number
  totalCost: number
  mileage: number
}

const vehicleColors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#1f2937"
]

const maintenanceTypes = [
  "Oil Change", "Tire Rotation", "Brake Service", "Battery",
  "Air Filter", "Transmission", "Coolant Flush", "Inspection", "Other"
]

const initialVehicles: Vehicle[] = [
  {
    id: "1",
    name: "Daily Driver",
    make: "Toyota",
    model: "Camry",
    year: 2021,
    color: "#3b82f6",
    licensePlate: "ABC 123",
    vin: "1234567890ABCDEFG",
    currentMileage: 45000,
    fuelType: "gasoline",
  },
  {
    id: "2",
    name: "Weekend Car",
    make: "Mazda",
    model: "MX-5 Miata",
    year: 2019,
    color: "#ef4444",
    licensePlate: "XYZ 789",
    vin: "0987654321HIJKLMN",
    currentMileage: 28000,
    fuelType: "gasoline",
  },
]

const initialMaintenance: MaintenanceRecord[] = [
  { id: "1", vehicleId: "1", type: "Oil Change", description: "Full synthetic oil change", date: "2024-01-15", mileage: 44500, cost: 75 },
  { id: "2", vehicleId: "1", type: "Tire Rotation", description: "Rotated all four tires", date: "2024-01-15", mileage: 44500, cost: 25 },
  { id: "3", vehicleId: "1", type: "Brake Service", description: "Replaced front brake pads", date: "2023-11-20", mileage: 42000, cost: 250 },
  { id: "4", vehicleId: "2", type: "Oil Change", description: "Synthetic blend", date: "2024-01-10", mileage: 27500, cost: 60 },
]

const initialFuelLogs: FuelLog[] = [
  { id: "1", vehicleId: "1", date: "2024-01-20", gallons: 12.5, pricePerGallon: 3.29, totalCost: 41.13, mileage: 45000 },
  { id: "2", vehicleId: "1", date: "2024-01-10", gallons: 13.2, pricePerGallon: 3.15, totalCost: 41.58, mileage: 44650 },
  { id: "3", vehicleId: "1", date: "2024-01-02", gallons: 11.8, pricePerGallon: 3.25, totalCost: 38.35, mileage: 44300 },
  { id: "4", vehicleId: "2", date: "2024-01-18", gallons: 10.2, pricePerGallon: 3.29, totalCost: 33.56, mileage: 28000 },
]

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(initialMaintenance)
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(initialFuelLogs)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [activeTab, setActiveTab] = useState<"overview" | "maintenance" | "fuel">("overview")

  // Dialog states
  const [vehicleDialogOpen, setVehicleDialogOpen] = useState(false)
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false)
  const [fuelDialogOpen, setFuelDialogOpen] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)

  // Vehicle form
  const [vName, setVName] = useState("")
  const [vMake, setVMake] = useState("")
  const [vModel, setVModel] = useState("")
  const [vYear, setVYear] = useState("")
  const [vColor, setVColor] = useState(vehicleColors[0])
  const [vPlate, setVPlate] = useState("")
  const [vMileage, setVMileage] = useState("")
  const [vFuelType, setVFuelType] = useState<Vehicle["fuelType"]>("gasoline")

  // Maintenance form
  const [mType, setMType] = useState(maintenanceTypes[0])
  const [mDescription, setMDescription] = useState("")
  const [mDate, setMDate] = useState(new Date().toISOString().split('T')[0])
  const [mMileage, setMMileage] = useState("")
  const [mCost, setMCost] = useState("")

  // Fuel form
  const [fDate, setFDate] = useState(new Date().toISOString().split('T')[0])
  const [fGallons, setFGallons] = useState("")
  const [fPrice, setFPrice] = useState("")
  const [fMileage, setFMileage] = useState("")

  const handleSaveVehicle = () => {
    if (!vName.trim() || !vMake.trim() || !vModel.trim()) return

    if (editingVehicle) {
      setVehicles(prev => prev.map(v =>
        v.id === editingVehicle.id
          ? {
              ...v,
              name: vName,
              make: vMake,
              model: vModel,
              year: parseInt(vYear) || v.year,
              color: vColor,
              licensePlate: vPlate,
              currentMileage: parseInt(vMileage) || v.currentMileage,
              fuelType: vFuelType,
            }
          : v
      ))
    } else {
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        name: vName,
        make: vMake,
        model: vModel,
        year: parseInt(vYear) || new Date().getFullYear(),
        color: vColor,
        licensePlate: vPlate,
        vin: "",
        currentMileage: parseInt(vMileage) || 0,
        fuelType: vFuelType,
      }
      setVehicles(prev => [...prev, newVehicle])
    }
    resetVehicleForm()
    setVehicleDialogOpen(false)
  }

  const handleAddMaintenance = () => {
    if (!selectedVehicle || !mType) return

    const record: MaintenanceRecord = {
      id: Date.now().toString(),
      vehicleId: selectedVehicle.id,
      type: mType,
      description: mDescription,
      date: mDate,
      mileage: parseInt(mMileage) || selectedVehicle.currentMileage,
      cost: parseFloat(mCost) || 0,
    }
    setMaintenance(prev => [record, ...prev])
    resetMaintenanceForm()
    setMaintenanceDialogOpen(false)
  }

  const handleAddFuel = () => {
    if (!selectedVehicle || !fGallons || !fPrice) return

    const gallons = parseFloat(fGallons)
    const price = parseFloat(fPrice)
    const log: FuelLog = {
      id: Date.now().toString(),
      vehicleId: selectedVehicle.id,
      date: fDate,
      gallons,
      pricePerGallon: price,
      totalCost: gallons * price,
      mileage: parseInt(fMileage) || selectedVehicle.currentMileage,
    }
    setFuelLogs(prev => [log, ...prev])

    // Update vehicle mileage
    if (fMileage) {
      setVehicles(prev => prev.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, currentMileage: parseInt(fMileage) }
          : v
      ))
    }

    resetFuelForm()
    setFuelDialogOpen(false)
  }

  const resetVehicleForm = () => {
    setVName("")
    setVMake("")
    setVModel("")
    setVYear("")
    setVColor(vehicleColors[0])
    setVPlate("")
    setVMileage("")
    setVFuelType("gasoline")
    setEditingVehicle(null)
  }

  const resetMaintenanceForm = () => {
    setMType(maintenanceTypes[0])
    setMDescription("")
    setMDate(new Date().toISOString().split('T')[0])
    setMMileage("")
    setMCost("")
  }

  const resetFuelForm = () => {
    setFDate(new Date().toISOString().split('T')[0])
    setFGallons("")
    setFPrice("")
    setFMileage("")
  }

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setVName(vehicle.name)
    setVMake(vehicle.make)
    setVModel(vehicle.model)
    setVYear(vehicle.year.toString())
    setVColor(vehicle.color)
    setVPlate(vehicle.licensePlate)
    setVMileage(vehicle.currentMileage.toString())
    setVFuelType(vehicle.fuelType)
    setVehicleDialogOpen(true)
  }

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id))
    setMaintenance(prev => prev.filter(m => m.vehicleId !== id))
    setFuelLogs(prev => prev.filter(f => f.vehicleId !== id))
    if (selectedVehicle?.id === id) {
      setSelectedVehicle(null)
    }
  }

  // Vehicle Detail View
  if (selectedVehicle) {
    const vehicleMaintenance = maintenance.filter(m => m.vehicleId === selectedVehicle.id)
    const vehicleFuel = fuelLogs.filter(f => f.vehicleId === selectedVehicle.id)

    const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0)
    const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.totalCost, 0)

    // Calculate avg MPG
    const sortedFuel = [...vehicleFuel].sort((a, b) => b.mileage - a.mileage)
    let avgMpg = 0
    if (sortedFuel.length >= 2) {
      const milesDriven = sortedFuel[0].mileage - sortedFuel[sortedFuel.length - 1].mileage
      const gallonsUsed = sortedFuel.slice(0, -1).reduce((sum, f) => sum + f.gallons, 0)
      avgMpg = gallonsUsed > 0 ? milesDriven / gallonsUsed : 0
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setSelectedVehicle(null)}>
              <ChevronLeft className="size-4 mr-2" />
              All Vehicles
            </Button>
            <div className="flex items-center gap-3">
              <div
                className="size-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedVehicle.color}20` }}
              >
                <Car className="size-5" style={{ color: selectedVehicle.color }} />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{selectedVehicle.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Gauge className="size-4" />
              <span className="text-sm">Mileage</span>
            </div>
            <span className="text-2xl font-semibold">{selectedVehicle.currentMileage.toLocaleString()}</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <TrendingUp className="size-4" />
              <span className="text-sm">Avg MPG</span>
            </div>
            <span className="text-2xl font-semibold">{avgMpg.toFixed(1)}</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wrench className="size-4" />
              <span className="text-sm">Maintenance</span>
            </div>
            <span className="text-2xl font-semibold">${totalMaintenanceCost.toLocaleString()}</span>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Fuel className="size-4" />
              <span className="text-sm">Fuel Spent</span>
            </div>
            <span className="text-2xl font-semibold">${totalFuelCost.toFixed(2)}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {(["overview", "maintenance", "fuel"] as const).map((tab) => (
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

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Vehicle Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">License Plate</span>
                  <span>{selectedVehicle.licensePlate || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fuel Type</span>
                  <span className="capitalize">{selectedVehicle.fuelType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VIN</span>
                  <span className="font-mono text-xs">{selectedVehicle.vin || "—"}</span>
                </div>
              </div>
            </div>
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <h3 className="font-medium">Recent Activity</h3>
              <div className="space-y-2">
                {vehicleMaintenance.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-sm">
                    <Wrench className="size-3 text-muted-foreground" />
                    <span>{m.type}</span>
                    <span className="text-muted-foreground ml-auto">{m.date}</span>
                  </div>
                ))}
                {vehicleMaintenance.length === 0 && (
                  <p className="text-sm text-muted-foreground">No maintenance records</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetMaintenanceForm}>
                    <Plus className="size-4 mr-2" />
                    Add Record
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Maintenance Record</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={mType} onValueChange={setMType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={mDescription}
                        onChange={(e) => setMDescription(e.target.value)}
                        placeholder="Details about the service"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={mDate}
                          onChange={(e) => setMDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Mileage</Label>
                        <Input
                          type="number"
                          value={mMileage}
                          onChange={(e) => setMMileage(e.target.value)}
                          placeholder={selectedVehicle.currentMileage.toString()}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Cost</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          type="number"
                          value={mCost}
                          onChange={(e) => setMCost(e.target.value)}
                          placeholder="0.00"
                          className="pl-9"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddMaintenance} className="w-full">
                      Add Record
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {vehicleMaintenance.map((record) => (
                <div key={record.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <Wrench className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{record.type}</p>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${record.cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{record.date} • {record.mileage.toLocaleString()} mi</p>
                  </div>
                </div>
              ))}
              {vehicleMaintenance.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Wrench className="size-10 mx-auto mb-3 opacity-50" />
                  <p>No maintenance records</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "fuel" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={fuelDialogOpen} onOpenChange={setFuelDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetFuelForm}>
                    <Plus className="size-4 mr-2" />
                    Log Fill-up
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Fuel Fill-up</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={fDate}
                          onChange={(e) => setFDate(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Odometer</Label>
                        <Input
                          type="number"
                          value={fMileage}
                          onChange={(e) => setFMileage(e.target.value)}
                          placeholder={selectedVehicle.currentMileage.toString()}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gallons</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={fGallons}
                          onChange={(e) => setFGallons(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price/Gallon</Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            type="number"
                            step="0.01"
                            value={fPrice}
                            onChange={(e) => setFPrice(e.target.value)}
                            placeholder="0.00"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>
                    {fGallons && fPrice && (
                      <div className="bg-muted rounded-lg p-3 text-center">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="text-xl font-semibold">
                          ${(parseFloat(fGallons) * parseFloat(fPrice)).toFixed(2)}
                        </p>
                      </div>
                    )}
                    <Button onClick={handleAddFuel} className="w-full">
                      Log Fill-up
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {vehicleFuel.map((log) => (
                <div key={log.id} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-muted flex items-center justify-center">
                      <Fuel className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{log.gallons.toFixed(2)} gal @ ${log.pricePerGallon.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">{log.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${log.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{log.mileage.toLocaleString()} mi</p>
                  </div>
                </div>
              ))}
              {vehicleFuel.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Fuel className="size-10 mx-auto mb-3 opacity-50" />
                  <p>No fuel logs</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vehicles List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground">Track your vehicles, maintenance, and fuel</p>
        </div>
        <Dialog open={vehicleDialogOpen} onOpenChange={setVehicleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetVehicleForm}>
              <Plus className="size-4 mr-2" />
              Add Vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nickname</Label>
                <Input
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  placeholder="e.g., Daily Driver"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={vYear}
                    onChange={(e) => setVYear(e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Make</Label>
                  <Input
                    value={vMake}
                    onChange={(e) => setVMake(e.target.value)}
                    placeholder="Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Input
                    value={vModel}
                    onChange={(e) => setVModel(e.target.value)}
                    placeholder="Camry"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Plate</Label>
                  <Input
                    value={vPlate}
                    onChange={(e) => setVPlate(e.target.value)}
                    placeholder="ABC 123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuel Type</Label>
                  <Select value={vFuelType} onValueChange={(v) => setVFuelType(v as Vehicle["fuelType"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gasoline">Gasoline</SelectItem>
                      <SelectItem value="diesel">Diesel</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Current Mileage</Label>
                <Input
                  type="number"
                  value={vMileage}
                  onChange={(e) => setVMileage(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {vehicleColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setVColor(color)}
                      className={cn(
                        "size-8 rounded-full transition-transform",
                        vColor === color && "ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleSaveVehicle} className="w-full">
                {editingVehicle ? "Save Changes" : "Add Vehicle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Car className="size-4" />
            <span className="text-sm">Total Vehicles</span>
          </div>
          <span className="text-2xl font-semibold">{vehicles.length}</span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="size-4" />
            <span className="text-sm">Total Maintenance</span>
          </div>
          <span className="text-2xl font-semibold">
            ${maintenance.reduce((sum, m) => sum + m.cost, 0).toLocaleString()}
          </span>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Fuel className="size-4" />
            <span className="text-sm">Total Fuel</span>
          </div>
          <span className="text-2xl font-semibold">
            ${fuelLogs.reduce((sum, f) => sum + f.totalCost, 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => {
          const vMaint = maintenance.filter(m => m.vehicleId === vehicle.id)
          const lastMaint = vMaint[0]

          return (
            <div
              key={vehicle.id}
              className="bg-card border rounded-lg p-5 cursor-pointer hover:border-foreground/20 transition-colors"
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${vehicle.color}20` }}
                  >
                    <Car className="size-6" style={{ color: vehicle.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium">{vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditVehicle(vehicle) }}>
                      <Pencil className="size-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => { e.stopPropagation(); deleteVehicle(vehicle.id) }}
                      className="text-destructive"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Gauge className="size-4" />
                  <span>{vehicle.currentMileage.toLocaleString()} mi</span>
                </div>
                {lastMaint && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="size-4" />
                    <span>Last: {lastMaint.type}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Car className="size-12 mx-auto mb-4 opacity-50" />
          <p>No vehicles yet</p>
          <p className="text-sm">Add a vehicle to start tracking</p>
        </div>
      )}
    </div>
  )
}
