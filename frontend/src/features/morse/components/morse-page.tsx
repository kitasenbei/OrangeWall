import { useState, useRef } from "react"
import { Volume2, Copy, Check, ArrowDownUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
  'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
  'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
  '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
  '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', ' ': '/'
}

const REVERSE_MORSE: Record<string, string> = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]))

export function MorsePage() {
  const [text, setText] = useState("HELLO WORLD")
  const [morse, setMorse] = useState(".... . .-.. .-.. --- / .-- --- .-. .-.. -..")
  const [copied, setCopied] = useState<"text" | "morse" | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)

  const textToMorse = (input: string): string => {
    return input.toUpperCase().split('').map(char => MORSE_CODE[char] || char).join(' ')
  }

  const morseToText = (input: string): string => {
    return input.split(' / ').map(word =>
      word.split(' ').map(code => REVERSE_MORSE[code] || code).join('')
    ).join(' ')
  }

  const handleTextChange = (value: string) => {
    setText(value)
    setMorse(textToMorse(value))
  }

  const handleMorseChange = (value: string) => {
    setMorse(value)
    setText(morseToText(value))
  }

  const swap = () => {
    const newText = morseToText(morse)
    setText(newText)
    setMorse(textToMorse(newText))
  }

  const copy = (type: "text" | "morse") => {
    navigator.clipboard.writeText(type === "text" ? text : morse)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const playMorse = async () => {
    if (isPlaying) return
    setIsPlaying(true)

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }
    const ctx = audioContextRef.current

    const dotDuration = 0.08
    const dashDuration = dotDuration * 3
    const symbolGap = dotDuration
    const letterGap = dotDuration * 3
    const wordGap = dotDuration * 7

    let currentTime = ctx.currentTime

    const playTone = (duration: number) => {
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 600
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.5, currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration)

      oscillator.start(currentTime)
      oscillator.stop(currentTime + duration)

      currentTime += duration + symbolGap
    }

    for (const char of morse) {
      if (char === '.') {
        playTone(dotDuration)
      } else if (char === '-') {
        playTone(dashDuration)
      } else if (char === ' ') {
        currentTime += letterGap - symbolGap
      } else if (char === '/') {
        currentTime += wordGap - symbolGap
      }
    }

    setTimeout(() => setIsPlaying(false), (currentTime - ctx.currentTime) * 1000 + 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Morse Code</h1><p className="text-sm text-muted-foreground">Translate text to Morse code and back</p></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Text</Label>
            <Button variant="ghost" size="sm" onClick={() => copy("text")}>
              {copied === "text" ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </Button>
          </div>
          <Textarea value={text} onChange={e => handleTextChange(e.target.value)} className="min-h-[150px] font-mono" placeholder="Enter text..." />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Morse Code</Label>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={playMorse} disabled={isPlaying}>
                <Volume2 className={`size-4 ${isPlaying ? "animate-pulse" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => copy("morse")}>
                {copied === "morse" ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
          </div>
          <Textarea value={morse} onChange={e => handleMorseChange(e.target.value)} className="min-h-[150px] font-mono" placeholder="Enter Morse code (use . and -, separate letters with space, words with /)" />
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" onClick={swap}><ArrowDownUp className="size-4 mr-2" />Swap & Translate</Button>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-3">Morse Code Reference</h3>
        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2 text-sm">
          {Object.entries(MORSE_CODE).filter(([k]) => k !== ' ').slice(0, 36).map(([char, code]) => (
            <div key={char} className="text-center p-2 bg-muted rounded">
              <div className="font-bold">{char}</div>
              <div className="font-mono text-xs text-muted-foreground">{code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
        <h4 className="font-medium text-foreground mb-2">How to read Morse code:</h4>
        <ul className="space-y-1">
          <li>• <strong>Dot (.)</strong> = short signal (dit)</li>
          <li>• <strong>Dash (-)</strong> = long signal (dah), 3x dot length</li>
          <li>• <strong>Space</strong> = gap between letters</li>
          <li>• <strong>Slash (/)</strong> = gap between words</li>
        </ul>
      </div>
    </div>
  )
}
