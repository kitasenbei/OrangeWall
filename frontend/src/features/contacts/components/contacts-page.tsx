import { useState } from "react"
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  MoreHorizontal,
  Trash2,
  Loader2,
  AlertCircle,
  Globe,
  X,
} from "lucide-react"
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
import { useContacts, type Contact, type ContactLink, type LinkType } from "@/hooks"

// Brand SVG icons (from Simple Icons)
const BrandIcons = {
  discord: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  twitter: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  ),
  linkedin: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  instagram: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
    </svg>
  ),
  github: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  telegram: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  whatsapp: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  line: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
    </svg>
  ),
  slack: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  ),
}

// Platform configuration with icons
const platformConfig: Record<LinkType, { label: string; icon: React.ReactNode; placeholder: string }> = {
  email: { label: "Email", icon: <Mail className="size-4" />, placeholder: "email@example.com" },
  phone: { label: "Phone", icon: <Phone className="size-4" />, placeholder: "+81 90-1234-5678" },
  discord: { label: "Discord", icon: BrandIcons.discord, placeholder: "username#1234" },
  twitter: { label: "Twitter/X", icon: BrandIcons.twitter, placeholder: "@username" },
  linkedin: { label: "LinkedIn", icon: BrandIcons.linkedin, placeholder: "linkedin.com/in/username" },
  instagram: { label: "Instagram", icon: BrandIcons.instagram, placeholder: "@username" },
  github: { label: "GitHub", icon: BrandIcons.github, placeholder: "github.com/username" },
  telegram: { label: "Telegram", icon: BrandIcons.telegram, placeholder: "@username" },
  whatsapp: { label: "WhatsApp", icon: BrandIcons.whatsapp, placeholder: "+81 90-1234-5678" },
  line: { label: "LINE", icon: BrandIcons.line, placeholder: "line_id" },
  slack: { label: "Slack", icon: BrandIcons.slack, placeholder: "@username" },
  website: { label: "Website", icon: <Globe className="size-4" />, placeholder: "https://example.com" },
}

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

