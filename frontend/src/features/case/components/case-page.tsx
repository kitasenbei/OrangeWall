import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

const conversions = [
  { name: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
  { name: "lowercase", fn: (s: string) => s.toLowerCase() },
  { name: "Title Case", fn: (s: string) => s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) },
  { name: "Sentence case", fn: (s: string) => s.toLowerCase().replace(/(^\w|[.!?]\s+\w)/g, c => c.toUpperCase()) },
  { name: "camelCase", fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()) },
  { name: "PascalCase", fn: (s: string) => s.toLowerCase().replace(/(^|[^a-zA-Z0-9]+)(.)/g, (_, __, c) => c.toUpperCase()) },
  { name: "snake_case", fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "") },
  { name: "kebab-case", fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "") },
  { name: "CONSTANT_CASE", fn: (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "") },
  { name: "dot.case", fn: (s: string) => s.toLowerCase().replace(/[^a-zA-Z0-9]+/g, ".").replace(/^\.|\.$/g, "") },
  { name: "aLtErNaTiNg", fn: (s: string) => s.split("").map((c, i) => i % 2 ? c.toLowerCase() : c.toUpperCase()).join("") },
  { name: "InVeRsE", fn: (s: string) => s.split("").map(c => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("") },
]

export function CasePage() {
  const [text, setText] = useState("Hello World Example Text")
  const [copied, setCopied] = useState<string | null>(null)

  const copy = (converted: string, name: string) => {
    navigator.clipboard.writeText(converted)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Case Converter</h1><p className="text-sm text-muted-foreground">Convert text between different cases</p></div>

      <Textarea value={text} onChange={e => setText(e.target.value)} className="min-h-[100px]" placeholder="Enter text to convert..." />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {conversions.map(conv => {
          const converted = conv.fn(text)
          return (
            <div key={conv.name} className="bg-card border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{conv.name}</span>
                <Button size="sm" variant="ghost" onClick={() => copy(converted, conv.name)}>
                  {copied === conv.name ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
                </Button>
              </div>
              <p className="font-mono text-sm break-all">{converted || <span className="text-muted-foreground">—</span>}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
