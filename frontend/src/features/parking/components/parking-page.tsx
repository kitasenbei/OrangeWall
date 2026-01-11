import { useState, useEffect } from "react"
import { Car, MapPin, Clock, Trash2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ParkingSpot {
  id: string
  location: string
  floor: string
  spot: string
  notes: string
  parkedAt: string
  expiresAt: string | null
  photo: string | null
}

export function ParkingPage() {
  const [spots, setSpots] = useState<ParkingSpot[]>([
    { id: "1", location: "Downtown Mall Parking", floor: "Level 3", spot: "A-42", notes: "Near elevator", parkedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), photo: null }
  ])
  const [isParking, setIsParking] = useState(false)
  const [location, setLocation] = useState("")
  const [floor, setFloor] = useState("")
  const [spot, setSpot] = useState("")
  const [notes, setNotes] = useState("")
  const [duration, setDuration] = useState("")
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const saveParking = () => {
    if (!location) return
    const newSpot: ParkingSpot = {
      id: Date.now().toString(),
      location,
      floor,
      spot,
      notes,
      parkedAt: new Date().toISOString(),
      expiresAt: duration ? new Date(Date.now() + parseFloat(duration) * 60 * 60 * 1000).toISOString() : null,
      photo: null
    }
    setSpots([newSpot, ...spots])
    setLocation(""); setFloor(""); setSpot(""); setNotes(""); setDuration("")
    setIsParking(false)
  }

  const deleteSpot = (id: string) => setSpots(spots.filter(s => s.id !== id))

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now
    if (diff <= 0) return { text: "Expired!", urgent: true }
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    return {
      text: hours > 0 ? `${hours}h ${minutes}m remaining` : `${minutes}m ${seconds}s remaining`,
      urgent: diff < 15 * 60 * 1000
    }
  }

  const getElapsedTime = (parkedAt: string) => {
    const diff = now - new Date(parkedAt).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
  }

  const currentSpot = spots[0]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Parking Reminder</h1><p className="text-sm text-muted-foreground">Never forget where you parked</p></div>
        {!isParking && <Button onClick={() => setIsParking(true)}><Car className="size-4 mr-2" />Save Parking</Button>}
      </div>

      {isParking && (
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="space-y-2"><Label>Location / Parking Lot</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="Downtown Mall Parking" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Floor / Level</Label><Input value={floor} onChange={e => setFloor(e.target.value)} placeholder="Level 3" /></div>
            <div className="space-y-2"><Label>Spot Number</Label><Input value={spot} onChange={e => setSpot(e.target.value)} placeholder="A-42" /></div>
          </div>
          <div className="space-y-2"><Label>Meter Time (hours, optional)</Label><Input type="number" step="0.5" value={duration} onChange={e => setDuration(e.target.value)} placeholder="2" /></div>
          <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Near the elevator, blue pillar..." /></div>
          <div className="flex gap-2">
            <Button onClick={saveParking} className="flex-1">Save Location</Button>
            <Button variant="outline" onClick={() => setIsParking(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {currentSpot && !isParking && (
        <div className="bg-card border-2 border-primary rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg"><Car className="size-6 text-primary" /></div>
              <div>
                <h3 className="font-semibold text-lg">Current Parking</h3>
                <p className="text-sm text-muted-foreground">Parked {getElapsedTime(currentSpot.parkedAt)} ago</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => deleteSpot(currentSpot.id)}><Trash2 className="size-4" /></Button>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground" />
              <span className="font-medium">{currentSpot.location}</span>
            </div>
            {(currentSpot.floor || currentSpot.spot) && (
              <div className="flex items-center gap-4 text-sm">
                {currentSpot.floor && <span className="px-3 py-1 bg-muted rounded-lg">{currentSpot.floor}</span>}
                {currentSpot.spot && <span className="px-3 py-1 bg-muted rounded-lg font-mono">Spot {currentSpot.spot}</span>}
              </div>
            )}
            {currentSpot.notes && <p className="text-sm text-muted-foreground">{currentSpot.notes}</p>}
          </div>

          {currentSpot.expiresAt && (
            <div className={`flex items-center gap-2 p-3 rounded-lg ${getTimeRemaining(currentSpot.expiresAt).urgent ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-600"}`}>
              {getTimeRemaining(currentSpot.expiresAt).urgent ? <Bell className="size-4" /> : <Clock className="size-4" />}
              <span className="font-medium">{getTimeRemaining(currentSpot.expiresAt).text}</span>
            </div>
          )}

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">Parked at {new Date(currentSpot.parkedAt).toLocaleString()}</p>
          </div>
        </div>
      )}

      {spots.length > 1 && (
        <div className="space-y-3">
          <Label className="text-muted-foreground">Previous Locations</Label>
          {spots.slice(1).map(s => (
            <div key={s.id} className="bg-card border rounded-lg p-4 opacity-60">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{s.location}</h3>
                  <p className="text-sm text-muted-foreground">{[s.floor, s.spot && `Spot ${s.spot}`].filter(Boolean).join(" • ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(s.parkedAt).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteSpot(s.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {spots.length === 0 && !isParking && <p className="text-center py-8 text-muted-foreground">No parking saved. Click "Save Parking" when you park.</p>}
    </div>
  )
}
