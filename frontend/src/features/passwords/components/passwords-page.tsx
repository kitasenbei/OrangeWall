import { useState } from "react"
import {
  Copy,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  History,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

interface GeneratedPassword {
  id: string
  password: string
  strength: "weak" | "medium" | "strong" | "very-strong"
  createdAt: Date
}

export function PasswordsPage() {
  const [length, setLength] = useState(16)
  const [includeUpper, setIncludeUpper] = useState(true)
  const [includeLower, setIncludeLower] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [password, setPassword] = useState("")
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [history, setHistory] = useState<GeneratedPassword[]>([])

  const generatePassword = () => {
    let chars = ""
    if (includeUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (includeLower) chars += "abcdefghijklmnopqrstuvwxyz"
    if (includeNumbers) chars += "0123456789"
    if (includeSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (excludeAmbiguous) {
      chars = chars.replace(/[0OIl1|]/g, "")
    }

    if (!chars) {
      setPassword("Select at least one option")
      return
    }

    let result = ""
    const array = new Uint32Array(length)
    crypto.getRandomValues(array)
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }

    setPassword(result)
    setCopied(false)

    const strength = getStrength(result)
    const newEntry: GeneratedPassword = {
      id: Date.now().toString(),
      password: result,
      strength,
      createdAt: new Date(),
    }
    setHistory(prev => [newEntry, ...prev.slice(0, 9)])
  }

  const getStrength = (pwd: string): GeneratedPassword["strength"] => {
    let score = 0
    if (pwd.length >= 12) score++
    if (pwd.length >= 16) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++

    if (score <= 2) return "weak"
    if (score <= 4) return "medium"
    if (score <= 5) return "strong"
    return "very-strong"
  }

  const strengthConfig = {
    "weak": { label: "Weak", color: "bg-red-500", width: "25%" },
    "medium": { label: "Medium", color: "bg-yellow-500", width: "50%" },
    "strong": { label: "Strong", color: "bg-green-500", width: "75%" },
    "very-strong": { label: "Very Strong", color: "bg-emerald-500", width: "100%" },
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentStrength = password && !password.includes("Select") ? getStrength(password) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Password Generator</h1>
        <p className="text-sm text-muted-foreground">Generate secure random passwords</p>
      </div>

      {/* Generator Card */}
      <div className="bg-card border rounded-lg p-6 space-y-6">
        {/* Password Display */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={password}
                readOnly
                type={showPassword ? "text" : "password"}
                placeholder="Click generate to create password"
                className="pr-10 font-mono text-lg"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(password)}
              disabled={!password || password.includes("Select")}
            >
              {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
            </Button>
            <Button onClick={generatePassword}>
              <RefreshCw className="size-4 mr-2" />
              Generate
            </Button>
          </div>

          {/* Strength Indicator */}
          {currentStrength && (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Strength</span>
                <span className={cn(
                  currentStrength === "weak" && "text-red-500",
                  currentStrength === "medium" && "text-yellow-500",
                  currentStrength === "strong" && "text-green-500",
                  currentStrength === "very-strong" && "text-emerald-500",
                )}>
                  {strengthConfig[currentStrength].label}
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all", strengthConfig[currentStrength].color)}
                  style={{ width: strengthConfig[currentStrength].width }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Length Slider */}
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>Length</Label>
            <span className="text-sm font-medium">{length}</span>
          </div>
          <Slider
            value={[length]}
            onValueChange={([v]) => setLength(v)}
            min={4}
            max={64}
            step={1}
          />
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="upper" className="cursor-pointer">Uppercase (A-Z)</Label>
            <Switch id="upper" checked={includeUpper} onCheckedChange={setIncludeUpper} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="lower" className="cursor-pointer">Lowercase (a-z)</Label>
            <Switch id="lower" checked={includeLower} onCheckedChange={setIncludeLower} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="numbers" className="cursor-pointer">Numbers (0-9)</Label>
            <Switch id="numbers" checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="symbols" className="cursor-pointer">Symbols (!@#$)</Label>
            <Switch id="symbols" checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
          </div>
          <div className="flex items-center justify-between col-span-2">
            <Label htmlFor="ambiguous" className="cursor-pointer">Exclude ambiguous (0, O, I, l, 1, |)</Label>
            <Switch id="ambiguous" checked={excludeAmbiguous} onCheckedChange={setExcludeAmbiguous} />
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium flex items-center gap-2">
              <History className="size-4" />
              Recent Passwords
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
              <Trash2 className="size-4 mr-2" />
              Clear
            </Button>
          </div>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-card border rounded-lg p-3 flex items-center justify-between gap-4"
              >
                <code className="text-sm font-mono truncate flex-1">{item.password}</code>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    item.strength === "weak" && "bg-red-500/10 text-red-500",
                    item.strength === "medium" && "bg-yellow-500/10 text-yellow-500",
                    item.strength === "strong" && "bg-green-500/10 text-green-500",
                    item.strength === "very-strong" && "bg-emerald-500/10 text-emerald-500",
                  )}>
                    {strengthConfig[item.strength].label}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => copyToClipboard(item.password)}
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
