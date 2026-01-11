import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"

export interface Note {
  id: string
  title: string
  content: string
  color: string
  tags: string[]
  pinned: boolean
  starred: boolean
  archived: boolean
  folderId: string | null
  createdAt: string
  updatedAt: string
}

export interface NoteCreate {
  title: string
  content: string
  color?: string
  tags?: string[]
  pinned?: boolean
  starred?: boolean
  archived?: boolean
  folderId?: string | null
}

export interface NoteUpdate {
  title?: string
  content?: string
  color?: string
  tags?: string[]
  pinned?: boolean
  starred?: boolean
  archived?: boolean
  folderId?: string | null
}

export interface Folder {
  id: string
  name: string
  color: string
}

export interface FolderCreate {
  name: string
  color?: string
}

export interface FolderUpdate {
  name?: string
  color?: string
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true)
      const [notesData, foldersData] = await Promise.all([
        api.get<Note[]>("/notes"),
        api.get<Folder[]>("/notes/folders"),
      ])
      setNotes(notesData)
      setFolders(foldersData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notes")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = async (note: NoteCreate) => {
    const newNote = await api.post<Note>("/notes", note)
    setNotes(prev => [newNote, ...prev])
    return newNote
  }

  const updateNote = async (id: string, updates: NoteUpdate) => {
    const updated = await api.patch<Note>(`/notes/${id}`, updates)
    setNotes(prev => prev.map(n => n.id === id ? updated : n))
    return updated
  }

  const deleteNote = async (id: string) => {
    await api.delete(`/notes/${id}`)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const createFolder = async (folder: FolderCreate) => {
    const newFolder = await api.post<Folder>("/notes/folders", folder)
    setFolders(prev => [...prev, newFolder])
    return newFolder
  }

  const updateFolder = async (id: string, updates: FolderUpdate) => {
    const updated = await api.patch<Folder>(`/notes/folders/${id}`, updates)
    setFolders(prev => prev.map(f => f.id === id ? updated : f))
    return updated
  }

  const deleteFolder = async (id: string) => {
    await api.delete(`/notes/folders/${id}`)
    setFolders(prev => prev.filter(f => f.id !== id))
    // Remove folder reference from notes
    setNotes(prev => prev.map(n => n.folderId === id ? { ...n, folderId: null } : n))
  }

  return {
    notes,
    folders,
    loading,
    error,
    refetch: fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    updateFolder,
    deleteFolder,
  }
}
