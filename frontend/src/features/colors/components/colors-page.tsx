import { useState } from "react"
import { Copy, Check, RefreshCw, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ColorPalette {
  text: string
  background: string
  primary: string
  secondary: string
  accent: string
}

const presetPalettes: { name: string; colors: ColorPalette }[] = [
  { name: "Default", colors: { text: "#050315", background: "#fbfbfe", primary: "#2f27ce", secondary: "#dedcff", accent: "#433bff" } },
  { name: "Forest", colors: { text: "#1a1a2e", background: "#f5f5f5", primary: "#16a34a", secondary: "#dcfce7", accent: "#22c55e" } },
  { name: "Ocean", colors: { text: "#0f172a", background: "#f8fafc", primary: "#0284c7", secondary: "#e0f2fe", accent: "#0ea5e9" } },
  { name: "Sunset", colors: { text: "#1c1917", background: "#fafaf9", primary: "#ea580c", secondary: "#ffedd5", accent: "#f97316" } },
  { name: "Rose", colors: { text: "#1f2937", background: "#fdf2f8", primary: "#db2777", secondary: "#fce7f3", accent: "#ec4899" } },
  { name: "Mono", colors: { text: "#171717", background: "#fafafa", primary: "#404040", secondary: "#e5e5e5", accent: "#737373" } },
]

// Color scheme types like realtimecolors.com
const colorSchemes = [
  "monochromatic",
  "analogous",
  "complementary",
  "triadic",
  "split-complementary",
  "compound",
] as const

type ColorScheme = typeof colorSchemes[number]

// HSL to HEX conversion
function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

// Generate hues based on color scheme
function getSchemeHues(baseHue: number, scheme: ColorScheme): number[] {
  const wrap = (h: number) => ((h % 360) + 360) % 360

  switch (scheme) {
    case "monochromatic":
      return [baseHue, baseHue, baseHue, baseHue]
    case "analogous":
      return [baseHue, wrap(baseHue + 30), wrap(baseHue - 30), wrap(baseHue + 15)]
    case "complementary":
      return [baseHue, wrap(baseHue + 180), baseHue, wrap(baseHue + 180)]
    case "triadic":
      return [baseHue, wrap(baseHue + 120), wrap(baseHue + 240), wrap(baseHue + 60)]
    case "split-complementary":
      return [baseHue, wrap(baseHue + 150), wrap(baseHue + 210), wrap(baseHue + 180)]
    case "compound":
      return [baseHue, wrap(baseHue + 150), wrap(baseHue + 210), wrap(baseHue + 30)]
    default:
      return [baseHue, baseHue, baseHue, baseHue]
  }
}

// Generate a palette using HSL color wheel like realtimecolors.com
function generateRandomPalette(): ColorPalette {
  // Random main hue (0-360 degrees on color wheel)
  const mainHue = Math.floor(Math.random() * 360)

  // Pick a random color scheme
  const scheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]

  // Get hues based on scheme
  const [primaryHue, accentHue, secondaryHue] = getSchemeHues(mainHue, scheme)

  // Generate colors with randomized lightness
  const primary = hslToHex(primaryHue, 70 + Math.random() * 20, 45 + Math.random() * 15)
  const accent = hslToHex(accentHue, 65 + Math.random() * 25, 50 + Math.random() * 15)

  // Secondary is a light tint of the secondary hue
  const secondary = hslToHex(secondaryHue, 20 + Math.random() * 30, 85 + Math.random() * 10)

  // Background is very light, text is very dark (ensuring good contrast)
  const background = hslToHex(mainHue, 5 + Math.random() * 15, 96 + Math.random() * 3)
  const text = hslToHex(mainHue, 30 + Math.random() * 40, 3 + Math.random() * 7)

  return { text, background, primary, secondary, accent }
}

