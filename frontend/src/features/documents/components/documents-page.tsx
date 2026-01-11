import { useState } from "react"
import { Plus, FileText, Calendar, MoreVertical, Pencil, Trash2, AlertTriangle, CreditCard, Car, Plane } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { LucideIcon } from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  number: string
  issueDate: string
  expiryDate: string
  notes: string
}

const docTypes: { name: string; icon: LucideIcon }[] = [
  { name: "Passport", icon: Plane },
  { name: "Driver's License", icon: Car },
  { name: "ID Card", icon: CreditCard },
  { name: "Visa", icon: Plane },
  { name: "Insurance", icon: FileText },
  { name: "Other", icon: FileText },
]

const initialDocuments: Document[] = [
  { id: "1", name: "US Passport", type: "Passport", number: "****1234", issueDate: "2020-03-15", expiryDate: "2030-03-14", notes: "Keep in safe" },
  { id: "2", name: "Driver's License", type: "Driver's License", number: "****5678", issueDate: "2022-06-01", expiryDate: "2026-06-01", notes: "CA license" },
  { id: "3", name: "Health Insurance", type: "Insurance", number: "****9012", issueDate: "2024-01-01", expiryDate: "2024-12-31", notes: "Blue Cross" },
]

export function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Document | null>(null)
  const [name, setName] = useState(""); const [type, setType] = useState("Passport")
  const [number, setNumber] = useState(""); const [issueDate, setIssueDate] = useState("")
  const [expiryDate, setExpiryDate] = useState(""); const [notes, setNotes] = useState("")

  const resetForm = () => { setName(""); setType("Passport"); setNumber(""); setIssueDate(""); setExpiryDate(""); setNotes(""); setEditing(null) }

  const handleSave = () => {
    if (!name || !expiryDate) return
    const data = { name, type, number, issueDate, expiryDate, notes }
    if (editing) { setDocuments(documents.map(d => d.id === editing.id ? { ...d, ...data } : d)) }
    else { setDocuments([...documents, { id: Date.now().toString(), ...data }]) }
    resetForm(); setDialogOpen(false)
  }

  const openEdit = (d: Document) => { setEditing(d); setName(d.name); setType(d.type); setNumber(d.number); setIssueDate(d.issueDate); setExpiryDate(d.expiryDate); setNotes(d.notes); setDialogOpen(true) }
  const deleteDocument = (id: string) => setDocuments(documents.filter(d => d.id !== id))

  const getDaysUntilExpiry = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const sorted = [...documents].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())

  const getStatus = (days: number) => {
    if (days <= 0) return { color: "text-red-500", bg: "bg-red-500/10", label: "Expired" }
    if (days <= 30) return { color: "text-red-500", bg: "bg-red-500/10", label: `${days} days` }
    if (days <= 90) return { color: "text-yellow-500", bg: "bg-yellow-500/10", label: `${days} days` }
    if (days <= 180) return { color: "text-blue-500", bg: "bg-blue-500/10", label: `${Math.floor(days / 30)} months` }
    return { color: "text-green-500", bg: "bg-green-500/10", label: `${Math.floor(days / 365)} years` }
  }

  const getIcon = (typeName: string) => docTypes.find(t => t.name === typeName)?.icon || FileText

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Documents</h1><p className="text-sm text-muted-foreground">Track important document expirations</p></div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) resetForm() }}>
          <DialogTrigger asChild><Button onClick={resetForm}><Plus className="size-4 mr-2" />Add Document</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit" : "Add"} Document</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Document Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="US Passport" /></div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <select value={type} onChange={e => setType(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">
                    {docTypes.map(t => <option key={t.name}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2"><Label>Number (last 4 digits)</Label><Input value={number} onChange={e => setNumber(e.target.value)} placeholder="****1234" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Issue Date</Label><Input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} /></div>
                <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Notes</Label><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Storage location, renewal info..." /></div>
              <Button onClick={handleSave} className="w-full">{editing ? "Save" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {sorted.map(doc => {
          const days = getDaysUntilExpiry(doc.expiryDate)
          const status = getStatus(days)
          const Icon = getIcon(doc.type)
          return (
            <div key={doc.id} className={`bg-card border rounded-lg p-4 ${days <= 0 ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${status.bg}`}><Icon className={`size-5 ${status.color}`} /></div>
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.type} {doc.number && `• ${doc.number}`}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3" />{days <= 0 ? "Expired" : "Expires"} {new Date(doc.expiryDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {days <= 90 && days > 0 && <AlertTriangle className="size-4 text-yellow-500" />}
                  <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(doc)}><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteDocument(doc.id)} className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              {doc.notes && <p className="mt-2 text-sm text-muted-foreground">{doc.notes}</p>}
            </div>
          )
        })}
      </div>

      {documents.length === 0 && <p className="text-center py-8 text-muted-foreground">No documents tracked</p>}
    </div>
  )
}
