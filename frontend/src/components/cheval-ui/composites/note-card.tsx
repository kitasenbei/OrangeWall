import { useState } from "react"
import { cn } from "@/lib/utils"
import { Pencil, Trash2, Pin, PinOff, MoreVertical } from "lucide-react"
import { Chip } from "../primitives/chip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Note {
  id: string
  title: string
  content: string
  color?: string
  tags?: string[]
  pinned?: boolean
  createdAt: Date
  updatedAt: Date
}

interface NoteCardProps {
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (id: string) => void
  onTogglePin?: (id: string) => void
  className?: string
}

const colorStyles: Record<string, string> = {
  default: "bg-card",
  yellow: "bg-yellow-50 dark:bg-yellow-950/30",
  green: "bg-green-50 dark:bg-green-950/30",
  blue: "bg-blue-50 dark:bg-blue-950/30",
  purple: "bg-purple-50 dark:bg-purple-950/30",
  pink: "bg-pink-50 dark:bg-pink-950/30",
}

export function NoteCard({ note, onEdit, onDelete, onTogglePin, className }: NoteCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const bgColor = colorStyles[note.color || "default"] || colorStyles.default

  const timeAgo = getTimeAgo(note.updatedAt)

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border p-4 transition-all",
        "hover:shadow-md hover:border-primary/20",
        bgColor,
        note.pinned && "ring-2 ring-primary/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {note.pinned && (
        <Pin className="absolute top-2 right-2 size-4 text-primary rotate-45" />
      )}

      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium line-clamp-1">{note.title}</h3>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "p-1 rounded hover:bg-black/5 transition-opacity",
                isHovered ? "opacity-100" : "opacity-0"
              )}
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(note)}>
              <Pencil className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onTogglePin?.(note.id)}>
              {note.pinned ? (
                <>
                  <PinOff className="size-4 mr-2" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="size-4 mr-2" />
                  Pin
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(note.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">
        {note.content}
      </p>

      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {note.tags.map((tag) => (
            <Chip key={tag} label={tag} className="text-xs py-0.5 px-2" />
          ))}
        </div>
      )}

      <span className="text-xs text-muted-foreground">{timeAgo}</span>
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  if (seconds < 60) return "Just now"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}
