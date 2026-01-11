import { useState } from "react"
import { DollarSign, Users, Percent } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const tipPresets = [10, 15, 18, 20, 25]

export function TipPage() {
  const [bill, setBill] = useState(50)
  const [tipPercent, setTipPercent] = useState(18)
  const [people, setPeople] = useState(1)

  const tipAmount = (bill * tipPercent) / 100
  const total = bill + tipAmount
  const perPerson = total / people
  const tipPerPerson = tipAmount / people

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold tracking-tight">Tip Calculator</h1><p className="text-sm text-muted-foreground">Calculate tips and split bills</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><DollarSign className="size-4" />Bill Amount</Label>
            <Input type="number" value={bill} onChange={e => setBill(parseFloat(e.target.value) || 0)} min={0} step={0.01} />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Percent className="size-4" />Tip Percentage: {tipPercent}%</Label>
            <div className="flex gap-2 flex-wrap">
              {tipPresets.map(p => (
                <Button key={p} size="sm" variant={tipPercent === p ? "default" : "outline"} onClick={() => setTipPercent(p)}>{p}%</Button>
              ))}
            </div>
            <input type="range" min={0} max={50} value={tipPercent} onChange={e => setTipPercent(Number(e.target.value))} className="w-full" />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Users className="size-4" />Split Between</Label>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="outline" onClick={() => setPeople(Math.max(1, people - 1))}>-</Button>
              <Input type="number" value={people} onChange={e => setPeople(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center" min={1} />
              <Button size="icon" variant="outline" onClick={() => setPeople(people + 1)}>+</Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Bill</span>
              <span className="text-xl font-semibold">${bill.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Tip ({tipPercent}%)</span>
              <span className="text-xl font-semibold text-green-500">${tipAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-2xl font-bold">${total.toFixed(2)}</span>
            </div>
          </div>

          {people > 1 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Per Person</span>
                <span className="text-2xl font-bold">${perPerson.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tip per person</span>
                <span className="text-green-500">${tipPerPerson.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
