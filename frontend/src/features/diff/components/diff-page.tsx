import { useState, useMemo } from "react"
import { GitCompare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

function diffLines(text1: string, text2: string) {
  const lines1 = text1.split("\n")
  const lines2 = text2.split("\n")
  const result: { type: "same" | "added" | "removed"; content: string }[] = []

  const maxLen = Math.max(lines1.length, lines2.length)
  for (let i = 0; i < maxLen; i++) {
    const line1 = lines1[i]
    const line2 = lines2[i]
    if (line1 === line2) {
      result.push({ type: "same", content: line1 || "" })
    } else {
      if (line1 !== undefined) result.push({ type: "removed", content: line1 })
      if (line2 !== undefined) result.push({ type: "added", content: line2 })
    }
  }
  return result
}

export function DiffPage() {
  const [text1, setText1] = useState("Hello World\nThis is line 2\nLine three here")
  const [text2, setText2] = useState("Hello World\nThis is modified line 2\nLine three here\nNew line added")

  const diff = useMemo(() => diffLines(text1, text2), [text1, text2])
  const added = diff.filter(d => d.type === "added").length
  const removed = diff.filter(d => d.type === "removed").length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Text Diff</h1><p className="text-sm text-muted-foreground">Compare two texts side by side</p></div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-green-500">+{added} added</span>
          <span className="text-red-500">-{removed} removed</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Original</Label>
          <Textarea value={text1} onChange={e => setText1(e.target.value)} className="font-mono min-h-[200px]" />
        </div>
        <div className="space-y-2">
          <Label>Modified</Label>
          <Textarea value={text2} onChange={e => setText2(e.target.value)} className="font-mono min-h-[200px]" />
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4"><GitCompare className="size-4" /><Label>Diff Output</Label></div>
        <div className="font-mono text-sm space-y-0.5">
          {diff.map((line, i) => (
            <div key={i} className={line.type === "added" ? "bg-green-500/20 text-green-400" : line.type === "removed" ? "bg-red-500/20 text-red-400" : "text-muted-foreground"}>
              <span className="inline-block w-6">{line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}</span>
              {line.content || " "}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
