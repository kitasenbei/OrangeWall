import { useState } from "react"
import { Delete, Divide, X, Minus, Plus, Equal, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CalculatorPage() {
  const [display, setDisplay] = useState("0")
  const [equation, setEquation] = useState("")
  const [hasResult, setHasResult] = useState(false)

  const handleNumber = (num: string) => {
    if (hasResult) {
      setDisplay(num)
      setEquation("")
      setHasResult(false)
    } else if (display === "0" && num !== ".") {
      setDisplay(num)
    } else if (num === "." && display.includes(".")) {
      return
    } else {
      setDisplay(display + num)
    }
  }

  const handleOperator = (op: string) => {
    setEquation(display + " " + op + " ")
    setDisplay("0")
    setHasResult(false)
  }

  const handleEqual = () => {
    try {
      const fullEquation = equation + display
      const sanitized = fullEquation
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/%/g, "/100")
      const result = eval(sanitized)
      setDisplay(String(parseFloat(result.toFixed(10))))
      setEquation(fullEquation + " =")
      setHasResult(true)
    } catch {
      setDisplay("Error")
      setHasResult(true)
    }
  }

  const handleClear = () => {
    setDisplay("0")
    setEquation("")
    setHasResult(false)
  }

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1))
    } else {
      setDisplay("0")
    }
  }

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100))
  }

  const handlePlusMinus = () => {
    setDisplay(String(parseFloat(display) * -1))
  }

  const buttons = [
    { label: "C", action: handleClear, variant: "secondary" as const },
    { label: "±", action: handlePlusMinus, variant: "secondary" as const },
    { label: "%", action: handlePercent, variant: "secondary" as const, icon: Percent },
    { label: "÷", action: () => handleOperator("÷"), variant: "accent" as const, icon: Divide },
    { label: "7", action: () => handleNumber("7") },
    { label: "8", action: () => handleNumber("8") },
    { label: "9", action: () => handleNumber("9") },
    { label: "×", action: () => handleOperator("×"), variant: "accent" as const, icon: X },
    { label: "4", action: () => handleNumber("4") },
    { label: "5", action: () => handleNumber("5") },
    { label: "6", action: () => handleNumber("6") },
    { label: "−", action: () => handleOperator("-"), variant: "accent" as const, icon: Minus },
    { label: "1", action: () => handleNumber("1") },
    { label: "2", action: () => handleNumber("2") },
    { label: "3", action: () => handleNumber("3") },
    { label: "+", action: () => handleOperator("+"), variant: "accent" as const, icon: Plus },
    { label: "0", action: () => handleNumber("0"), wide: true },
    { label: ".", action: () => handleNumber(".") },
    { label: "=", action: handleEqual, variant: "primary" as const, icon: Equal },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calculator</h1>
        <p className="text-sm text-muted-foreground">Basic calculator</p>
      </div>

      <div className="bg-card border rounded-2xl p-4 space-y-4">
        {/* Display */}
        <div className="bg-muted rounded-xl p-4 text-right">
          <div className="text-sm text-muted-foreground h-6 truncate">{equation}</div>
          <div className="text-4xl font-light truncate">{display}</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((btn, i) => (
            <Button
              key={i}
              variant={btn.variant === "primary" ? "default" : btn.variant === "accent" ? "secondary" : "outline"}
              className={cn(
                "h-14 text-xl font-medium",
                btn.wide && "col-span-2",
                btn.variant === "accent" && "bg-orange-500 hover:bg-orange-600 text-white",
                btn.variant === "primary" && "bg-primary"
              )}
              onClick={btn.action}
            >
              {btn.icon ? <btn.icon className="size-5" /> : btn.label}
            </Button>
          ))}
        </div>

        {/* Delete button */}
        <Button variant="ghost" className="w-full" onClick={handleDelete}>
          <Delete className="size-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}
