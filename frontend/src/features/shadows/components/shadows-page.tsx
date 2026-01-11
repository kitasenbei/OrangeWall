import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function ShadowsPage() {
  const [x, setX] = useState(0)
  const [y, setY] = useState(4)
  const [blur, setBlur] = useState(6)
  const [spread, setSpread] = useState(0)
  const [color, setColor] = useState("#000000")
  const [opacity, setOpacity] = useState(25)
  const [inset, setInset] = useState(false)
  const [copied, setCopied] = useState(false)

  const rgba = `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, ${opacity / 100})`
  const shadow = `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba}`
  const css = `box-shadow: ${shadow};`

  const copy = () => {
    navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const Slider = ({ label, value, setValue, min, max }: { label: string; value: number; setValue: (v: number) => void; min: number; max: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between"><Label>{label}</Label><span className="text-sm text-muted-foreground">{value}px</span></div>
      <input type="range" min={min} max={max} value={value} onChange={e => setValue(Number(e.target.value))} className="w-full" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Box Shadow</h1><p className="text-sm text-muted-foreground">Generate CSS box shadows</p></div>
        <Button onClick={copy}>{copied ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Copy CSS</Button>
      </div>

      <div className="flex items-center justify-center py-16 bg-muted rounded-lg">
        <div className="w-48 h-48 bg-card rounded-lg" style={{ boxShadow: shadow }} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Slider label="Horizontal Offset" value={x} setValue={setX} min={-50} max={50} />
          <Slider label="Vertical Offset" value={y} setValue={setY} min={-50} max={50} />
          <Slider label="Blur Radius" value={blur} setValue={setBlur} min={0} max={100} />
          <Slider label="Spread Radius" value={spread} setValue={setSpread} min={-50} max={50} />
          <div className="space-y-2">
            <div className="flex justify-between"><Label>Opacity</Label><span className="text-sm text-muted-foreground">{opacity}%</span></div>
            <input type="range" min={0} max={100} value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="size-10 rounded cursor-pointer" />
              <Label>Color</Label>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} />
              <Label>Inset</Label>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>CSS Code</Label>
          <div className="bg-card border rounded-lg p-4 font-mono text-sm">{css}</div>
        </div>
      </div>
    </div>
  )
}
