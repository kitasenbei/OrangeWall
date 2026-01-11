import { useState } from "react"
import { Copy, Check, Eye, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const defaultMarkdown = `# Markdown Preview

## Features
- **Bold text** and *italic text*
- Lists and checkboxes
- Code blocks and inline \`code\`

### Code Example
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Links and Images
[Visit Example](https://example.com)

### Blockquotes
> This is a blockquote
> with multiple lines

### Table
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |

---

That's the basics of Markdown!
`

function parseMarkdown(md: string): string {
  let html = md
    // Escape HTML
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-lg overflow-x-auto my-2"><code>$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>')
    // Headers
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-5 mb-2">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>')
    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
    // Blockquotes
    .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-muted-foreground/30 pl-4 italic text-muted-foreground">$1</blockquote>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-4 border-border" />')
    // Unordered lists
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    // Tables (basic)
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim())
      if (cells.every(c => c.trim().match(/^-+$/))) return ''
      return '<tr>' + cells.map(c => `<td class="border border-border px-3 py-1">${c.trim()}</td>`).join('') + '</tr>'
    })
    // Paragraphs
    .replace(/\n\n/g, '</p><p class="my-2">')

  // Wrap in paragraph
  html = '<p class="my-2">' + html + '</p>'
  // Clean up empty paragraphs
  html = html.replace(/<p class="my-2"><\/p>/g, '')
  // Wrap tables
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<table class="border-collapse my-2">$&</table>')

  return html
}

export function MarkdownPage() {
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [view, setView] = useState<"split" | "edit" | "preview">("split")
  const [copied, setCopied] = useState(false)

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(parseMarkdown(markdown))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Markdown Preview</h1><p className="text-sm text-muted-foreground">Write and preview markdown</p></div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <Button variant={view === "edit" ? "default" : "ghost"} size="sm" onClick={() => setView("edit")} className="rounded-none"><Code className="size-4" /></Button>
            <Button variant={view === "split" ? "default" : "ghost"} size="sm" onClick={() => setView("split")} className="rounded-none border-x">Split</Button>
            <Button variant={view === "preview" ? "default" : "ghost"} size="sm" onClick={() => setView("preview")} className="rounded-none"><Eye className="size-4" /></Button>
          </div>
          <Button variant="outline" size="sm" onClick={copyMarkdown}>
            {copied ? <Check className="size-4 mr-1 text-green-500" /> : <Copy className="size-4 mr-1" />}MD
          </Button>
          <Button variant="outline" size="sm" onClick={copyHtml}>
            {copied ? <Check className="size-4 mr-1 text-green-500" /> : <Copy className="size-4 mr-1" />}HTML
          </Button>
        </div>
      </div>

      <div className={cn("grid gap-4 h-[calc(100vh-200px)]", view === "split" ? "grid-cols-2" : "grid-cols-1")}>
        {(view === "edit" || view === "split") && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
              <Code className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Editor</span>
            </div>
            <Textarea
              value={markdown}
              onChange={e => setMarkdown(e.target.value)}
              className="h-full border-0 rounded-none resize-none font-mono text-sm focus-visible:ring-0"
              placeholder="Write your markdown here..."
            />
          </div>
        )}
        {(view === "preview" || view === "split") && (
          <div className="bg-card border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
              <Eye className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            <div
              className="p-4 overflow-auto h-full prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(markdown) }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
