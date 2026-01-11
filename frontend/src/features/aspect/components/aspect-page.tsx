import { useState } from "react"
import { Lock, Unlock, Copy, Check, Monitor, Smartphone, Film, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const commonRatios = [
  { name: "16:9", desc: "HD Video, YouTube", icon: Monitor, w: 16, h: 9 },
  { name: "4:3", desc: "Classic TV, iPad", icon: Monitor, w: 4, h: 3 },
  { name: "21:9", desc: "Ultrawide, Cinema", icon: Film, w: 21, h: 9 },
  { name: "1:1", desc: "Square, Instagram", icon: Camera, w: 1, h: 1 },
  { name: "9:16", desc: "Vertical Video, TikTok", icon: Smartphone, w: 9, h: 16 },
  { name: "3:2", desc: "DSLR Photos", icon: Camera, w: 3, h: 2 },
  { name: "2:1", desc: "Univisium", icon: Film, w: 2, h: 1 },
  { name: "1.85:1", desc: "Widescreen Cinema", icon: Film, w: 185, h: 100 },
]

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

function simplifyRatio(w: number, h: number): [number, number] {
  const divisor = gcd(Math.round(w), Math.round(h))
  return [Math.round(w / divisor), Math.round(h / divisor)]
}

export function AspectPage() {
  const [width, setWidth] = useState("1920")
  const [height, setHeight] = useState("1080")
  const [locked, setLocked] = useState(true)
  const [lockedRatio, setLockedRatio] = useState({ w: 16, h: 9 })
  const [copied, setCopied] = useState(false)

  const w = parseFloat(width) || 0
  const h = parseFloat(height) || 0
  const [ratioW, ratioH] = w && h ? simplifyRatio(w, h) : [0, 0]

  const updateWidth = (value: string) => {
    setWidth(value)
    if (locked && value) {
      const newWidth = parseFloat(value)
      const newHeight = (newWidth * lockedRatio.h) / lockedRatio.w
      setHeight(Math.round(newHeight).toString())
    }
  }

  const updateHeight = (value: string) => {
    setHeight(value)
    if (locked && value) {
      const newHeight = parseFloat(value)
      const newWidth = (newHeight * lockedRatio.w) / lockedRatio.h
      setWidth(Math.round(newWidth).toString())
    }
  }

  const setRatio = (rw: number, rh: number) => {
    setLockedRatio({ w: rw, h: rh })
    setLocked(true)
    const newHeight = (w * rh) / rw
    setHeight(Math.round(newHeight).toString())
  }

  const lockCurrentRatio = () => {
    if (w && h) {
      setLockedRatio({ w: ratioW, h: ratioH })
      setLocked(true)
    }
  }

  const copyDimensions = () => {
    navigator.clipboard.writeText(`${width}x${height}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const swapDimensions = () => {
    const tempW = width
    setWidth(height)
    setHeight(tempW)
    if (locked) {
      setLockedRatio({ w: lockedRatio.h, h: lockedRatio.w })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Aspect Ratio Calculator</h1><p className="text-sm text-muted-foreground">Calculate and convert aspect ratios</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input type="number" value={width} onChange={e => updateWidth(e.target.value)} placeholder="1920" />
              </div>
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input type="number" value={height} onChange={e => updateHeight(e.target.value)} placeholder="1080" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant={locked ? "default" : "outline"} size="sm" onClick={() => locked ? setLocked(false) : lockCurrentRatio()}>
                {locked ? <Lock className="size-4 mr-2" /> : <Unlock className="size-4 mr-2" />}
                {locked ? `Locked at ${lockedRatio.w}:${lockedRatio.h}` : "Unlocked"}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={swapDimensions}>Swap W/H</Button>
                <Button variant="outline" size="sm" onClick={copyDimensions}>
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Common Aspect Ratios</Label>
            <div className="grid grid-cols-2 gap-2">
              {commonRatios.map(ratio => (
                <button key={ratio.name} onClick={() => setRatio(ratio.w, ratio.h)} className={`flex items-center gap-3 p-3 rounded-lg border text-left hover:bg-muted ${locked && lockedRatio.w === ratio.w && lockedRatio.h === ratio.h ? "bg-primary/10 border-primary" : ""}`}>
                  <ratio.icon className="size-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">{ratio.name}</div>
                    <div className="text-xs text-muted-foreground">{ratio.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6">
            <Label className="mb-4 block">Preview</Label>
            <div className="flex items-center justify-center bg-muted rounded-lg p-8 min-h-[200px]">
              {w && h ? (
                <div className="relative">
                  <div className="bg-primary/20 border-2 border-primary rounded-lg flex items-center justify-center" style={{
                    width: `${Math.min(200, 200 * (w / Math.max(w, h)))}px`,
                    height: `${Math.min(200, 200 * (h / Math.max(w, h)))}px`,
                  }}>
                    <span className="text-sm font-mono text-primary">{ratioW}:{ratioH}</span>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Enter dimensions</span>
              )}
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <Label className="mb-3 block">Calculated Values</Label>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Aspect Ratio</span>
                <span className="font-mono font-medium">{ratioW && ratioH ? `${ratioW}:${ratioH}` : "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Decimal</span>
                <span className="font-mono font-medium">{w && h ? (w / h).toFixed(4) : "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-mono font-medium">{w && h ? `${width} × ${height}` : "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Total Pixels</span>
                <span className="font-mono font-medium">{w && h ? (w * h).toLocaleString() : "-"}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Megapixels</span>
                <span className="font-mono font-medium">{w && h ? ((w * h) / 1000000).toFixed(2) + " MP" : "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
