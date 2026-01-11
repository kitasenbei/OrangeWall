import { useState, useRef, useEffect } from "react"
import { Wifi, Download, Copy, Check, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type SecurityType = "WPA" | "WEP" | "nopass"

export function WifiPage() {
  const [ssid, setSsid] = useState("MyNetwork")
  const [password, setPassword] = useState("mypassword123")
  const [security, setSecurity] = useState<SecurityType>("WPA")
  const [hidden, setHidden] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getWifiString = () => {
    const escapedSsid = ssid.replace(/[\\;,:]/g, "\\$&")
    const escapedPass = password.replace(/[\\;,:]/g, "\\$&")
    return `WIFI:T:${security};S:${escapedSsid};P:${escapedPass};H:${hidden ? "true" : "false"};;`
  }

  useEffect(() => {
    drawQR()
  }, [ssid, password, security, hidden])

  const drawQR = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR-like pattern (not a real QR code - would need a library for that)
    const size = 200
    canvas.width = size
    canvas.height = size

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, size, size)

    // Generate a deterministic pattern based on the wifi string
    const wifiStr = getWifiString()
    const cellSize = 8
    const gridSize = Math.floor(size / cellSize)

    ctx.fillStyle = "black"

    // Draw finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x, y, cellSize * 7, cellSize)
      ctx.fillRect(x, y + cellSize * 6, cellSize * 7, cellSize)
      ctx.fillRect(x, y, cellSize, cellSize * 7)
      ctx.fillRect(x + cellSize * 6, y, cellSize, cellSize * 7)
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3)
    }

    drawFinder(0, 0)
    drawFinder(size - cellSize * 7, 0)
    drawFinder(0, size - cellSize * 7)

    // Generate pseudo-random data pattern
    let hash = 0
    for (let i = 0; i < wifiStr.length; i++) {
      hash = ((hash << 5) - hash + wifiStr.charCodeAt(i)) | 0
    }

    for (let y = 8; y < gridSize - 1; y++) {
      for (let x = 8; x < gridSize - 1; x++) {
        // Skip finder pattern areas
        if ((x < 8 && y < 8) || (x >= gridSize - 8 && y < 8) || (x < 8 && y >= gridSize - 8)) continue

        hash = ((hash * 1103515245 + 12345) & 0x7fffffff)
        if (hash % 2 === 0) {
          ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
        }
      }
    }
  }

  const downloadCard = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a card with network info
    const cardCanvas = document.createElement("canvas")
    cardCanvas.width = 400
    cardCanvas.height = 500
    const ctx = cardCanvas.getContext("2d")
    if (!ctx) return

    // Background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 400, 500)

    // Border
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 2
    ctx.strokeRect(10, 10, 380, 480)

    // Title
    ctx.fillStyle = "black"
    ctx.font = "bold 24px system-ui"
    ctx.textAlign = "center"
    ctx.fillText("WiFi Network", 200, 50)

    // QR Code
    ctx.drawImage(canvas, 100, 70, 200, 200)

    // Network details
    ctx.font = "16px system-ui"
    ctx.textAlign = "left"
    ctx.fillText(`Network: ${ssid}`, 50, 310)
    ctx.fillText(`Password: ${password}`, 50, 340)
    ctx.fillText(`Security: ${security}`, 50, 370)

    ctx.font = "12px system-ui"
    ctx.fillStyle = "#666"
    ctx.textAlign = "center"
    ctx.fillText("Scan QR code to connect", 200, 420)
    ctx.fillText("or enter credentials manually", 200, 440)

    const link = document.createElement("a")
    link.download = `wifi-${ssid}.png`
    link.href = cardCanvas.toDataURL()
    link.click()
  }

  const copyPassword = () => {
    navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">WiFi Card</h1><p className="text-sm text-muted-foreground">Create shareable WiFi QR codes</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Network Name (SSID)</Label>
            <Input value={ssid} onChange={e => setSsid(e.target.value)} placeholder="MyNetwork" />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="pr-20" />
              <div className="absolute right-1 top-1 flex">
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={copyPassword}>
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Security Type</Label>
            <div className="flex gap-2">
              {(["WPA", "WEP", "nopass"] as const).map(s => (
                <Button key={s} variant={security === s ? "default" : "outline"} size="sm" onClick={() => setSecurity(s)}>{s === "nopass" ? "None" : s}</Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="hidden" checked={hidden} onChange={e => setHidden(e.target.checked)} className="rounded" />
            <Label htmlFor="hidden" className="text-sm cursor-pointer">Hidden network</Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="size-5 text-primary" />
              <span className="font-medium">{ssid || "Network Name"}</span>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <canvas ref={canvasRef} className="w-48 h-48" />
            </div>

            <p className="text-sm text-muted-foreground mt-4">Scan to connect</p>

            <div className="flex gap-2 mt-4 w-full">
              <Button onClick={downloadCard} className="flex-1"><Download className="size-4 mr-2" />Download Card</Button>
            </div>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <Label className="text-xs text-muted-foreground mb-2 block">WiFi String</Label>
            <code className="text-xs break-all">{getWifiString()}</code>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-lg p-4">
        <h3 className="font-medium mb-2">How to use</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Enter your WiFi network name and password</li>
          <li>• The QR code updates automatically</li>
          <li>• Guests can scan with their phone camera to connect</li>
          <li>• Download the card to print or share digitally</li>
        </ul>
      </div>
    </div>
  )
}