function getContrastRatio(hex1: string, hex2: string): number {
  const getLuminance = (hex: string) => {
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!rgb) return 0
    const [r, g, b] = [1, 2, 3].map(i => {
      const c = parseInt(rgb[i], 16) / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const l1 = getLuminance(hex1)
  const l2 = getLuminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function ColorsPage() {
  const [colors, setColors] = useState<ColorPalette>(presetPalettes[0].colors)
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const displayColors = darkMode ? {
    text: colors.background,
    background: colors.text,
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
  } : colors

  const updateColor = (key: keyof ColorPalette, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }))
  }

  const randomize = () => {
    // Use HSL-based algorithm like realtimecolors.com
    setColors(generateRandomPalette())
  }

  const copyCSS = () => {
    const css = `:root {
  --text: ${colors.text};
  --background: ${colors.background};
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --accent: ${colors.accent};
}`
    navigator.clipboard.writeText(css)
    setCopied('css')
    setTimeout(() => setCopied(null), 1500)
  }

  const copyTailwind = () => {
    const config = `colors: {
  text: '${colors.text}',
  background: '${colors.background}',
  primary: '${colors.primary}',
  secondary: '${colors.secondary}',
  accent: '${colors.accent}',
}`
    navigator.clipboard.writeText(config)
    setCopied('tailwind')
    setTimeout(() => setCopied(null), 1500)
  }

  const contrast = getContrastRatio(displayColors.text, displayColors.background)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Realtime Colors</h1><p className="text-sm text-muted-foreground">Visualize your color palette on a real site</p></div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button variant="outline" onClick={randomize}><RefreshCw className="size-4 mr-2" />Randomize</Button>
          <Button variant="outline" onClick={copyCSS}>
            {copied === 'css' ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}CSS
          </Button>
          <Button variant="outline" onClick={copyTailwind}>
            {copied === 'tailwind' ? <Check className="size-4 mr-2 text-green-500" /> : <Copy className="size-4 mr-2" />}Tailwind
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Color Controls */}
        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4 space-y-4">
            <h2 className="font-medium">Colors</h2>
            {(Object.keys(colors) as (keyof ColorPalette)[]).map(key => (
              <div key={key} className="flex items-center gap-3">
                <input type="color" value={colors[key]} onChange={e => updateColor(key, e.target.value)} className="size-10 rounded cursor-pointer border-0 p-0" />
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground capitalize">{key}</Label>
                  <Input value={colors[key]} onChange={e => updateColor(key, e.target.value)} className="h-8 font-mono text-sm" />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Contrast Ratio</span>
                <span className={contrast >= 4.5 ? "text-green-500 font-medium" : contrast >= 3 ? "text-yellow-500 font-medium" : "text-red-500 font-medium"}>
                  {contrast.toFixed(2)}:1 {contrast >= 7 ? "AAA" : contrast >= 4.5 ? "AA" : contrast >= 3 ? "AA Large" : "Fail"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h2 className="font-medium">Presets</h2>
            <div className="grid grid-cols-2 gap-2">
              {presetPalettes.map(preset => (
                <button key={preset.name} onClick={() => setColors(preset.colors)} className="text-left p-2 rounded-lg border hover:border-primary transition-colors">
                  <div className="flex gap-1 mb-1">
                    {Object.values(preset.colors).map((c, i) => (
                      <div key={i} className="size-4 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-xs">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Website Preview */}
        <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: displayColors.background, color: displayColors.text }}>
          {/* Navbar */}
          <nav className="border-b px-6 py-4 flex items-center justify-between" style={{ borderColor: displayColors.secondary }}>
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg" style={{ backgroundColor: displayColors.primary }} />
              <span className="font-bold text-lg">Brand</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a href="#" className="hover:opacity-70">Home</a>
              <a href="#" className="hover:opacity-70">Features</a>
              <a href="#" className="hover:opacity-70">Pricing</a>
              <a href="#" className="hover:opacity-70">About</a>
              <button className="px-4 py-2 rounded-lg text-white" style={{ backgroundColor: displayColors.primary }}>Sign Up</button>
            </div>
          </nav>

          {/* Hero Section */}
          <section className="px-6 py-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Build something amazing</h1>
            <p className="text-lg opacity-70 max-w-2xl mx-auto mb-8">
              Create beautiful, responsive websites with our modern design system. Start building today with confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: displayColors.primary }}>
                Get Started
              </button>
              <button className="px-6 py-3 rounded-lg font-medium border" style={{ borderColor: displayColors.primary, color: displayColors.primary }}>
                Learn More
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-12" style={{ backgroundColor: displayColors.secondary }}>
            <h2 className="text-2xl font-bold text-center mb-8">Features</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {['Fast Performance', 'Easy to Use', 'Fully Responsive'].map((feature, i) => (
                <div key={i} className="p-6 rounded-lg" style={{ backgroundColor: displayColors.background }}>
                  <div className="size-10 rounded-lg mb-4 flex items-center justify-center text-white" style={{ backgroundColor: displayColors.accent }}>
                    {i + 1}
                  </div>
                  <h3 className="font-semibold mb-2">{feature}</h3>
                  <p className="text-sm opacity-70">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="px-6 py-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to start?</h2>
            <p className="opacity-70 mb-6">Join thousands of developers building with our platform.</p>
            <button className="px-8 py-3 rounded-lg text-white font-medium" style={{ backgroundColor: displayColors.accent }}>
              Start Free Trial
            </button>
          </section>

          {/* Footer */}
          <footer className="border-t px-6 py-6" style={{ borderColor: displayColors.secondary }}>
            <div className="flex items-center justify-between text-sm opacity-70">
              <span>© 2025 Brand. All rights reserved.</span>
              <div className="flex gap-4">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}
