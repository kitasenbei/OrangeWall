import { useState, useMemo } from "react"
import { Copy, Check, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const sampleCsv = `name,age,city
John,30,New York
Jane,25,Los Angeles
Bob,35,Chicago`

export function CsvPage() {
  const [csv, setCsv] = useState(sampleCsv)
  const [mode, setMode] = useState<"csv-to-json" | "json-to-csv">("csv-to-json")
  const [copied, setCopied] = useState(false)

  const output = useMemo(() => {
    try {
      if (mode === "csv-to-json") {
        const lines = csv.trim().split("\n")
        if (lines.length < 2) return "[]"
        const headers = lines[0].split(",").map(h => h.trim())
        const data = lines.slice(1).map(line => {
          const values = line.split(",").map(v => v.trim())
          return headers.reduce((obj, header, i) => ({ ...obj, [header]: values[i] || "" }), {})
        })
        return JSON.stringify(data, null, 2)
      } else {
        const data = JSON.parse(csv)
        if (!Array.isArray(data) || data.length === 0) return ""
        const headers = Object.keys(data[0])
        const rows = data.map(obj => headers.map(h => obj[h] ?? "").join(","))
        return [headers.join(","), ...rows].join("\n")
      }
    } catch {
      return mode === "csv-to-json" ? "Invalid CSV" : "Invalid JSON"
    }
  }, [csv, mode])

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const swap = () => {
    setCsv(output)
    setMode(mode === "csv-to-json" ? "json-to-csv" : "csv-to-json")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">CSV ↔ JSON</h1><p className="text-sm text-muted-foreground">Convert between CSV and JSON formats</p></div>
        <div className="flex gap-2">
          <Button variant={mode === "csv-to-json" ? "default" : "outline"} onClick={() => setMode("csv-to-json")}>CSV → JSON</Button>
          <Button variant={mode === "json-to-csv" ? "default" : "outline"} onClick={() => setMode("json-to-csv")}>JSON → CSV</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "csv-to-json" ? "CSV Input" : "JSON Input"}</Label>
          <Textarea value={csv} onChange={e => setCsv(e.target.value)} className="font-mono text-sm min-h-[300px]" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "csv-to-json" ? "JSON Output" : "CSV Output"}</Label>
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea value={output} readOnly className="font-mono text-sm min-h-[300px]" />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={swap}><ArrowRightLeft className="size-4 mr-2" />Swap</Button>
      </div>
    </div>
  )
}
