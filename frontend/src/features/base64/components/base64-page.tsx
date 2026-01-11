import { useState } from "react"
import { Copy, Check, ArrowDownUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function Base64Page() {
  const [input, setInput] = useState("Hello World!")
  const [mode, setMode] = useState<"encode" | "decode">("encode")
  const [output, setOutput] = useState(() => btoa("Hello World!"))
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const process = (text: string, newMode?: "encode" | "decode") => {
    const m = newMode || mode
    setInput(text)
    setError(null)
    try {
      if (m === "encode") {
        setOutput(btoa(text))
      } else {
        setOutput(atob(text))
      }
    } catch {
      setError(m === "decode" ? "Invalid Base64 string" : "Unable to encode")
      setOutput("")
    }
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const swap = () => {
    setInput(output)
    process(output, mode === "encode" ? "decode" : "encode")
    setMode(mode === "encode" ? "decode" : "encode")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Base64</h1><p className="text-sm text-muted-foreground">Encode and decode Base64 strings</p></div>
        <div className="flex gap-2">
          <Button variant={mode === "encode" ? "default" : "outline"} onClick={() => { setMode("encode"); process(input, "encode") }}>Encode</Button>
          <Button variant={mode === "decode" ? "default" : "outline"} onClick={() => { setMode("decode"); process(input, "decode") }}>Decode</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === "encode" ? "Plain Text" : "Base64"}</Label>
          <Textarea value={input} onChange={e => process(e.target.value)} className="font-mono min-h-[200px]" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === "encode" ? "Base64" : "Plain Text"}</Label>
            <Button size="sm" variant="ghost" onClick={copy}>
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea value={error || output} readOnly className={`font-mono min-h-[200px] ${error ? "text-red-500" : ""}`} />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={swap}><ArrowDownUp className="size-4 mr-2" />Swap</Button>
      </div>
    </div>
  )
}
