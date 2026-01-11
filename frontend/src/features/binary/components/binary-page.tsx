import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

type Format = "text" | "binary" | "hex" | "decimal" | "octal"

export function BinaryPage() {
  const [text, setText] = useState("Hello World!")
  const [binary, setBinary] = useState("")
  const [hex, setHex] = useState("")
  const [decimal, setDecimal] = useState("")
  const [octal, setOctal] = useState("")
  const [copied, setCopied] = useState<Format | null>(null)

  const textToBinary = (str: string): string => {
    return str.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
  }

  const binaryToText = (bin: string): string => {
    const bytes = bin.replace(/\s+/g, ' ').trim().split(' ')
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('')
  }

  const textToHex = (str: string): string => {
    return str.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
  }

  const hexToText = (hexStr: string): string => {
    const bytes = hexStr.replace(/\s+/g, ' ').trim().split(' ')
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 16))).join('')
  }

  const textToDecimal = (str: string): string => {
    return str.split('').map(char => char.charCodeAt(0).toString()).join(' ')
  }

  const decimalToText = (dec: string): string => {
    const bytes = dec.replace(/\s+/g, ' ').trim().split(' ')
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 10))).join('')
  }

  const textToOctal = (str: string): string => {
    return str.split('').map(char => char.charCodeAt(0).toString(8).padStart(3, '0')).join(' ')
  }

  const octalToText = (oct: string): string => {
    const bytes = oct.replace(/\s+/g, ' ').trim().split(' ')
    return bytes.map(byte => String.fromCharCode(parseInt(byte, 8))).join('')
  }

  const updateFromText = (value: string) => {
    setText(value)
    setBinary(textToBinary(value))
    setHex(textToHex(value))
    setDecimal(textToDecimal(value))
    setOctal(textToOctal(value))
  }

  const updateFromBinary = (value: string) => {
    setBinary(value)
    try {
      const txt = binaryToText(value)
      setText(txt)
      setHex(textToHex(txt))
      setDecimal(textToDecimal(txt))
      setOctal(textToOctal(txt))
    } catch {}
  }

  const updateFromHex = (value: string) => {
    setHex(value)
    try {
      const txt = hexToText(value)
      setText(txt)
      setBinary(textToBinary(txt))
      setDecimal(textToDecimal(txt))
      setOctal(textToOctal(txt))
    } catch {}
  }

  const updateFromDecimal = (value: string) => {
    setDecimal(value)
    try {
      const txt = decimalToText(value)
      setText(txt)
      setBinary(textToBinary(txt))
      setHex(textToHex(txt))
      setOctal(textToOctal(txt))
    } catch {}
  }

  const updateFromOctal = (value: string) => {
    setOctal(value)
    try {
      const txt = octalToText(value)
      setText(txt)
      setBinary(textToBinary(txt))
      setHex(textToHex(txt))
      setDecimal(textToDecimal(txt))
    } catch {}
  }

  // Initialize on first render
  useState(() => updateFromText(text))

  const copy = (format: Format, value: string) => {
    navigator.clipboard.writeText(value)
    setCopied(format)
    setTimeout(() => setCopied(null), 2000)
  }

  const fields: { label: string; format: Format; value: string; onChange: (v: string) => void; placeholder: string }[] = [
    { label: "Text", format: "text", value: text, onChange: updateFromText, placeholder: "Enter text..." },
    { label: "Binary (Base 2)", format: "binary", value: binary, onChange: updateFromBinary, placeholder: "01001000 01100101 ..." },
    { label: "Hexadecimal (Base 16)", format: "hex", value: hex, onChange: updateFromHex, placeholder: "48 65 6c 6c 6f ..." },
    { label: "Decimal (Base 10)", format: "decimal", value: decimal, onChange: updateFromDecimal, placeholder: "72 101 108 108 111 ..." },
    { label: "Octal (Base 8)", format: "octal", value: octal, onChange: updateFromOctal, placeholder: "110 145 154 154 157 ..." },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Binary Converter</h1><p className="text-sm text-muted-foreground">Convert between text and number systems</p></div>
      </div>

      <div className="grid gap-4">
        {fields.map(field => (
          <div key={field.format} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>{field.label}</Label>
              <Button variant="ghost" size="sm" onClick={() => copy(field.format, field.value)}>
                {copied === field.format ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
              </Button>
            </div>
            <Textarea value={field.value} onChange={e => field.onChange(e.target.value)} className="font-mono text-sm min-h-[80px]" placeholder={field.placeholder} />
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-2">Binary (Base 2)</h4>
          <p className="text-sm text-muted-foreground">Uses only 0 and 1. Each character is 8 bits (1 byte).</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-2">Hexadecimal (Base 16)</h4>
          <p className="text-sm text-muted-foreground">Uses 0-9 and A-F. Common in programming for compact representation.</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-2">Decimal (Base 10)</h4>
          <p className="text-sm text-muted-foreground">Standard number system. Shows ASCII codes for characters.</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <h4 className="font-medium mb-2">Octal (Base 8)</h4>
          <p className="text-sm text-muted-foreground">Uses 0-7. Sometimes used in Unix file permissions.</p>
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-medium mb-2">Quick Reference: ASCII Values</h4>
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1 text-xs font-mono">
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(char => (
            <div key={char} className="text-center p-1 bg-card rounded">
              <div className="font-bold">{char}</div>
              <div className="text-muted-foreground">{char.charCodeAt(0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
