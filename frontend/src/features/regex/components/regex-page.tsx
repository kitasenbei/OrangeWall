import { useState, useMemo } from "react"
import { Copy, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const commonPatterns = [
  { name: "Email", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
  { name: "URL", pattern: "https?://[\\w.-]+(?:/[\\w.-]*)*" },
  { name: "Phone", pattern: "\\+?[1-9]\\d{1,14}" },
  { name: "IP Address", pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b" },
  { name: "Date (YYYY-MM-DD)", pattern: "\\d{4}-\\d{2}-\\d{2}" },
  { name: "Hex Color", pattern: "#[a-fA-F0-9]{6}\\b" },
]

const sampleText = `Contact us at support@example.com or sales@company.org
Visit our website: https://www.example.com/products
Call us: +1-555-123-4567
Server IP: 192.168.1.100
Launch date: 2025-03-15
Brand color: #3b82f6`

export function RegexPage() {
  const [pattern, setPattern] = useState("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}")
  const [flags, setFlags] = useState("gi")
  const [testString, setTestString] = useState(sampleText)
  const [copied, setCopied] = useState(false)

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags)
      const matches = testString.match(regex) || []
      const groups: string[][] = []
      let match
      const globalRegex = new RegExp(pattern, flags)

      while ((match = globalRegex.exec(testString)) !== null) {
        if (match.length > 1) groups.push(match.slice(1))
        if (!flags.includes('g')) break
      }

      return { matches, groups, error: null, regex }
    } catch (e) {
      return { matches: [], groups: [], error: (e as Error).message, regex: null }
    }
  }, [pattern, flags, testString])

  const highlightMatches = () => {
    if (!result.regex || result.error) return testString
    let highlighted = testString
    const matches = testString.match(result.regex) || []
    matches.forEach(match => {
      highlighted = highlighted.replace(match, `<mark class="bg-yellow-300 dark:bg-yellow-600 px-0.5 rounded">${match}</mark>`)
    })
    return highlighted
  }

  const copyPattern = () => {
    navigator.clipboard.writeText(`/${pattern}/${flags}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Regex Tester</h1><p className="text-sm text-muted-foreground">Test and debug regular expressions</p></div>
        <Button variant="outline" onClick={copyPattern}>
          {copied ? <Check className="size-4 mr-1 text-green-500" /> : <Copy className="size-4 mr-1" />}Copy Pattern
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label>Pattern</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-mono">/</span>
                  <Input value={pattern} onChange={e => setPattern(e.target.value)} className="font-mono flex-1" placeholder="Enter regex pattern..." />
                  <span className="text-muted-foreground font-mono">/</span>
                  <Input value={flags} onChange={e => setFlags(e.target.value)} className="font-mono w-16" placeholder="gi" />
                </div>
              </div>
            </div>

            {result.error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="size-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{result.error}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-muted-foreground">Flags:</span>
              {[
                { flag: "g", label: "Global" },
                { flag: "i", label: "Case insensitive" },
                { flag: "m", label: "Multiline" },
                { flag: "s", label: "Dotall" },
              ].map(f => (
                <button
                  key={f.flag}
                  onClick={() => setFlags(prev => prev.includes(f.flag) ? prev.replace(f.flag, "") : prev + f.flag)}
                  className={cn("px-2 py-1 rounded text-xs border", flags.includes(f.flag) ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border")}
                >
                  {f.flag} - {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-2">
            <Label>Test String</Label>
            <Textarea value={testString} onChange={e => setTestString(e.target.value)} className="font-mono text-sm min-h-[150px]" placeholder="Enter text to test against..." />
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-2">
            <Label>Highlighted Matches</Label>
            <div className="p-3 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlightMatches() }} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Results</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Matches:</span><span className="font-medium">{result.matches.length}</span></div>
              {result.matches.length > 0 && (
                <div className="space-y-1 mt-2">
                  {result.matches.slice(0, 10).map((match, i) => (
                    <div key={i} className="px-2 py-1 bg-muted rounded font-mono text-xs truncate">{match}</div>
                  ))}
                  {result.matches.length > 10 && <p className="text-xs text-muted-foreground">...and {result.matches.length - 10} more</p>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Common Patterns</Label>
            <div className="space-y-2">
              {commonPatterns.map(p => (
                <button key={p.name} onClick={() => setPattern(p.pattern)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted text-sm transition-colors">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground font-mono truncate">{p.pattern}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
