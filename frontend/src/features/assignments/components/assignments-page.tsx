import { useState } from "react"
import { Plus, BookOpen, Calendar, MoreVertical, Pencil, Trash2, CheckCircle, Circle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  priority: "low" | "medium" | "high"
  notes: string
  completed: boolean
}

const initialAssignments: Assignment[] = [
  { id: "1", title: "Essay on Climate Change", course: "Environmental Science", dueDate: "2025-01-20", priority: "high", notes: "2000 words minimum", completed: false },
  { id: "2", title: "Problem Set 5", course: "Calculus II", dueDate: "2025-01-18", priority: "medium", notes: "Chapters 8-9", completed: false },
  { id: "3", title: "Lab Report", course: "Chemistry", dueDate: "2025-01-15", priority: "high", notes: "Include all data tables", completed: true },
  { id: "4", title: "Reading Response", course: "Literature", dueDate: "2025-01-25", priority: "low", notes: "", completed: false },
]

export function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [title, setTitle] = useState(""); const [course, setCourse] = useState("")
  const [dueDate, setDueDate] = useState(""); const [priority, setPriority] = useState<"low" | "medium" | "high">("medium")
  const [notes, setNotes] = useState("")

  const resetForm = () => { setTitle(""); setCourse(""); setDueDate(""); setPriority("medium"); setNotes(""); setEditing(null) }

  const handleSave = () => {
    if (!title || !dueDate) return
    const data = { title, course, dueDate, priority, notes, completed: editing?.completed || false }
    if (editing) { setAssignments(assignments.map(a => a.id === editing.id ? { ...a, ...data } : a)) }
    else { setAssignments([...assignments, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const openEdit = (a: Assignment) => { setEditing(a); setTitle(a.title); setCourse(a.course); setDueDate(a.dueDate); setPriority(a.priority); setNotes(a.notes); setDialogOpen(true) }
  const deleteAssignment = (id: string) => setAssignments(assignments.filter(a => a.id !== id))
  const toggleComplete = (id: string) => setAssignments(assignments.map(a => a.id === id ? { ...a, completed: !a.completed } : a))

  const getDaysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const sorted = [...assignments].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const active = sorted.filter(a => !a.completed)
  const completed = sorted.filter(a => a.completed)

  const getPriorityColor = (p: string) => {
    if (p === "high") return "text-red-500 bg-red-500/10"
    if (p === "medium") return "text-yellow-500 bg-yellow-500/10"
    return "text-green-500 bg-green-500/10"
  }

  const courses = [...new Set(assignments.map(a => a.course).filter(Boolean))]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Assignments</h1><p className="text-sm text-muted-foreground">{active.length} pending assignments</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Assignment</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Essay on Climate Change" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course</Label>
                  <Input list="courses" value={course} onChange={e => setCourse(e.target.value)} placeholder="Environmental Science" />
                  <datalist id="courses">{courses.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map(p => (
                    <button key={p} onClick={() => setPriority(p)} className={`px-3 py-1 rounded-full text-sm capitalize ${priority === p ? getPriorityColor(p) : "bg-muted"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {active.length > 0 && (
        <div className="space-y-3">
          {active.map(a => {
            const days = getDaysUntil(a.dueDate)
            const overdue = days < 0
            return (
              <div key={a.id} className={`bg-card border rounded-lg p-4 ${overdue ? "border-red-500/50" : ""}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleComplete(a.id)} className="mt-1"><Circle className="size-5 text-muted-foreground hover:text-primary" /></button>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{a.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {a.course && <span className="text-sm text-muted-foreground flex items-center gap-1"><BookOpen className="size-3" />{a.course}</span>}
                          <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getPriorityColor(a.priority)}`}>{a.priority}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm font-medium flex items-center gap-1 ${overdue ? "text-red-500" : days <= 3 ? "text-yellow-500" : "text-muted-foreground"}`}>
                          {overdue && <AlertTriangle className="size-4" />}
                          <Calendar className="size-3" />
                          {overdue ? `${Math.abs(days)} days overdue` : days === 0 ? "Due today" : days === 1 ? "Due tomorrow" : `${days} days`}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(a)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteAssignment(a.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {a.notes && <p className="mt-2 text-sm text-muted-foreground">{a.notes}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {completed.length > 0 && (
        <div className="space-y-3">
          <Label className="text-muted-foreground">Completed ({completed.length})</Label>
          {completed.map(a => (
            <div key={a.id} className="bg-card border rounded-lg p-4 opacity-60">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleComplete(a.id)}><CheckCircle className="size-5 text-green-500" /></button>
                <div className="flex-1">
                  <h3 className="font-medium line-through">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.course}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteAssignment(a.id)}><Trash2 className="size-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {assignments.length === 0 && <p className="text-center py-8 text-muted-foreground">No assignments tracked</p>}
    </div>
  )
}
