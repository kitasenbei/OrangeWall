import { useState } from "react"
import { Plus, Copy, BookOpen, Globe, Newspaper, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { LucideIcon } from "lucide-react"

type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard"
type SourceType = "book" | "website" | "journal"

interface Source {
  type: SourceType
  authors: string
  title: string
  year: string
  publisher: string
  url: string
  journal: string
  volume: string
  pages: string
  accessDate: string
}

const sourceTypes: { type: SourceType; icon: LucideIcon; label: string }[] = [
  { type: "book", icon: BookOpen, label: "Book" },
  { type: "website", icon: Globe, label: "Website" },
  { type: "journal", icon: Newspaper, label: "Journal Article" },
]

export function CitationsPage() {
  const [style, setStyle] = useState<CitationStyle>("APA")
  const [sourceType, setSourceType] = useState<SourceType>("book")
  const [source, setSource] = useState<Source>({ type: "book", authors: "", title: "", year: "", publisher: "", url: "", journal: "", volume: "", pages: "", accessDate: new Date().toISOString().split("T")[0] })
  const [citations, setCitations] = useState<string[]>([])
  const [copied, setCopied] = useState<number | null>(null)

  const formatAuthors = (authors: string, style: CitationStyle) => {
    const parts = authors.split(",").map(a => a.trim())
    if (parts.length === 0) return ""
    if (style === "APA" || style === "Harvard") {
      return parts.length > 1 ? `${parts.slice(0, -1).join(", ")}, & ${parts[parts.length - 1]}` : parts[0]
    }
    return parts.join(", ")
  }

  const generateCitation = (): string => {
    const { authors, title, year, publisher, url, journal, volume, pages, accessDate } = source
    const formattedAuthors = formatAuthors(authors, style)
    const accessDateFormatted = accessDate ? new Date(accessDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""

    if (sourceType === "book") {
      switch (style) {
        case "APA": return `${formattedAuthors} (${year}). *${title}*. ${publisher}.`
        case "MLA": return `${authors}. *${title}*. ${publisher}, ${year}.`
        case "Chicago": return `${authors}. *${title}*. ${publisher}, ${year}.`
        case "Harvard": return `${formattedAuthors} (${year}) *${title}*. ${publisher}.`
      }
    }

    if (sourceType === "website") {
      switch (style) {
        case "APA": return `${formattedAuthors} (${year}). ${title}. Retrieved ${accessDateFormatted}, from ${url}`
        case "MLA": return `${authors}. "${title}." *Web*. ${accessDateFormatted}. <${url}>.`
        case "Chicago": return `${authors}. "${title}." Accessed ${accessDateFormatted}. ${url}.`
        case "Harvard": return `${formattedAuthors} (${year}) *${title}* [Online]. Available at: ${url} (Accessed: ${accessDateFormatted}).`
      }
    }

    if (sourceType === "journal") {
      switch (style) {
        case "APA": return `${formattedAuthors} (${year}). ${title}. *${journal}*, *${volume}*, ${pages}.`
        case "MLA": return `${authors}. "${title}." *${journal}* ${volume} (${year}): ${pages}.`
        case "Chicago": return `${authors}. "${title}." *${journal}* ${volume} (${year}): ${pages}.`
        case "Harvard": return `${formattedAuthors} (${year}) '${title}', *${journal}*, ${volume}, pp. ${pages}.`
      }
    }

    return ""
  }

  const addCitation = () => {
    const citation = generateCitation()
    if (citation) setCitations([citation, ...citations])
  }

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text.replace(/\*/g, ""))
    setCopied(index)
    setTimeout(() => setCopied(null), 2000)
  }

  const updateSource = (field: keyof Source, value: string) => {
    setSource(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Citations</h1><p className="text-sm text-muted-foreground">Generate formatted citations</p></div>
      </div>

      <div className="flex gap-2">
        {(["APA", "MLA", "Chicago", "Harvard"] as const).map(s => (
          <Button key={s} variant={style === s ? "default" : "outline"} size="sm" onClick={() => setStyle(s)}>{s}</Button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="flex gap-2">
            {sourceTypes.map(t => (
              <button key={t.type} onClick={() => { setSourceType(t.type); setSource(prev => ({ ...prev, type: t.type })) }} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${sourceType === t.type ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <t.icon className="size-4" />{t.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div className="space-y-2"><Label>Author(s)</Label><Input value={source.authors} onChange={e => updateSource("authors", e.target.value)} placeholder="Last, First (separate with commas)" /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={source.title} onChange={e => updateSource("title", e.target.value)} placeholder="Title of the work" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Year</Label><Input value={source.year} onChange={e => updateSource("year", e.target.value)} placeholder="2024" /></div>
              {sourceType === "book" && <div className="space-y-2"><Label>Publisher</Label><Input value={source.publisher} onChange={e => updateSource("publisher", e.target.value)} placeholder="Publisher name" /></div>}
              {sourceType === "website" && <div className="space-y-2"><Label>Access Date</Label><Input type="date" value={source.accessDate} onChange={e => updateSource("accessDate", e.target.value)} /></div>}
              {sourceType === "journal" && <div className="space-y-2"><Label>Volume</Label><Input value={source.volume} onChange={e => updateSource("volume", e.target.value)} placeholder="12" /></div>}
            </div>
            {sourceType === "website" && <div className="space-y-2"><Label>URL</Label><Input value={source.url} onChange={e => updateSource("url", e.target.value)} placeholder="https://..." /></div>}
            {sourceType === "journal" && (
              <>
                <div className="space-y-2"><Label>Journal Name</Label><Input value={source.journal} onChange={e => updateSource("journal", e.target.value)} placeholder="Journal of..." /></div>
                <div className="space-y-2"><Label>Pages</Label><Input value={source.pages} onChange={e => updateSource("pages", e.target.value)} placeholder="1-15" /></div>
              </>
            )}
          </div>

          <Button onClick={addCitation} className="w-full"><Plus className="size-4 mr-2" />Generate Citation</Button>
        </div>

        <div className="space-y-4">
          <Label>Preview ({style})</Label>
          <div className="bg-muted rounded-lg p-4 min-h-[80px]">
            <p className="text-sm" dangerouslySetInnerHTML={{ __html: generateCitation().replace(/\*([^*]+)\*/g, "<em>$1</em>") }} />
          </div>

          {citations.length > 0 && (
            <div className="space-y-2">
              <Label>Saved Citations</Label>
              {citations.map((c, i) => (
                <div key={i} className="flex items-start gap-2 bg-card border rounded-lg p-3">
                  <p className="flex-1 text-sm" dangerouslySetInnerHTML={{ __html: c.replace(/\*([^*]+)\*/g, "<em>$1</em>") }} />
                  <Button size="icon" variant="ghost" onClick={() => copyToClipboard(c, i)}>
                    {copied === i ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
