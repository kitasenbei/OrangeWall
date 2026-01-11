import { useState, useEffect } from "react"
import { Copy, Check, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

async function computeHash(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

const algorithms = [
  { name: "SHA-1", algo: "SHA-1" },
  { name: "SHA-256", algo: "SHA-256" },
  { name: "SHA-384", algo: "SHA-384" },
  { name: "SHA-512", algo: "SHA-512" },
]

export function HashPage() {
  const [text, setText] = useState("Hello World")
  const [hashes, setHashes] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    const compute = async () => {
      const results: Record<string, string> = {}
      for (const algo of algorithms) {
        results[algo.name] = await computeHash(text, algo.algo)
      }
      setHashes(results)
    }
    compute()
  }, [text])

  const copy = (hash: string, name: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(name)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Hash Generator</h1><p className="text-sm text-muted-foreground">Generate cryptographic hashes</p></div>

      <div className="space-y-2">
        <Label>Input Text</Label>
        <Textarea value={text} onChange={e => setText(e.target.value)} className="font-mono" placeholder="Enter text to hash..." />
      </div>

      <div className="space-y-3">
        {algorithms.map(algo => (
          <div key={algo.name} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2"><Hash className="size-4" />{algo.name}</span>
              <Button size="sm" variant="ghost" onClick={() => copy(hashes[algo.name] || "", algo.name)}>
                {copied === algo.name ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <code className="font-mono text-xs break-all text-muted-foreground">{hashes[algo.name] || "..."}</code>
          </div>
        ))}
      </div>
    </div>
  )
}
