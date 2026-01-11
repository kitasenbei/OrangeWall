import { useState, useEffect, useRef } from "react"
import { QrCode, Download, Copy, Check, Link, Mail, Phone, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type QRType = "text" | "url" | "email" | "phone" | "wifi"

const qrTypes: { type: QRType; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { type: "url", label: "URL", icon: <Link className="size-4" />, placeholder: "https://example.com" },
  { type: "text", label: "Text", icon: <QrCode className="size-4" />, placeholder: "Enter any text..." },
  { type: "email", label: "Email", icon: <Mail className="size-4" />, placeholder: "email@example.com" },
  { type: "phone", label: "Phone", icon: <Phone className="size-4" />, placeholder: "+1234567890" },
  { type: "wifi", label: "WiFi", icon: <Wifi className="size-4" />, placeholder: "Network name" },
]

export function QRCodePage() {
  const [type, setType] = useState<QRType>("url")
  const [content, setContent] = useState("https://example.com")
  const [wifiPassword, setWifiPassword] = useState("")
  const [wifiSecurity, setWifiSecurity] = useState("WPA")
  const [size] = useState(200)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getQRData = () => {
    switch (type) {
      case "email": return `mailto:${content}`
      case "phone": return `tel:${content}`
      case "wifi": return `WIFI:T:${wifiSecurity};S:${content};P:${wifiPassword};;`
      default: return content
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Simple QR-like pattern (placeholder - real QR would need a library)
    const data = getQRData()
    const moduleCount = 25
    const moduleSize = size / moduleCount

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = "#000000"

    // Generate pseudo-random pattern based on content
    const hash = data.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)

    // Draw finder patterns (corners)
    const drawFinder = (x: number, y: number) => {
      ctx.fillRect(x * moduleSize, y * moduleSize, 7 * moduleSize, 7 * moduleSize)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect((x + 1) * moduleSize, (y + 1) * moduleSize, 5 * moduleSize, 5 * moduleSize)
      ctx.fillStyle = "#000000"
      ctx.fillRect((x + 2) * moduleSize, (y + 2) * moduleSize, 3 * moduleSize, 3 * moduleSize)
    }

    drawFinder(0, 0)
    drawFinder(moduleCount - 7, 0)
    drawFinder(0, moduleCount - 7)

    // Draw data modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        // Skip finder pattern areas
        if ((row < 8 && col < 8) || (row < 8 && col > moduleCount - 9) || (row > moduleCount - 9 && col < 8)) continue

        const seed = (hash + row * moduleCount + col) >>> 0
        if (seed % 3 === 0 || seed % 5 === 0) {
          ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [content, type, wifiPassword, wifiSecurity, size])

  const downloadQR = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "qrcode.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  const copyQR = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (blob) {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">QR Code Generator</h1><p className="text-sm text-muted-foreground">Generate QR codes for any content</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">QR Type</Label>
            <div className="flex flex-wrap gap-2">
              {qrTypes.map(t => (
                <Button key={t.type} variant={type === t.type ? "default" : "outline"} size="sm" onClick={() => { setType(t.type); setContent(t.placeholder) }}>
                  {t.icon}<span className="ml-2">{t.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="space-y-2">
              <Label>{type === "wifi" ? "Network Name (SSID)" : qrTypes.find(t => t.type === type)?.label}</Label>
              {type === "text" ? (
                <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder={qrTypes.find(t => t.type === type)?.placeholder} rows={4} />
              ) : (
                <Input value={content} onChange={e => setContent(e.target.value)} placeholder={qrTypes.find(t => t.type === type)?.placeholder} />
              )}
            </div>

            {type === "wifi" && (
              <>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="Network password" />
                </div>
                <div className="space-y-2">
                  <Label>Security</Label>
                  <select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 flex flex-col items-center">
            <canvas ref={canvasRef} width={size} height={size} className="rounded-lg border bg-white" />
            <p className="text-xs text-muted-foreground mt-3 text-center max-w-[200px] truncate">{getQRData()}</p>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={downloadQR}><Download className="size-4 mr-2" />Download PNG</Button>
            <Button variant="outline" className="flex-1" onClick={copyQR}>
              {copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">Note: This is a simplified QR pattern. For production use, integrate a QR library like qrcode.js</p>
        </div>
      </div>
    </div>
  )
}
