import { useState } from "react"
import { Copy, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const words = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"]

function generateSentence(minWords = 8, maxWords = 15): string {
  const count = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
  const sentence = Array.from({ length: count }, () => words[Math.floor(Math.random() * words.length)]).join(" ")
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + "."
}

function generateParagraph(sentences = 5): string {
  return Array.from({ length: sentences }, () => generateSentence()).join(" ")
}

export function LoremPage() {
  const [paragraphs, setParagraphs] = useState(3)
  const [output, setOutput] = useState(() => Array.from({ length: 3 }, () => generateParagraph()).join("\n\n"))
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setOutput(Array.from({ length: paragraphs }, () => generateParagraph()).join("\n\n"))
  }

  const copy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Lorem Ipsum</h1><p className="text-sm text-muted-foreground">Generate placeholder text</p></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label>Paragraphs:</Label>
            <Input type="number" value={paragraphs} onChange={e => setParagraphs(Math.max(1, parseInt(e.target.value) || 1))} className="w-20" min={1} max={20} />
          </div>
          <Button onClick={generate}><RefreshCw className="size-4 mr-2" />Generate</Button>
          <Button variant="outline" onClick={copy}>
            {copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy
          </Button>
        </div>
      </div>
      <div className="bg-card border rounded-lg p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{output}</div>
      </div>
    </div>
  )
}
