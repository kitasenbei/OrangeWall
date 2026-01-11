import { useState } from "react"
import { cn } from "@/lib/utils"
import { ExternalLink, Trash2, Star, StarOff, MoreVertical, Globe } from "lucide-react"
import { Chip } from "../primitives/chip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  favicon?: string
  tags?: string[]
  starred?: boolean
  createdAt: Date
}

interface BookmarkCardProps {
  bookmark: Bookmark
  onDelete?: (id: string) => void
  onToggleStar?: (id: string) => void
  variant?: "card" | "row"
  className?: string
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return url
  }
}

export function BookmarkCard({
  bookmark,
  onDelete,
  onToggleStar,
  variant = "card",
  className,
}: BookmarkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const domain = getDomain(bookmark.url)

  if (variant === "row") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border bg-card p-3 transition-all",
          "hover:shadow-sm hover:border-primary/20",
          className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="size-8 rounded bg-muted flex items-center justify-center shrink-0">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="size-5" />
          ) : (
            <Globe className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-primary line-clamp-1"
          >
            {bookmark.title}
          </a>
          <span className="text-xs text-muted-foreground">{domain}</span>
        </div>

        <div className="flex items-center gap-1">
          {bookmark.starred && <Star className="size-4 text-yellow-500 fill-yellow-500" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("p-1 rounded hover:bg-muted", isHovered ? "opacity-100" : "opacity-0")}>
                <MoreVertical className="size-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onToggleStar?.(bookmark.id)}>
                {bookmark.starred ? <StarOff className="size-4 mr-2" /> : <Star className="size-4 mr-2" />}
                {bookmark.starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete?.(bookmark.id)} className="text-destructive">
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all",
        "hover:shadow-md hover:border-primary/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {bookmark.favicon ? (
            <img src={bookmark.favicon} alt="" className="size-6" />
          ) : (
            <Globe className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={bookmark.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:text-primary line-clamp-1 flex items-center gap-1"
            >
              {bookmark.title}
              <ExternalLink className="size-3 shrink-0" />
            </a>
            {bookmark.starred && <Star className="size-4 text-yellow-500 fill-yellow-500 shrink-0" />}
          </div>
          <span className="text-xs text-muted-foreground">{domain}</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn("p-1 rounded hover:bg-muted transition-opacity", isHovered ? "opacity-100" : "opacity-0")}>
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleStar?.(bookmark.id)}>
              {bookmark.starred ? <StarOff className="size-4 mr-2" /> : <Star className="size-4 mr-2" />}
              {bookmark.starred ? "Unstar" : "Star"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(bookmark.id)} className="text-destructive">
              <Trash2 className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {bookmark.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{bookmark.description}</p>
      )}

      {bookmark.tags && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {bookmark.tags.map((tag) => (
            <Chip key={tag} label={tag} className="text-xs py-0.5 px-2" />
          ))}
        </div>
      )}
    </div>
  )
}
