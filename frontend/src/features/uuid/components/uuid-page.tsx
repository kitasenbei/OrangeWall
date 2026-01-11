import { useState } from "react"
import { Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === "x" ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export function UuidPage() {
  const [count, setCount] = useState(5)
  const [uuids, setUuids] = useState<string[]>(() => Array.from({ length: 5 }, generateUUID))
  const [copied, setCopied] = useState<number | null>(null)

  const generate = () => setUuids(Array.from({ length: count }, generateUUID))
  const copy = (uuid: string, index: number) => {
    navigator.clipboard.writeText(uuid)
    setCopied(index)
    setTimeout(() => setCopied(null), 1500)
  }
  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join("\n"))
    setCopied(-1)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">UUID Generator</h1><p className="text-sm text-muted-foreground">Generate random UUIDs (v4)</p></div>
        <div className="flex items-center gap-2">
          <Label>Count:</Label>
          <Input type="number" value={count} onChange={e => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))} className="w-20" min={1} max={100} />
          <Button onClick={generate}><RefreshCw className="size-4 mr-2" />Generate</Button>
          <Button variant="outline" onClick={copyAll}>
            {copied === -1 ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy All
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {uuids.map((uuid, i) => (
          <div key={i} className="bg-card border rounded-lg p-3 flex items-center justify-between group">
            <code className="font-mono text-sm">{uuid}</code>
            <Button size="sm" variant="ghost" onClick={() => copy(uuid, i)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copied === i ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
