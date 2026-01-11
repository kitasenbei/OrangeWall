import { useState } from "react"
import { Plus, Trash2, Shuffle, Gift, Eye, EyeOff, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Participant {
  id: string
  name: string
  email: string
  exclusions: string[]
}

interface Assignment {
  giver: string
  receiver: string
}

export function SecretSantaPage() {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "Alice", email: "alice@example.com", exclusions: [] },
    { id: "2", name: "Bob", email: "bob@example.com", exclusions: [] },
    { id: "3", name: "Charlie", email: "charlie@example.com", exclusions: [] },
    { id: "4", name: "Diana", email: "diana@example.com", exclusions: [] },
  ])
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)
  const [error, setError] = useState("")

  const addParticipant = () => {
    if (!newName.trim()) return
    setParticipants([...participants, { id: Date.now().toString(), name: newName.trim(), email: newEmail.trim(), exclusions: [] }])
    setNewName(""); setNewEmail("")
    setAssignments([])
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
    setAssignments([])
  }

  const toggleExclusion = (participantId: string, excludeName: string) => {
    setParticipants(participants.map(p => {
      if (p.id !== participantId) return p
      const exclusions = p.exclusions.includes(excludeName)
        ? p.exclusions.filter(e => e !== excludeName)
        : [...p.exclusions, excludeName]
      return { ...p, exclusions }
    }))
    setAssignments([])
  }

  const generateAssignments = () => {
    setError("")
    if (participants.length < 3) {
      setError("Need at least 3 participants")
      return
    }

    const names = participants.map(p => p.name)
    const exclusionMap = new Map(participants.map(p => [p.name, new Set(p.exclusions)]))

    // Try to generate valid assignments
    for (let attempt = 0; attempt < 1000; attempt++) {
      const shuffled = [...names].sort(() => Math.random() - 0.5)
      const newAssignments: Assignment[] = []
      let valid = true

      for (let i = 0; i < shuffled.length; i++) {
        const giver = shuffled[i]
        const receiver = shuffled[(i + 1) % shuffled.length]

        if (giver === receiver || exclusionMap.get(giver)?.has(receiver)) {
          valid = false
          break
        }
        newAssignments.push({ giver, receiver })
      }

      if (valid) {
        setAssignments(newAssignments)
        setRevealed(new Set())
        return
      }
    }

    setError("Could not generate valid assignments with current exclusions. Try removing some exclusions.")
  }

  const toggleReveal = (name: string) => {
    const newRevealed = new Set(revealed)
    if (newRevealed.has(name)) newRevealed.delete(name)
    else newRevealed.add(name)
    setRevealed(newRevealed)
  }

  const copyAssignment = (assignment: Assignment) => {
    const text = `🎅 Secret Santa Assignment\n\n${assignment.giver}, you are buying a gift for: ${assignment.receiver}\n\nHappy gifting!`
    navigator.clipboard.writeText(text)
    setCopied(assignment.giver)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Secret Santa</h1><p className="text-sm text-muted-foreground">Organize your gift exchange</p></div>
        <Button onClick={generateAssignments} disabled={participants.length < 3}><Shuffle className="size-4 mr-2" />Draw Names</Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Label>Participants ({participants.length})</Label>

          <div className="flex gap-2">
            <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Name" onKeyDown={e => e.key === "Enter" && addParticipant()} />
            <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Email (optional)" className="flex-1" />
            <Button onClick={addParticipant}><Plus className="size-4" /></Button>
          </div>

          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="bg-card border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{p.name}</span>
                    {p.email && <span className="text-sm text-muted-foreground ml-2">{p.email}</span>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeParticipant(p.id)}><Trash2 className="size-4" /></Button>
                </div>
                {participants.length > 2 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Can't give to:</p>
                    <div className="flex gap-1 flex-wrap">
                      {participants.filter(other => other.id !== p.id).map(other => (
                        <button key={other.id} onClick={() => toggleExclusion(p.id, other.name)} className={`px-2 py-0.5 rounded text-xs ${p.exclusions.includes(other.name) ? "bg-red-500/20 text-red-500" : "bg-muted"}`}>{other.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {assignments.length > 0 && (
          <div className="space-y-4">
            <Label className="flex items-center gap-2"><Gift className="size-4 text-primary" />Assignments</Label>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.giver} className="bg-card border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{a.giver}</span>
                    <span className="text-muted-foreground">→</span>
                    {revealed.has(a.giver) ? (
                      <span className="font-medium text-primary">{a.receiver}</span>
                    ) : (
                      <span className="text-muted-foreground italic">Hidden</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => toggleReveal(a.giver)}>
                      {revealed.has(a.giver) ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => copyAssignment(a)}>
                      {copied === a.giver ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => setRevealed(new Set(assignments.map(a => a.giver)))} className="w-full">Reveal All</Button>
          </div>
        )}
      </div>

      {assignments.length === 0 && participants.length >= 3 && (
        <p className="text-center py-8 text-muted-foreground">Click "Draw Names" to generate Secret Santa assignments</p>
      )}
    </div>
  )
}
