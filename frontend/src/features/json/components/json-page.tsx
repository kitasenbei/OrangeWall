import { useState } from "react"
import { Braces, Copy, Check, Minimize2, Maximize2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const sampleJson = `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "country": "USA"
  },
  "hobbies": ["reading", "coding", "gaming"],
  "active": true
}`

export function JsonPage() {
  const [input, setInput] = useState(sampleJson)
  const [output, setOutput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [indent, setIndent] = useState(2)

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, indent))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput("")
    }
  }

  const copyOutput = () => {
    navigator.clipboard.writeText(output || input)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const getStats = () => {
    try {
      const parsed = JSON.parse(input)
      const keys = JSON.stringify(parsed).match(/"[^"]+"\s*:/g)?.length || 0
      const arrays = JSON.stringify(parsed).match(/\[/g)?.length || 0
      const objects = JSON.stringify(parsed).match(/\{/g)?.length || 0
      return { keys, arrays, objects, size: new Blob([input]).size }
    } catch {
      return null
    }
  }

  const stats = getStats()

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">JSON Formatter</h1><p className="text-sm text-muted-foreground">Format, validate, and minify JSON</p></div>
        <div className="flex items-center gap-2">
          <select value={indent} onChange={e => setIndent(Number(e.target.value))} className="h-9 rounded-md border bg-background px-3 text-sm">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
          <Button onClick={formatJson}><Maximize2 className="size-4 mr-2" />Format</Button>
          <Button variant="outline" onClick={minifyJson}><Minimize2 className="size-4 mr-2" />Minify</Button>
          <Button variant="outline" onClick={copyOutput}>
            {copied ? <Check className="size-4 mr-1 text-green-500" /> : <Copy className="size-4 mr-1" />}Copy
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="size-4 text-destructive mt-0.5" />
          <div><p className="text-sm font-medium text-destructive">Invalid JSON</p><p className="text-xs text-destructive/80">{error}</p></div>
        </div>
      )}

      {stats && (
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>{stats.keys} keys</span>
          <span>{stats.objects} objects</span>
          <span>{stats.arrays} arrays</span>
          <span>{stats.size} bytes</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 h-[calc(100vh-280px)]">
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
            <Braces className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Input</span>
          </div>
          <Textarea
            value={input}
            onChange={e => { setInput(e.target.value); setError(null) }}
            className="h-full border-0 rounded-none resize-none font-mono text-sm focus-visible:ring-0"
            placeholder="Paste your JSON here..."
          />
        </div>
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
            <Braces className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Output</span>
          </div>
          <Textarea
            value={output}
            readOnly
            className={cn("h-full border-0 rounded-none resize-none font-mono text-sm focus-visible:ring-0", !output && "text-muted-foreground")}
            placeholder="Formatted JSON will appear here..."
          />
        </div>
      </div>
    </div>
  )
}
