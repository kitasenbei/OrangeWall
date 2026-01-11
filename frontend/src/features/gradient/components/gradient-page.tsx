import { useState } from "react"
import { Copy, Check, Plus, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GradientPage() {
  const [colors, setColors] = useState(["#667eea", "#764ba2"])
  const [angle, setAngle] = useState(135)
  const [type, setType] = useState<"linear" | "radial">("linear")
  const [copied, setCopied] = useState(false)

  const gradient = type === "linear"
    ? `linear-gradient(${angle}deg, ${colors.join(", ")})`
    : `radial-gradient(circle, ${colors.join(", ")})`

  const css = `background: ${gradient};`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const addColor = () => setColors([...colors, "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")])
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i))
  const updateColor = (i: number, color: string) => setColors(colors.map((c, idx) => idx === i ? color : c))

  const randomize = () => {
    const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
    setColors([randomColor(), randomColor()])
    setAngle(Math.floor(Math.random() * 360))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Gradient Generator</h1><p className="text-sm text-muted-foreground">Create beautiful CSS gradients</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={randomize}><RefreshCw className="size-4 mr-2" />Random</Button>
          <Button onClick={copy}>{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy CSS</Button>
        </div>
      </div>

      <div className="h-64 rounded-lg border" style={{ background: gradient }} />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant={type === "linear" ? "default" : "outline"} onClick={() => setType("linear")}>Linear</Button>
            <Button variant={type === "radial" ? "default" : "outline"} onClick={() => setType("radial")}>Radial</Button>
          </div>

          {type === "linear" && (
            <div className="space-y-2">
              <Label>Angle: {angle}°</Label>
              <input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} className="w-full" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Colors</Label>
              <Button size="sm" variant="outline" onClick={addColor}><Plus className="size-4" /></Button>
            </div>
            {colors.map((color, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" value={color} onChange={e => updateColor(i, e.target.value)} className="size-10 rounded cursor-pointer" />
                <Input value={color} onChange={e => updateColor(i, e.target.value)} className="font-mono flex-1" />
                {colors.length > 2 && <Button size="icon" variant="ghost" onClick={() => removeColor(i)}><Trash2 className="size-4" /></Button>}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>CSS Code</Label>
          <div className="bg-card border rounded-lg p-4 font-mono text-sm">{css}</div>
          <Label className="mt-4">Tailwind (arbitrary)</Label>
          <div className="bg-card border rounded-lg p-4 font-mono text-sm break-all">bg-[{gradient.replace(/ /g, "_")}]</div>
        </div>
      </div>
    </div>
  )
}