function LinkIcon({ type }: { type: LinkType }) {
  return <span className="flex items-center justify-center size-4">{platformConfig[type]?.icon}</span>
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
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    role: "",
    category: "other" as Contact["category"],
    notes: "",
    links: [] as ContactLink[],
  })
  const [newLinkType, setNewLinkType] = useState<LinkType>("email")
  const [newLinkValue, setNewLinkValue] = useState("")

  const filteredContacts = contacts
    .filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.links?.some(l => l.value.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = !selectedCategory || contact.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      // Sort by next follow-up (soonest first), then alphabetically
      if (a.nextFollowUp && b.nextFollowUp) {
        return new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime()
      }
      if (a.nextFollowUp) return -1
      if (b.nextFollowUp) return 1
      return a.name.localeCompare(b.name)
    })

  const resetForm = () => {
    setFormData({ name: "", company: "", role: "", category: "other", notes: "", links: [] })
    setNewLinkType("email")
    setNewLinkValue("")
  }

  const openCreateDialog = () => {
    resetForm()
    setIsEditing(false)
    setIsDialogOpen(true)
  }

  const openEditDialog = (contact: Contact) => {
    setFormData({
      name: contact.name,
      company: contact.company || "",
      role: contact.role || "",
      category: contact.category,
      notes: contact.notes || "",
      links: contact.links || [],
    })
    setIsEditing(true)
    setSelectedContact(contact)
    setIsDialogOpen(true)
  }

  const addLink = () => {
    if (!newLinkValue.trim()) return
    setFormData({
      ...formData,
      links: [...formData.links, { type: newLinkType, value: newLinkValue.trim() }],
    })
    setNewLinkValue("")
  }

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index),
    })
  }

  const handleCreate = async () => {
    try {
      await createContact({
        name: formData.name,
        company: formData.company || undefined,
        role: formData.role || undefined,
        category: formData.category,
        notes: formData.notes || undefined,
        links: formData.links,
      })
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Failed to create contact:", err)
    }
  }

  const handleUpdate = async () => {
    if (!selectedContact) return
    try {
      await updateContact(selectedContact.id, {
        name: formData.name,
        company: formData.company || undefined,
        role: formData.role || undefined,
        category: formData.category,
        notes: formData.notes || undefined,
        links: formData.links,
      })
      setIsDialogOpen(false)
      setSelectedContact(null)
      resetForm()
    } catch (err) {
      console.error("Failed to update contact:", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContactApi(id)
      setSelectedContact(null)
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
        <Button onClick={openCreateDialog}>
          <Plus className="size-4 mr-2" />
          Add Contact
        </Button>
      </div>

      {/* Follow-up Reminder */}
      {needsFollowUp.length > 0 && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 p-4">
          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Follow-ups Due</h3>
          <div className="flex flex-wrap gap-2">
            {needsFollowUp.map((c) => (
              <span
                key={c.id}
                className="text-sm bg-white dark:bg-background px-2 py-1 rounded border cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20"
                onClick={() => { setSelectedContact(c); setIsEditing(false) }}
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
        {filteredContacts.map((contact) => {
          return (
            <div
              key={contact.id}
              className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer"
              onClick={() => { setSelectedContact(contact); setIsEditing(false) }}
            >
              <div className="size-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <User className="size-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{contact.name}</span>
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded text-white",
                    categoryConfig[contact.category]?.color || "bg-gray-500"
                  )}>
                    {categoryConfig[contact.category]?.label || contact.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {contact.company && <span>{contact.company}</span>}
                  {contact.role && <span>• {contact.role}</span>}
                </div>
                {/* Show link icons */}
                {contact.links && contact.links.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    {contact.links.slice(0, 5).map((link, i) => (
                      <span key={i} className="text-muted-foreground" title={`${platformConfig[link.type]?.label}: ${link.value}`}>
                        <LinkIcon type={link.type} />
                      </span>
                    ))}
                    {contact.links.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{contact.links.length - 5}</span>
                    )}
                  </div>
                )}
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
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(contact) }}>
                    Edit
                  </DropdownMenuItem>
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
          )
        })}

        {filteredContacts.length === 0 && (
          <div className="p-8 text-center">
            <User className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No contacts found</h3>
            <p className="text-muted-foreground">Add your first contact to start building your network</p>
          </div>
        )}
      </div>

      {/* Add/Edit Contact Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Contact" : "Add Contact"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
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

            {/* Links Section */}
            <div className="flex flex-col gap-2">
              <Label>Contact Links</Label>

              {/* Existing links */}
              {formData.links.length > 0 && (
                <div className="flex flex-col gap-2 mb-2">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <LinkIcon type={link.type} />
                      <span className="text-sm font-medium">{platformConfig[link.type]?.label}</span>
                      <span className="text-sm text-muted-foreground flex-1 truncate">{link.value}</span>
                      <Button variant="ghost" size="icon" className="size-6" onClick={() => removeLink(index)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new link */}
              <div className="flex gap-2">
                <Select value={newLinkType} onValueChange={(v) => setNewLinkType(v as LinkType)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(platformConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={newLinkValue}
                  onChange={(e) => setNewLinkValue(e.target.value)}
                  placeholder={platformConfig[newLinkType]?.placeholder}
                  className="flex-1"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLink() } }}
                />
                <Button variant="outline" onClick={addLink} disabled={!newLinkValue.trim()}>
                  <Plus className="size-4" />
                </Button>
              </div>
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
              <Button onClick={isEditing ? handleUpdate : handleCreate} disabled={!formData.name.trim()}>
                {isEditing ? "Save Changes" : "Add Contact"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Contact Dialog */}
      <Dialog open={!!selectedContact && !isEditing} onOpenChange={() => setSelectedContact(null)}>
        <DialogContent>
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedContact.name}
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded text-white",
                    categoryConfig[selectedContact.category]?.color || "bg-gray-500"
                  )}>
                    {categoryConfig[selectedContact.category]?.label || selectedContact.category}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4">
                {(selectedContact.company || selectedContact.role) && (
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="size-4 text-muted-foreground" />
                    <span>{selectedContact.company}</span>
                    {selectedContact.role && <span className="text-muted-foreground">• {selectedContact.role}</span>}
                  </div>
                )}

                {/* Links */}
                {selectedContact.links && selectedContact.links.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {selectedContact.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <LinkIcon type={link.type} />
                        <span className="text-muted-foreground">{platformConfig[link.type]?.label}:</span>
                        {link.type === "email" ? (
                          <a href={`mailto:${link.value}`} className="text-primary hover:underline">{link.value}</a>
                        ) : link.type === "phone" || link.type === "whatsapp" ? (
                          <a href={`tel:${link.value}`} className="text-primary hover:underline">{link.value}</a>
                        ) : link.type === "website" || link.type === "linkedin" || link.type === "github" ? (
                          <a href={link.value.startsWith("http") ? link.value : `https://${link.value}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{link.value}</a>
                        ) : (
                          <span>{link.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedContact.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedContact.notes}</p>
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => openEditDialog(selectedContact)}>
                    Edit
                  </Button>
                  <Button onClick={() => { handleLogContact(selectedContact.id); setSelectedContact(null) }}>
                    <Calendar className="size-4 mr-2" />
                    Log Contact
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
