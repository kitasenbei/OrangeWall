import { useState, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"

export function CounterPage() {
  const [text, setText] = useState("Type or paste your text here to see the word count, character count, and other statistics.")

  const stats = useMemo(() => {
    const chars = text.length
    const charsNoSpaces = text.replace(/\s/g, "").length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim()).length
    const lines = text.split("\n").length
    const readingTime = Math.ceil(words / 200)
    const speakingTime = Math.ceil(words / 150)
    return { chars, charsNoSpaces, words, sentences, paragraphs, lines, readingTime, speakingTime }
  }, [text])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Word Counter</h1><p className="text-sm text-muted-foreground">Count words, characters, and more</p></div>

      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {[
          { label: "Words", value: stats.words },
          { label: "Characters", value: stats.chars },
          { label: "No Spaces", value: stats.charsNoSpaces },
          { label: "Sentences", value: stats.sentences },
          { label: "Paragraphs", value: stats.paragraphs },
          { label: "Lines", value: stats.lines },
          { label: "Read Time", value: `${stats.readingTime}m` },
          { label: "Speak Time", value: `${stats.speakingTime}m` },
        ].map(stat => (
          <div key={stat.label} className="bg-card border rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      <Textarea value={text} onChange={e => setText(e.target.value)} className="min-h-[400px] text-base" placeholder="Start typing..." />
    </div>
  )
}
