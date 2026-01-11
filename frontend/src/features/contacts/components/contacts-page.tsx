import { useState } from "react"
import { Plus, Search, User, Mail, Phone, Calendar, Building, MoreHorizontal, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useContacts, type Contact } from "@/hooks"

const categoryConfig = {
  investor: { label: "Investor", color: "bg-green-500" },
  client: { label: "Client", color: "bg-blue-500" },
  partner: { label: "Partner", color: "bg-purple-500" },
  mentor: { label: "Mentor", color: "bg-orange-500" },
  other: { label: "Other", color: "bg-gray-500" },
}

function formatDate(date: string | null): string {
  if (!date) return "-"
  const d = new Date(date)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.floor(diff / 86400000)

  if (days < -30) return d.toLocaleDateString()
  if (days < -1) return `${Math.abs(days)} days ago`
  if (days === -1) return "Yesterday"
  if (days === 0) return "Today"
  if (days === 1) return "Tomorrow"
  if (days < 7) return `In ${days} days`
  return d.toLocaleDateString()
}

export function ContactsPage() {
  const {
    contacts,
    loading,
    error,
    createContact,
    updateContact,
    deleteContact: deleteContactApi,
  } = useContacts()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    category: "other" as Contact["category"],
    notes: "",
  })

  const filteredContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !selectedCategory || contact.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Sort by next follow-up (soonest first), then by last contact
      if (a.nextFollowUp && b.nextFollowUp) {
        return new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime()
      }
      if (a.nextFollowUp) return -1
      if (b.nextFollowUp) return 1
      const aLast = a.lastContact ? new Date(a.lastContact).getTime() : 0
      const bLast = b.lastContact ? new Date(b.lastContact).getTime() : 0
      return bLast - aLast
    })

  const handleCreate = async () => {
    try {
      await createContact({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        role: formData.role || undefined,
        category: formData.category,
        notes: formData.notes || undefined,
      })
      setIsDialogOpen(false)
      setFormData({ name: "", email: "", phone: "", company: "", role: "", category: "other", notes: "" })
    } catch (err) {
      console.error("Failed to create contact:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContactApi(id)
    } catch (err) {
      console.error("Failed to delete contact:", err)
    }
  }

  const handleLogContact = async (id: string) => {
    try {
      await updateContact(id, { lastContact: new Date().toISOString() })
    } catch (err) {
      console.error("Failed to log contact:", err)
    }
  }

  const needsFollowUp = contacts.filter(
    (c) => c.nextFollowUp && new Date(c.nextFollowUp).getTime() <= Date.now() + 86400000 * 3
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin mb-4" />
        <p>Loading contacts...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <AlertCircle className="size-8 text-destructive mb-4" />
        <p className="text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground">Your network and relationships</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="size-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Follow-up Reminder */}
      {needsFollowUp.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h3 className="font-medium text-orange-800 mb-2">Follow-ups Due</h3>
          <div className="flex flex-wrap gap-2">
            {needsFollowUp.map((c) => (
              <span
                key={c.id}
                className="text-sm bg-white px-2 py-1 rounded border cursor-pointer hover:bg-orange-100"
                onClick={() => setSelectedContact(c)}
              >
                {c.name} - {formatDate(c.nextFollowUp)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Contacts List */}
      <div className="rounded-lg border bg-card divide-y">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
            onClick={() => setSelectedContact(contact)}
          >
            <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
              <User className="size-5 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{contact.name}</span>
                <span className={cn(
                  "text-xs px-1.5 py-0.5 rounded text-white",
                  categoryConfig[contact.category].color
                )}>
                  {categoryConfig[contact.category].label}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {contact.company && <span>{contact.company}</span>}
                {contact.role && <span>• {contact.role}</span>}
              </div>
            </div>
            <div className="text-right text-sm hidden sm:block">
              <p className="text-muted-foreground">Last: {formatDate(contact.lastContact)}</p>
              {contact.nextFollowUp && (
                <p className={cn(
                  new Date(contact.nextFollowUp).getTime() <= Date.now() ? "text-orange-600" : "text-muted-foreground"
                )}>
                  Follow-up: {formatDate(contact.nextFollowUp)}
                </p>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleLogContact(contact.id) }}>
                  <Calendar className="size-4 mr-2" />
                  Log Contact
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => { e.stopPropagation(); handleDelete(contact.id) }}
                >
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center">
            <User className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No contacts found</h3>
            <p className="text-muted-foreground">Add your first contact to start building your network</p>
          </div>
        )}
      </div>

      {/* Add Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-0123"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="CEO"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as Contact["category"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="How did you meet? What are they interested in?"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={!formData.name.trim()}>
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Contact Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedContact.name}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded text-white",
                    categoryConfig[selectedContact.category].color
                  )}>
                    {categoryConfig[selectedContact.category].label}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {selectedContact.company && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="size-4 text-muted-foreground" />
                    <span>{selectedContact.company}</span>
                    {selectedContact.role && <span className="text-muted-foreground">• {selectedContact.role}</span>}
                  </div>
                )}
                {selectedContact.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="size-4 text-muted-foreground" />
                    <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                      {selectedContact.email}
                    </a>
                  </div>
                )}
                {selectedContact.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline">
                      {selectedContact.phone}
                    </a>
                  </div>
                )}
                {selectedContact.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedContact.notes}</p>
                  </div>
                )}
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Last contact:</span>{" "}
                    <span>{formatDate(selectedContact.lastContact)}</span>
                  </div>
                  {selectedContact.nextFollowUp && (
                    <div>
                      <span className="text-muted-foreground">Follow-up:</span>{" "}
                      <span>{formatDate(selectedContact.nextFollowUp)}</span>
                    </div>
                  )}
                </div>
                <Button onClick={() => { handleLogContact(selectedContact.id); setSelectedContact(null) }}>
                  <Calendar className="size-4 mr-2" />
                  Log Contact
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
