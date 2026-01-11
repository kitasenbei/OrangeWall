import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  role: string
  category: "investor" | "client" | "partner" | "mentor" | "other"
  notes: string
  lastContact: string | null
  nextFollowUp: string | null
  createdAt: string
}

export interface ContactCreate {
  name: string
  email?: string
  phone?: string
  company?: string
  role?: string
  category?: "investor" | "client" | "partner" | "mentor" | "other"
  notes?: string
}

export interface ContactUpdate {
  name?: string
  email?: string
  phone?: string
  company?: string
  role?: string
  category?: "investor" | "client" | "partner" | "mentor" | "other"
  notes?: string
  lastContact?: string | null
  nextFollowUp?: string | null
}

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.get<Contact[]>("/contacts")
      setContacts(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch contacts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const createContact = async (contact: ContactCreate) => {
    const newContact = await api.post<Contact>("/contacts", contact)
    setContacts(prev => [...prev, newContact])
    return newContact
  }

  const updateContact = async (id: string, updates: ContactUpdate) => {
    const updated = await api.patch<Contact>(`/contacts/${id}`, updates)
    setContacts(prev => prev.map(c => c.id === id ? updated : c))
    return updated
  }

  const deleteContact = async (id: string) => {
    await api.delete(`/contacts/${id}`)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  return {
    contacts,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact,
  }
}
